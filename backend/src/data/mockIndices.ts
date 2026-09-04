import type { IndexQuote } from "../types.js";

/** design/Stock Briefing Dashboard.dc.html의 indices 픽스처. */
export function getMockIndices(): IndexQuote[] {
  return [
    { name: "코스피", value: "3,184.62", chg: 24.18, pct: 0.77 },
    { name: "코스닥", value: "812.40", chg: -3.65, pct: -0.45 },
    { name: "나스닥", value: "26,584.06", chg: 366.24, pct: 1.39 },
    { name: "S&P 500", value: "7,747.71", chg: 81.11, pct: 1.05 },
    { name: "필라델피아 반도체", value: "11,352.12", chg: 12.87, pct: 0.11 },
    { name: "VIX", value: "14.32", chg: -0.88, pct: -5.78 }
  ];
}
