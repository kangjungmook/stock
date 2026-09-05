import { supabase } from "../supabaseClient.js";
import { liveProvidersConfigured } from "../env.js";
import { withCache, staleWhileRevalidate } from "../lib/cache.js";
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
 * 시세(토스)를 먼저 기다린 다음(컨센서스의 "여력 %" 계산에 실제 현재가가 필요하므로),
 * 공시·컨센서스·수급은 서로 의존하지 않으므로 동시에 실행한다. 예전에는 이걸 하나씩
 * 순서대로 기다렸는데, 그러면 총 대기 시간이 각 타임아웃의 합(30초+)까지 늘어나서
 * /api/briefings 요청 전체가 멈춘 것처럼 보였다 — 병렬로 돌리면 가장 느린 하나만큼만
 * 기다리면 된다.
 *
 * 뉴스·AI 신호 스펙트럼은 Gemini 호출이라 몇 초씩 걸릴 수 있어서, 이 요청 안에서는
 * 아예 기다리지 않는다(staleWhileRevalidate) — 캐시에 값이 있으면 그걸 즉시 쓰고,
 * 없으면 mock으로 폴백하면서 백그라운드로 새로 받아와 캐시만 채워 둔다. 다음 요청
 * (수동 새로고침·15분 자동 갱신)부터 바로 반영된다.
 */
async function enrichWithLiveData(ticker: string, base: BriefingSnapshot): Promise<BriefingSnapshot> {
  const snapshot: BriefingSnapshot = { ...base };

  if (liveProvidersConfigured.toss) {
    try {
      const quote = await withCache(`toss:${ticker}`, TTL.quote, () => fetchTossQuote(ticker));
      if (quote) {
        snapshot.price = quote.price;
        snapshot.changePct = quote.changePct;
        snapshot.dir = quote.dir;
        snapshot.series = quote.series;
        snapshot.quoteError = false;
      }
    } catch (error) {
      console.warn(`[toss] ${ticker} 시세 조회 실패, mock 값 유지:`, (error as Error).message);
      snapshot.quoteError = true;
    }
  }

  const currentPrice = parseWon(snapshot.price);

  const [dartResult, consensusResult, krxResult] = await Promise.allSettled([
    liveProvidersConfigured.dart
      ? withCache(`dart:${ticker}`, TTL.filings, () => fetchDartFilings(ticker))
      : Promise.resolve(null),
    withCache(`consensus:${ticker}`, TTL.consensus, () => fetchConsensus(ticker, currentPrice)),
    liveProvidersConfigured.krx ? withCache(`krx:${ticker}`, TTL.flows, () => fetchKrxFlows(ticker)) : Promise.resolve(null)
  ]);

  if (dartResult.status === "fulfilled") {
    if (dartResult.value?.length) snapshot.filings = dartResult.value;
  } else {
    console.warn(`[dart] ${ticker} 공시 조회 실패, mock 값 유지:`, dartResult.reason?.message ?? dartResult.reason);
  }

  if (consensusResult.status === "fulfilled") {
    if (consensusResult.value) {
      snapshot.consensus = consensusResult.value.consensus;
      if (consensusResult.value.opinions.length) snapshot.opinions = consensusResult.value.opinions;
    }
  } else {
    console.warn(`[consensus] ${ticker} 조회 실패, mock 값 유지:`, consensusResult.reason?.message ?? consensusResult.reason);
  }

  if (krxResult.status === "fulfilled") {
    if (krxResult.value?.length) snapshot.flows = krxResult.value;
  } else {
    console.warn(`[krx] ${ticker} 수급 조회 실패, mock 값 유지:`, krxResult.reason?.message ?? krxResult.reason);
  }

  if (liveProvidersConfigured.newsAi) {
    const news = staleWhileRevalidate(`news:${ticker}`, TTL.news, () => fetchGroundedNews(snapshot.name, ticker));
    if (news?.length) snapshot.news = news;

    // 이미 모아둔 근거(factors)·컨센서스·뉴스·수급을 그대로 넘겨 점수화만 시키는 것이라
    // base(mock/DB) 스냅샷 기준으로 판단한다 — 어차피 이번 요청 안에서 결과를 안 기다리므로
    // 최신 라이브 값을 넘길 필요가 없다. updatedAt은 실제로 받아온 시점 기준으로 캐시에
    // 같이 저장해야 한다 — 읽을 때마다 지금 시각으로 새로 찍으면 오래된 캐시값인데도
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
