import { supabase } from "../supabaseClient.js";
import { liveProvidersConfigured } from "../env.js";
import { staleWhileRevalidate } from "../lib/cache.js";
import { UNIVERSE, searchUniverse } from "../data/universe.js";
import { getMockBriefing } from "../data/mockBriefings.js";
import { getMockIndices } from "../data/mockIndices.js";
import { generateProxySeries, getProxyConfig, proxyCoverageRows } from "../data/mockProxy.js";
import { fetchDartFilings } from "./live/dartProvider.js";
import { fetchTossQuote } from "./live/tossProvider.js";
import { fetchConsensus } from "./live/consensusProvider.js";
import { fetchKrxFlows } from "./live/krxFlowsProvider.js";
import { fetchGroundedNews } from "./live/newsProvider.js";
import { fetchAiVerdict } from "./live/aiVerdictProvider.js";
import type { BriefingSnapshot, IndexQuote, ProxyCoverageRow, ProxySeriesResponse, Security, Timeframe } from "../types.js";

/**
 * Supabase가 설정돼 있으면 briefing_snapshots / market_indices 테이블을 "서사" 캐시로 쓴다
 * (헤드라인·판단근거·적중률처럼 자주 안 바뀌는 값). 값이 없으면 mock으로 채우고 써 둔다.
 *
 * 그 위에 시세(토스)·공시(DART)·컨센서스(크롤링)·수급(KRX)은 도메인별로 짧은 TTL
 * in-memory 캐시를 두고 매번 실 provider를 시도한다 — 해당 키가 없거나 호출이 실패하면
 * 조용히 mock/캐시된 base 값으로 폴백한다. 자세한 신뢰도는 providers/README.md 참고.
 */

const TTL = {
  quote: 60_000, // 1분
  filings: 30 * 60_000, // 30분
  consensus: 60 * 60_000, // 1시간
  flows: 30 * 60_000, // 30분
  news: 20 * 60_000, // 20분 — Google Search grounding은 검색 1회당 과금되므로 넉넉하게
  aiVerdict: 20 * 60_000 // 20분 — 마찬가지로 호출 1회당 과금되니 뉴스와 같은 주기로 아낀다
};

export function listSecurities(): Security[] {
  return UNIVERSE;
}

export function searchSecurities(query: string): Security[] {
  return searchUniverse(query);
}

async function getBaseBriefing(ticker: string): Promise<BriefingSnapshot | null> {
  if (supabase) {
    const { data } = await supabase.from("briefing_snapshots").select("payload").eq("ticker", ticker).maybeSingle();
    if (data?.payload) return data.payload as BriefingSnapshot;
  }
  const mock = getMockBriefing(ticker);
  if (mock && supabase) {
    // briefing_snapshots.ticker → securities.ticker FK가 있으므로 먼저 종목 행을 보장한다.
    const meta = UNIVERSE.find((u) => u.ticker === ticker);
    if (meta) await supabase.from("securities").upsert(meta);
    await supabase.from("briefing_snapshots").upsert({ ticker, payload: mock, updated_at: new Date().toISOString() });
  }
  return mock;
}

function parseWon(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, "")) || 0;
}

/**
 * /api/briefings는 절대 외부 API를 기다리면 안 된다 — 토스·DART·컨센서스 크롤링·KRX·
 * Gemini 중 단 하나만 느려지거나(외부 서버 상태는 우리가 통제 불가) 막혀도 응답 전체가
 * 그만큼 느려지는 게 예전 구조의 근본 문제였다. 그래서 여섯 개 전부 staleWhileRevalidate로
 * 처리한다 — 캐시에 값이 있으면(오래됐어도) 즉시 그걸 쓰고, 없거나 만료됐으면 mock/이전
 * 값으로 즉시 폴백하면서 백그라운드로 새로 받아와 캐시만 채운다. 그 결과 이 함수는
 * 외부 네트워크를 단 한 번도 기다리지 않고 항상 즉시 반환한다. 다음 요청(수동 새로고침·
 * 15분 자동 갱신)부터 캐시가 채워진 값이 바로 보인다.
 */
