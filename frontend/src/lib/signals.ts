import type { FactorState, Tone, Verdict } from "@/api/types";

export const VERDICTS: Record<Verdict, { icon: string; color: string; bg: string }> = {
  "긍정 우위": { icon: "◆", color: "var(--up)", bg: "var(--up-bg)" },
  주의: { icon: "▽", color: "var(--down)", bg: "var(--down-bg)" },
  관망: { icon: "◇", color: "var(--ink2)", bg: "var(--tint)" },
  "확인 필요": { icon: "◈", color: "var(--watch)", bg: "var(--watch-bg)" }
};

export const FACTOR_TONE: Record<FactorState, [string, string]> = {
  강세: ["▲", "var(--up)"],
  상향: ["▲", "var(--up)"],
  저평가: ["▲", "var(--up)"],
  약세: ["▼", "var(--down)"],
  하향: ["▼", "var(--down)"],
  부담: ["▼", "var(--down)"],
  중립: ["–", "var(--ink3)"],
  유지: ["–", "var(--ink3)"]
};

export const SIGNAL_FILTERS: { label: Verdict; icon: string; color: string }[] = [
  { label: "긍정 우위", icon: "◆", color: "var(--up)" },
  { label: "주의", icon: "▽", color: "var(--down)" },
  { label: "관망", icon: "◇", color: "var(--ink3)" }
];

export const TAG_TONE: Record<Tone, { icon: string; color: string; bg: string }> = {
  up: { icon: "◆", color: "var(--up)", bg: "var(--up-bg)" },
  down: { icon: "▽", color: "var(--down)", bg: "var(--down-bg)" },
  watch: { icon: "◈", color: "var(--watch)", bg: "var(--watch-bg)" },
  flat: { icon: "◇", color: "var(--ink2)", bg: "var(--tint)" }
};

/** 등락 표기 — 기호 + 부호. 색상은 --pos/--neg만 (저채도 틴트), 강한 신호색은 배지 전용. */
export function moveLabel(changePct: number): string {
  const up = changePct >= 0;
  return (up ? "▲ +" : "▼ ") + Math.abs(changePct).toFixed(2) + "%";
}

export function moveColor(changePct: number): string {
  return changePct >= 0 ? "var(--pos)" : "var(--neg)";
}

export function flowLabel(value: number): string {
  // 로케일을 명시하지 않으면 브라우저가 보고하는 값을 그대로 쓰는데, 드물게 깨진 로케일
  // 문자열을 보고하는 환경에서는 이게 에러를 던진다 — 한국 앱이니 ko-KR로 고정한다.
  return (value > 0 ? "▲ +" : "▼ ") + Math.abs(value).toLocaleString("ko-KR");
}

export function flowColor(value: number): string {
  return value > 0 ? "var(--pos)" : "var(--neg)";
}

/** 종가/추정가 시리즈를 SVG path로 변환 (line + area) */
export function seriesToPath(series: number[], w: number, h: number, padTop = 8, padBottom = 16) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => [
    (i / (series.length - 1)) * w,
    h - padBottom - ((v - min) / span) * (h - padTop - padBottom)
  ]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return { line, area: line + ` L${w} ${h} L0 ${h} Z` };
}
