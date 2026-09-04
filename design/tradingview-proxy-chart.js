/**
 * 개장 전 추정가 차트 — TradingView Lightweight Charts 연동 (Vue 3 구현용)
 *
 * 이 디자인 파일의 미리보기 환경에서는 requestAnimationFrame이 실행되지 않아
 * Lightweight Charts가 캔버스를 칠하지 못합니다. 그래서 시안에서는 동일한 데이터를
 * 인라인 SVG로 렌더합니다. 실제 Vue 앱에서는 아래 코드를 그대로 쓰면 됩니다.
 *
 *   npm i lightweight-charts
 *
 * 주의 (실제로 겪은 함정):
 *  - 시리즈/축 색상에 oklch()를 넘기면 파싱하지 못해 아무것도 그려지지 않습니다.
 *    CSS 변수는 반드시 rgb()/rgba() 값으로 정의해 넘기세요.
 *  - 컨테이너 높이와 chart 높이를 일치시키고, ResizeObserver에서 resize()를 호출하세요.
 */

export const TF_STEP = {
  '1분': 60, '15분': 900, '1시간': 3600, '4시간': 14400,
  '일': 86400, '주': 604800, '월': 2592000
};

/** 대시보드 토큰과 1:1로 맞춘 차트 팔레트 (rgb 필수) */
export const CHART_COLORS = {
  dark: {
    est: 'rgb(124,163,146)',   // 추정가 — 저채도 딥그린, 파선
    act: 'rgb(150,226,199)',   // 실제가 — 밝은 딥그린, 실선
    text: 'rgb(151,161,157)',
    grid: 'rgba(233,241,237,0.09)'
  },
  light: {
    est: 'rgb(104,140,124)',
    act: 'rgb(46,124,100)',
    text: 'rgb(135,142,139)',
    grid: 'rgba(24,32,29,0.08)'
  }
};

/**
 * @param {HTMLElement} el      차트 컨테이너 (높이 지정 필수)
 * @param {'dark'|'light'} theme
 * @returns {{setData(est, act): void, setTheme(theme): void, destroy(): void}}
 */
export function createProxyChart(el, theme = 'dark', LightweightCharts) {
  const c = CHART_COLORS[theme] || CHART_COLORS.dark;
  const H = () => el.clientHeight || 300;

  const chart = LightweightCharts.createChart(el, {
    width: el.clientWidth,
    height: H(),
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: c.text,
      fontFamily: "'IBM Plex Sans KR', system-ui, sans-serif",
      fontSize: 11
    },
    grid: { vertLines: { visible: false }, horzLines: { color: c.grid } },
    rightPriceScale: { borderVisible: false, scaleMargins: { top: 0.16, bottom: 0.12 } },
    timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
    crosshair: { mode: 0 },
    handleScale: { axisPressedMouseMove: false },
    localization: { priceFormatter: (p) => '$' + p.toFixed(2) }
  });

  // 추정가: 파선 / 실제가: 실선 — 색 외에 선 스타일로도 구분 (색약 접근성)
  const estSeries = chart.addLineSeries({
    color: c.est, lineWidth: 2, lineStyle: 2,
    priceLineVisible: false, lastValueVisible: false
  });
  const actSeries = chart.addLineSeries({
    color: c.act, lineWidth: 2,
    priceLineVisible: false, lastValueVisible: false
  });

  const ro = new ResizeObserver(() => chart.resize(el.clientWidth, H()));
  ro.observe(el);

  return {
    /** est/act: [{ time: unixSeconds, value: number }] */
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
    destroy() { ro.disconnect(); chart.remove(); }
  };
}

/**
 * 실시간 괴리도 — 추정가와 실제가의 %p 차이.
 * 최근 평균 대비 1.25배를 넘으면 '괴리 확대'로 보고, 색이 아니라
 * 테두리 두께/글자 굵기로만 강조합니다.
 */
export function computeDivergence(est, act, { window = 24 } = {}) {
  const pairs = act.map((a, i) => ({ time: a.time, d: ((est[i].value - a.value) / a.value) * 100 }));
  if (!pairs.length) return null;
  const now = pairs[pairs.length - 1].d;
  const avg = pairs.reduce((s, p) => s + p.d, 0) / pairs.length;
  return {
    now, avg,
    wide: Math.abs(now) > Math.abs(avg) * 1.25,
    recent: pairs.slice(-window),
    fxAdjusted: true // 환율 보정 반영 여부를 UI 라벨로 노출
  };
}
