import type {
  BriefingSnapshot,
  IndexQuote,
  ProxyCoverageRow,
  ProxySeriesResponse,
  Security,
  Timeframe
} from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listSecurities(): Promise<Security[]> {
    return getJson(`/api/securities`);
  },
  searchSecurities(query: string): Promise<Security[]> {
    return getJson(`/api/securities/search?q=${encodeURIComponent(query)}`);
  },
  getBriefings(tickers: string[]): Promise<BriefingSnapshot[]> {
    return getJson(`/api/briefings?tickers=${tickers.join(",")}`);
  },
  getBriefing(ticker: string): Promise<BriefingSnapshot> {
    return getJson(`/api/briefings/${ticker}`);
  },
  getIndices(): Promise<IndexQuote[]> {
    return getJson(`/api/indices`);
  },
  getProxySeries(target: string, timeframe: Timeframe): Promise<ProxySeriesResponse> {
    return getJson(`/api/proxy/series?target=${encodeURIComponent(target)}&tf=${encodeURIComponent(timeframe)}`);
  },
  getProxyCoverage(tickers: string[]): Promise<ProxyCoverageRow[]> {
    return getJson(`/api/proxy/coverage?tickers=${tickers.join(",")}`);
  }
};
