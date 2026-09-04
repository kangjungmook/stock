import type {
  BriefingSnapshot,
  IndexQuote,
  ProxyCoverageRow,
  ProxySeriesResponse,
  Security,
  Timeframe
} from "./types";

// 끝에 슬래시가 붙어 있어도(예: 배포 환경변수에 흔히 실수로 들어가는 형태) 안전하게 처리한다 —
// 안 그러면 "//api/..." 형태가 되어 Express가 매칭하지 못하고 404가 난다.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8787").replace(/\/+$/, "");

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
