import { findSecurity } from "./universe.js";
import type { ProxyConfig, ProxyPoint, Timeframe } from "../types.js";

/** design/Stock Briefing Dashboard.dc.html의 PROXY/TF_STEP/proxySeries()를 그대로 옮김. */
const PROXY: Record<string, { base: number; est: number; quality: "high" | "low" }> = {
  MARKET: { base: 20.56, est: 20.69, quality: "high" },
  "005930": { base: 20.56, est: 20.69, quality: "high" },
  "000660": { base: 20.56, est: 20.81, quality: "high" },
  "005380": { base: 20.56, est: 20.52, quality: "high" },
  "035720": { base: 20.56, est: 20.44, quality: "low" }
};

const TF_STEP: Record<Timeframe, number> = {
  "1분": 60,
  "15분": 900,
  "1시간": 3600,
  "4시간": 14400,
  일: 86400,
  주: 604800,
  월: 2592000
};

export function getProxyConfig(target: string): ProxyConfig {
  const cfg = PROXY[target] || PROXY["005930"];
  return { target, base: cfg.base, est: cfg.est, quality: cfg.quality };
}

export function hasProxyCoverage(ticker: string): boolean {
  return ticker in PROXY && ticker !== "MARKET";
}

export function proxyCoverageTickers(): string[] {
  return Object.keys(PROXY).filter((t) => t !== "MARKET");
}

/** 결정론적 의사난수 시계열 — 같은 target/timeframe이면 항상 같은 모양이 나온다. */
export function generateProxySeries(target: string, timeframe: Timeframe): { est: ProxyPoint[]; act: ProxyPoint[] } {
  const cfg = PROXY[target] || PROXY["005930"];
  const step = TF_STEP[timeframe];
  const n = 90;
  const end = Math.floor(Date.now() / 1000 / step) * step;
  let seed = target.split("").reduce((a, c) => a + c.charCodeAt(0), timeframe.length * 17);
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648 - 0.5;
  };

  const est: ProxyPoint[] = [];
  const act: ProxyPoint[] = [];
  let v = cfg.base - (cfg.est - cfg.base) * 6;
  for (let i = 0; i < n; i++) {
    const t = end - (n - 1 - i) * step;
    v += (cfg.est - v) * 0.06 + rnd() * cfg.base * 0.0022;
    est.push({ time: t, value: Number(v.toFixed(3)) });
    if (i < n - 18) {
      act.push({ time: t, value: Number((v - (cfg.est - cfg.base) * 0.55 + rnd() * cfg.base * 0.0014).toFixed(3)) });
    }
  }
  est[est.length - 1].value = cfg.est;
  if (act.length) act[act.length - 1].value = Number(cfg.base.toFixed(2));
  return { est, act };
}

export function proxyCoverageRows(tickers: string[]) {
  return tickers
    .filter(hasProxyCoverage)
    .map((ticker) => {
      const meta = findSecurity(ticker);
      const cfg = PROXY[ticker];
      const diff = cfg.est - cfg.base;
      const pct = (diff / cfg.base) * 100;
      return {
        ticker,
        name: meta ? meta.name : ticker,
        quality: cfg.quality,
        diffPct: Number(pct.toFixed(2))
      };
    });
}
