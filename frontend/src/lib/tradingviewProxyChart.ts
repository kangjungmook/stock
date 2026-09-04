/**
 * 개장 전 추정가 차트 — TradingView Lightweight Charts 연동.
 * design/tradingview-proxy-chart.js 원본을 그대로 TS로 옮김.
 *
 * 함정: 시리즈/축 색상에 oklch()를 넘기면 파싱하지 못해 아무것도 그려지지 않는다.
 * CSS 변수는 반드시 rgb()/rgba() 값으로 정의해서 넘길 것 (styles/tokens.css의 --proxy-*-rgb 참고).
 */
import type { IChartApi, ISeriesApi, LineData, UTCTimestamp } from "lightweight-charts";

export const TF_STEP: Record<string, number> = {
  "1분": 60,
  "15분": 900,
  "1시간": 3600,
  "4시간": 14400,
  일: 86400,
  주: 604800,
  월: 2592000
};

export interface ChartPalette {
  est: string;
  act: string;
  text: string;
  grid: string;
}

export const CHART_COLORS: Record<"dark" | "light", ChartPalette> = {
  dark: {
    est: "rgb(124,163,146)",
    act: "rgb(150,226,199)",
    text: "rgb(151,161,157)",
    grid: "rgba(233,241,237,0.09)"
  },
  light: {
    est: "rgb(104,140,124)",
    act: "rgb(46,124,100)",
    text: "rgb(135,142,139)",
    grid: "rgba(24,32,29,0.08)"
  }
};

export interface ProxyChartHandle {
  setData(est: LineData[], act: LineData[]): void;
  setTheme(theme: "dark" | "light"): void;
  destroy(): void;
}

export function createProxyChart(
  el: HTMLElement,
  theme: "dark" | "light" = "dark",
  LightweightCharts: typeof import("lightweight-charts")
): ProxyChartHandle {
  const c = CHART_COLORS[theme] || CHART_COLORS.dark;
  const height = () => el.clientHeight || 300;

  const chart: IChartApi = LightweightCharts.createChart(el, {
    width: el.clientWidth,
    height: height(),
    layout: {
      background: { type: LightweightCharts.ColorType.Solid, color: "transparent" },
      textColor: c.text,
      fontFamily: "'IBM Plex Sans KR', system-ui, sans-serif",
      fontSize: 11
    },
    grid: { vertLines: { visible: false }, horzLines: { color: c.grid } },
    rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.16, bottom: 0.12 } },
    timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
    crosshair: { mode: 0 },
    handleScale: { axisPressedMouseMove: false },
    // locale을 명시하지 않으면 브라우저가 보고하는 값을 그대로 Intl.DateTimeFormat에 넘기는데,
    // 일부 환경(구형 WebView, 로케일 설정이 깨진 OS 등)에서는 BCP-47 규격이 아닌 값을 반환해
    // "Invalid language tag" 에러로 차트 전체가 렌더링되지 않는다. 한국 주식 앱이니 ko-KR로 고정한다.
    localization: { locale: "ko-KR", priceFormatter: (p: number) => "$" + p.toFixed(2) }
  });

  const estSeries: ISeriesApi<"Line"> = chart.addLineSeries({
    color: c.est,
    lineWidth: 2,
    lineStyle: 2,
    priceLineVisible: false,
    lastValueVisible: false
  });
  const actSeries: ISeriesApi<"Line"> = chart.addLineSeries({
    color: c.act,
    lineWidth: 2,
    priceLineVisible: false,
    lastValueVisible: false
  });

  const ro = new ResizeObserver(() => chart.resize(el.clientWidth, height()));
  ro.observe(el);

  return {
    setData(est, act) {
      estSeries.setData(est);
      actSeries.setData(act);
      chart.timeScale().fitContent();
    },
    setTheme(next) {
      const n = CHART_COLORS[next] || CHART_COLORS.dark;
      estSeries.applyOptions({ color: n.est });
      actSeries.applyOptions({ color: n.act });
      chart.applyOptions({ layout: { textColor: n.text }, grid: { horzLines: { color: n.grid } } });
    },
    destroy() {
      ro.disconnect();
      chart.remove();
    }
  };
}

export function toLineData(points: { time: number; value: number }[]): LineData[] {
  return points.map((p) => ({ time: p.time as UTCTimestamp, value: p.value }));
}

/**
 * 실시간 괴리도 — 추정가와 실제가의 %p 차이.
 * 최근 평균 대비 1.25배를 넘으면 '괴리 확대'로 보고, 색이 아니라
 * 테두리 두께/글자 굵기로만 강조한다.
 */
export function computeDivergence(
  est: { time: number; value: number }[],
  act: { time: number; value: number }[],
  windowSize = 24
) {
  const pairs = act.map((a, i) => ({ time: a.time, d: ((est[i].value - a.value) / a.value) * 100 }));
  if (!pairs.length) return null;
  const now = pairs[pairs.length - 1].d;
  const avg = pairs.reduce((s, p) => s + p.d, 0) / pairs.length;
  return {
    now,
    avg,
    wide: Math.abs(now) > Math.abs(avg) * 1.25,
    recent: pairs.slice(-windowSize),
    fxAdjusted: true
  };
}
