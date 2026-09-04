import { supabase } from "../supabaseClient.js";
import { UNIVERSE, searchUniverse } from "../data/universe.js";
import { getMockBriefing, getMockBriefings } from "../data/mockBriefings.js";
import { getMockIndices } from "../data/mockIndices.js";
import { generateProxySeries, getProxyConfig, proxyCoverageRows } from "../data/mockProxy.js";
import type { BriefingSnapshot, IndexQuote, ProxyCoverageRow, ProxySeriesResponse, Security, Timeframe } from "../types.js";

/**
 * Supabase가 설정돼 있으면 briefing_snapshots / market_indices 테이블을 캐시로 쓴다.
 * 값이 없으면 mock 데이터로 채우고 그 결과를 테이블에 써 둔다(캐시 워밍) — 그래서 DB가 있든
 * 없든 API 응답 모양은 동일하다. 실 데이터 소스가 들어오면 providers/README.md를 참고해
 * mock 호출을 실 provider 호출로 바꾸면 된다.
 */

export function listSecurities(): Security[] {
  return UNIVERSE;
}

export function searchSecurities(query: string): Security[] {
  return searchUniverse(query);
}

export async function getBriefing(ticker: string): Promise<BriefingSnapshot | null> {
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
