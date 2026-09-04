export type Tone = "up" | "down" | "watch" | "flat";
export type Verdict = "긍정 우위" | "주의" | "관망" | "확인 필요";
export type FactorState = "강세" | "약세" | "중립" | "상향" | "하향" | "저평가" | "부담" | "유지";

export interface Security {
  ticker: string;
  name: string;
  sector: string;
}

export interface NewsItem {
  time: string;
  title: string;
  source: string;
  tag: string;
  tone: Tone;
}

export interface FilingItem {
  date: string;
  title: string;
  meta: string;
  url?: string;
}

export interface ConsensusInfo {
  target: string;
  upside: string;
  low: string;
  high: string;
  count: string;
  bandLeft: string;
  bandWidth: string;
  markPos: string;
}

export interface OpinionItem {
  label: string;
  n: number;
  pct: string;
  tone: Tone;
}

export interface FlowItem {
  date: string;
  foreign: number;
  inst: number;
}

export interface FactorItem {
  name: string;
  state: FactorState;
}

export interface BriefingSnapshot {
  ticker: string;
  name: string;
  sector: string;
  price: string;
  changePct: number;
  dir: "up" | "down";
  headline: string;
  verdict: Verdict;
  factors: FactorItem[];
  hitRate: number;
  sampleN: number;
  quiet?: boolean;
  quoteError?: boolean;
  news: NewsItem[];
  filings: FilingItem[];
  consensus: ConsensusInfo;
  opinions: OpinionItem[];
  flows: FlowItem[];
  series: number[];
  updated: string;
  upcomingEvent?: { date: string; text: string };
}

export interface IndexQuote {
  name: string;
  value: string;
  chg: number;
  pct: number;
}

export type Timeframe = "1분" | "15분" | "1시간" | "4시간" | "일" | "주" | "월";

export interface ProxyConfig {
  target: string;
  base: number;
  est: number;
  quality: "high" | "low";
}

export interface ProxyPoint {
  time: number;
  value: number;
}

export interface ProxySeriesResponse {
  target: string;
  timeframe: Timeframe;
  est: ProxyPoint[];
  act: ProxyPoint[];
  cfg: ProxyConfig;
}

export interface ProxyCoverageRow {
  ticker: string;
  name: string;
  quality: "high" | "low";
  diffPct: number;
}
