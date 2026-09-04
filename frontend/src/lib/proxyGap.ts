import type { ProxyPoint } from "@/api/types";

export interface DivergenceBar {
  heightPx: number;
  bg: string;
  align: "flex-end" | "flex-start";
}

export interface DivergenceSummary {
  nowPct: number;
  nowLabel: string;
  avgLabel: string;
  wide: boolean;
  state: "정상 범위" | "괴리 확대";
  stateIcon: string;
  hint: string;
  bars: DivergenceBar[];
}

/** 디자인 스펙 §09 — 괴리 확대 강조는 색이 아니라 테두리 두께 + 숫자 굵기로만. */
export function summarizeDivergence(est: ProxyPoint[], act: ProxyPoint[], windowSize = 24): DivergenceSummary {
  const pairs = act.map((a, i) => {
    const estValue = est[i]?.value ?? a.value;
    return { t: a.time, d: ((estValue - a.value) / a.value) * 100 };
  });
  const tail = pairs.slice(-windowSize);
  const now = pairs.length ? pairs[pairs.length - 1].d : 0;
  const avg = pairs.reduce((s, p) => s + p.d, 0) / (pairs.length || 1);
  const max = Math.max(...tail.map((p) => Math.abs(p.d)), 0.1);
  const wide = Math.abs(now) > Math.abs(avg) * 1.25;

  return {
    nowPct: now,
    nowLabel: (now >= 0 ? "+" : "−") + Math.abs(now).toFixed(2) + "%p",
    avgLabel: (avg >= 0 ? "+" : "−") + Math.abs(avg).toFixed(2) + "%p",
    wide,
    state: wide ? "괴리 확대" : "정상 범위",
    stateIcon: wide ? "◈" : "◇",
    hint: wide
      ? "추정가와 실제가 차이가 평소보다 벌어졌습니다. 개장 방향 참고 신뢰도를 낮춰 보세요."
      : "추정가와 실제가 차이가 최근 평균 범위 안에 있습니다.",
    bars: tail.map((p) => ({
      heightPx: Math.max(3, Math.round((Math.abs(p.d) / max) * 40)),
      bg: p.d >= 0 ? "oklch(0.84 0.095 168 / .55)" : "oklch(0.62 0.055 165 / .75)",
      align: p.d >= 0 ? "flex-end" : "flex-start"
    }))
  };
}
