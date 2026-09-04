import { supabase } from "../supabaseClient.js";
import { liveProvidersConfigured } from "../env.js";
import { withCache } from "../lib/cache.js";
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
 * 나머지 다섯 개(공시·컨센서스·수급·뉴스·AI 신호 스펙트럼)는 서로 의존하지 않으므로
 * 동시에 실행한다. 예전에는 이걸 하나씩 순서대로 기다렸는데, 그러면 총 대기 시간이
 * 각 타임아웃의 합(30초+)까지 늘어나서 /api/briefings 요청 전체가 멈춘 것처럼 보였다 —
 * 병렬로 돌리면 가장 느린 하나만큼만 기다리면 된다.
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

  const [dartResult, consensusResult, krxResult, newsResult, aiVerdictResult] = await Promise.allSettled([
    liveProvidersConfigured.dart
      ? withCache(`dart:${ticker}`, TTL.filings, () => fetchDartFilings(ticker))
      : Promise.resolve(null),
    withCache(`consensus:${ticker}`, TTL.consensus, () => fetchConsensus(ticker, currentPrice)),
    liveProvidersConfigured.krx ? withCache(`krx:${ticker}`, TTL.flows, () => fetchKrxFlows(ticker)) : Promise.resolve(null),
    liveProvidersConfigured.newsAi
      ? withCache(`news:${ticker}`, TTL.news, () => fetchGroundedNews(snapshot.name, ticker))
      : Promise.resolve(null),
    // 이미 모아둔 근거(factors)·컨센서스·뉴스·수급을 그대로 넘겨 점수화만 시키는 것이라
    // 여기서는 이번 요청에서 새로 받은 라이브 값이 아니라 base(mock/DB) 스냅샷 기준으로 판단한다 —
    // 병렬로 돌리는 다른 호출들의 결과를 기다리지 않아도 되게 하기 위한 절충이다.
    liveProvidersConfigured.newsAi
      ? withCache(`ai-verdict:${ticker}`, TTL.aiVerdict, () => fetchAiVerdict(snapshot))
      : Promise.resolve(null)
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

  if (newsResult.status === "fulfilled") {
    if (newsResult.value?.length) snapshot.news = newsResult.value;
  } else {
    console.warn(`[news] ${ticker} 뉴스 조회 실패, mock 값 유지:`, newsResult.reason?.message ?? newsResult.reason);
  }

  if (aiVerdictResult.status === "fulfilled") {
    if (aiVerdictResult.value) {
      snapshot.aiVerdict = { ...aiVerdictResult.value, updatedAt: new Date().toISOString() };
    }
  } else {
    // 실패하면 그냥 필드를 안 채운다 — 근거 없는 점수를 지어내 보여주는 것보다 위젯을
    // 아예 숨기는 쪽(프론트에서 aiVerdict 없으면 렌더링 안 함)이 안전하다.
    console.warn(`[ai-verdict] ${ticker} 조회 실패:`, aiVerdictResult.reason?.message ?? aiVerdictResult.reason);
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