async function enrichWithLiveData(ticker: string, base: BriefingSnapshot): Promise<BriefingSnapshot> {
  const snapshot: BriefingSnapshot = { ...base };

  if (liveProvidersConfigured.toss) {
    const quote = staleWhileRevalidate(`toss:${ticker}`, TTL.quote, () => fetchTossQuote(ticker));
    if (quote) {
      snapshot.price = quote.price;
      snapshot.changePct = quote.changePct;
      snapshot.dir = quote.dir;
      snapshot.series = quote.series;
      snapshot.quoteError = false;
    }
  }

  const currentPrice = parseWon(snapshot.price);

  if (liveProvidersConfigured.dart) {
    const filings = staleWhileRevalidate(`dart:${ticker}`, TTL.filings, () => fetchDartFilings(ticker));
    if (filings?.length) snapshot.filings = filings;
  }

  // currentPrice는 이번 요청에서 새로 받은 라이브 시세가 아니라 캐시된(혹은 mock) 값
  // 기준일 수 있다 — 컨센서스도 어차피 기다리지 않으므로 완벽히 동기화할 필요는 없다.
  const consensus = staleWhileRevalidate(`consensus:${ticker}`, TTL.consensus, () => fetchConsensus(ticker, currentPrice));
  if (consensus) {
    snapshot.consensus = consensus.consensus;
    if (consensus.opinions.length) snapshot.opinions = consensus.opinions;
  }

  if (liveProvidersConfigured.krx) {
    const flows = staleWhileRevalidate(`krx:${ticker}`, TTL.flows, () => fetchKrxFlows(ticker));
    if (flows?.length) snapshot.flows = flows;
  }

  if (liveProvidersConfigured.newsAi) {
    const news = staleWhileRevalidate(`news:${ticker}`, TTL.news, () => fetchGroundedNews(snapshot.name, ticker));
    if (news?.length) snapshot.news = news;

    // 이미 모아둔 근거(factors)·컨센서스·뉴스·수급을 그대로 넘겨 점수화만 시키는 것이라
    // base(mock/DB) 스냅샷 기준으로 판단한다. updatedAt은 실제로 받아온 시점 기준으로
    // 캐시에 같이 저장해야 한다 — 읽을 때마다 지금 시각으로 새로 찍으면 오래된 캐시값인데도
    // "방금 갱신됨"처럼 보이게 된다.
    const aiVerdict = staleWhileRevalidate(`ai-verdict:${ticker}`, TTL.aiVerdict, async () => {
      const result = await fetchAiVerdict(snapshot);
      return result ? { ...result, updatedAt: new Date().toISOString() } : null;
    });
    if (aiVerdict) snapshot.aiVerdict = aiVerdict;
  }

  return snapshot;
}

export async function getBriefing(ticker: string): Promise<BriefingSnapshot | null> {
  const base = await getBaseBriefing(ticker);
  if (!base) return null;
  return enrichWithLiveData(ticker, base);
}

export async function getBriefings(tickers: string[]): Promise<BriefingSnapshot[]> {
  const results = await Promise.all(tickers.map((t) => getBriefing(t)));
  return results.filter((b): b is BriefingSnapshot => !!b);
}

export async function getIndices(): Promise<IndexQuote[]> {
  if (supabase) {
    const { data } = await supabase.from("market_indices").select("payload").eq("id", "latest").maybeSingle();
    if (data?.payload) return data.payload as IndexQuote[];
  }
  const mock = getMockIndices();
  if (supabase) {
    await supabase.from("market_indices").upsert({ id: "latest", payload: mock, updated_at: new Date().toISOString() });
  }
  return mock;
}

export function getProxySeries(target: string, timeframe: Timeframe): ProxySeriesResponse {
  const { est, act } = generateProxySeries(target, timeframe);
  return { target, timeframe, est, act, cfg: getProxyConfig(target) };
}

export function getProxyCoverage(tickers: string[]): ProxyCoverageRow[] {
  return proxyCoverageRows(tickers);
}
