/**
 * AI 신호 스펙트럼(매수 ~ 관망 ~ 매도) 게이지용 헬퍼.
 * 참고 이미지의 네온 그라데이션 대신, 이미 쓰고 있는 브랜드 톤(--up/--watch/--down)을
 * 그대로 보간해서 9단계로 나눈다 — 색만 봐도 이 앱의 다른 신호 배지와 같은 언어로 읽힌다.
 */

export const SPECTRUM_STEPS = 9;

interface Oklch {
  l: number;
  c: number;
  h: number;
}

// tokens.css의 --up/--watch/--down 값과 동일 — 라이트/다크 각각의 브랜드 톤.
const STOPS: Record<"light" | "dark", { up: Oklch; watch: Oklch; down: Oklch }> = {
  light: {
    up: { l: 0.44, c: 0.095, h: 158 },
    watch: { l: 0.5, c: 0.105, h: 68 },
    down: { l: 0.47, c: 0.135, h: 26 }
  },
  dark: {
    up: { l: 0.775, c: 0.085, h: 158 },
    watch: { l: 0.8, c: 0.09, h: 72 },
    down: { l: 0.755, c: 0.105, h: 28 }
  }
};

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpOklch(a: Oklch, b: Oklch, t: number): Oklch {
  return { l: lerp(a.l, b.l, t), c: lerp(a.c, b.c, t), h: lerp(a.h, b.h, t) };
}

/** index: 0(강한 매수) ~ SPECTRUM_STEPS-1(강한 매도) */
export function spectrumColor(index: number, theme: "light" | "dark"): string {
  const { up, watch, down } = STOPS[theme];
  const mid = (SPECTRUM_STEPS - 1) / 2; // 4
  const stop = index <= mid ? lerpOklch(up, watch, index / mid) : lerpOklch(watch, down, (index - mid) / mid);
  return `oklch(${stop.l.toFixed(3)} ${stop.c.toFixed(3)} ${stop.h.toFixed(1)})`;
}

/** score(-100~100)를 9단계 인덱스(0~8)로 변환 — 클수록(매수 우세) 인덱스가 작다. */
export function scoreToIndex(score: number): number {
  const clamped = Math.max(-100, Math.min(100, score));
  const t = (100 - clamped) / 200; // score +100 -> t0, score -100 -> t1
  return Math.min(SPECTRUM_STEPS - 1, Math.round(t * (SPECTRUM_STEPS - 1)));
}

export function scoreToLabel(score: number): string {
  if (score >= 40) return "매수 우위";
  if (score >= 12) return "매수 관심";
  if (score > -12) return "관망";
  if (score > -40) return "매도 관심";
  return "매도 우위";
}
