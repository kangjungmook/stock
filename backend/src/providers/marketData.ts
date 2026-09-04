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
  flows: 30 * 60_000 // 30분
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

  if (liveProvidersConfigured.dart) {
    try {
      const filings = await withCache(`dart:${ticker}`, TTL.filings, () => fetchDartFilings(ticker));
      if (filings.length) snapshot.filings = filings;
    } catch (error) {
      console.warn(`[dart] ${ticker} 공시 조회 실패, mock 값 유지:`, (error as Error).message);
    }
  }

  try {
    const currentPrice = parseWon(snapshot.price);
    const result = await withCache(`consensus:${ticker}`, TTL.consensus, () => fetchConsensus(ticker, currentPrice));
    if (result) {
      snapshot.consensus = result.consensus;
      if (result.opinions.length) snapshot.opinions = result.opinions;
    }
  } catch (error) {
    console.warn(`[consensus] ${ticker} 조회 실패, mock 값 유지:`, (error as Error).message);
  }

  if (liveProvidersConfigured.krx) {
    try {
      const flows = await withCache(`krx:${ticker}`, TTL.flows, () => fetchKrxFlows(ticker));
      if (flows.length) snapshot.flows = flows;
    } catch (error) {
      console.warn(`[krx] ${ticker} 수급 조회 실패, mock 값 유지:`, (error as Error).message);
    }
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
