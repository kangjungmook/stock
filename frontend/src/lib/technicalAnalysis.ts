/**
 * 차트 분석 — 서버가 주는 series(종가 배열)만으로 계산하는 순수 수치 지표.
 * 시가·고가·저가·거래량은 없고 종가만 있어서(토스 캔들도 closePrice만 씀), 그 안에서
 * 계산 가능한 것만 다룬다: 이동평균 배열 상태, 추세(선형회귀 기울기), 변동성, 구간 내
 * 위치, RSI. AI에게 "이 숫자들이 뭘 뜻하는지" 판단하게 하지 않는다 — 이런 건 정해진
 * 공식으로 정확히 계산할 수 있는데 LLM에게 시켜서 근사치/오답 위험을 만들 이유가 없다.
 *
 * 주의: mock 데이터의 series는 실제 원화 가격이 아니라 스파크라인 모양만을 위한 임의
 * 수치라 절대값을 그대로 보여주면(예: "5일선 72") price 필드("71,400원")와 단위가
 * 안 맞아 혼란을 준다. 그래서 이 모듈은 %·상태 라벨처럼 스케일에 무관한 값만 밖으로
 * 낸다 — 실제 라이브 시세든 mock 도형이든 똑같이 안전하게 표시된다.
 */

export type Trend = "상승" | "하락" | "횡보";
export type RsiState = "과매수" | "과매도" | "중립";
export type MaAlignment = "정배열" | "역배열" | null;

export interface TechnicalAnalysis {
  trend: Trend;
  maAlignment: MaAlignment; // 5일 이동평균이 10일 이동평균 위/아래
  volatilityPct: number;
  pctFromHigh: number; // 최근 구간 고점 대비 몇 % 낮은지 (0 이상)
  pctFromLow: number; // 최근 구간 저점 대비 몇 % 높은지 (0 이상)
  rsi: number | null;
  rsiState: RsiState;
}

function average(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function movingAverage(series: number[], window: number): number | null {
  if (series.length < window) return null;
  return average(series.slice(-window));
}

/** 최근 구간의 선형회귀 기울기를 평균값 대비 %로 정규화해 추세를 판정한다. */
function detectTrend(series: number[]): Trend {
  const n = series.length;
  if (n < 3) return "횡보";
  const xMean = (n - 1) / 2;
  const yMean = average(series);
  let num = 0;
  let den = 0;
  series.forEach((y, x) => {
    num += (x - xMean) * (y - yMean);
    den += (x - xMean) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  const slopePctPerDay = yMean === 0 ? 0 : (slope / yMean) * 100;
  if (slopePctPerDay > 0.15) return "상승";
  if (slopePctPerDay < -0.15) return "하락";
  return "횡보";
}

/** 일간 변동률의 표준편차 — 최근 구간이 얼마나 출렁였는지. */
function detectVolatility(series: number[]): number {
  if (series.length < 2) return 0;
  const changes: number[] = [];
  for (let i = 1; i < series.length; i++) {
    if (series[i - 1] === 0) continue;
    changes.push(((series[i] - series[i - 1]) / series[i - 1]) * 100);
  }
  if (!changes.length) return 0;
  const mean = average(changes);
  const variance = average(changes.map((c) => (c - mean) ** 2));
  return Math.sqrt(variance);
}

function detectRsi(series: number[], period = 14): number | null {
  if (series.length < period + 1) return null;
  const window = series.slice(-(period + 1));
  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i < window.length; i++) {
    const diff = window[i] - window[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum += -diff;
  }
  const avgGain = gainSum / period;
  const avgLoss = lossSum / period;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function detectRsiState(rsi: number | null): RsiState {
  if (rsi === null) return "중립";
  if (rsi >= 70) return "과매수";
  if (rsi <= 30) return "과매도";
  return "중립";
}

export function analyzeSeries(series: number[]): TechnicalAnalysis | null {
  if (series.length < 5) return null;

  const high = Math.max(...series);
  const low = Math.min(...series);
  const current = series[series.length - 1];
  const ma5 = movingAverage(series, 5);
  const ma10 = movingAverage(series, 10);
  const rsi = detectRsi(series);

  return {
    trend: detectTrend(series),
    maAlignment: ma5 !== null && ma10 !== null ? (ma5 >= ma10 ? "정배열" : "역배열") : null,
    volatilityPct: detectVolatility(series),
    pctFromHigh: high === 0 ? 0 : ((high - current) / high) * 100,
    pctFromLow: low === 0 ? 0 : ((current - low) / low) * 100,
    rsi,
    rsiState: detectRsiState(rsi)
  };
}
