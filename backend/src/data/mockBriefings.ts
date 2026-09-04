import { findSecurity } from "./universe.js";
import type { BriefingSnapshot } from "../types.js";

/**
 * design/Stock Briefing Dashboard.dc.html의 DATA 픽스처를 그대로 옮김.
 * 실 데이터 소스(DART/뉴스/컨센서스/시세)가 준비되면 이 파일 대신
 * providers/live/*.ts로 교체한다 — providers/README.md 참고.
 */
interface RawEntry {
  price: string;
  changePct: number;
  dir: "up" | "down";
  headline: string;
  verdict: BriefingSnapshot["verdict"];
  factors: BriefingSnapshot["factors"];
  hitRate: number;
  sampleN: number;
  quiet?: boolean;
  news: BriefingSnapshot["news"];
  filings: BriefingSnapshot["filings"];
  consensus: BriefingSnapshot["consensus"];
  opinions: BriefingSnapshot["opinions"];
  flows: BriefingSnapshot["flows"];
  series: number[];
  upcomingEvent?: { date: string; text: string };
}

const RAW: Record<string, RawEntry> = {
  "005930": {
    price: "71,400",
    changePct: 1.84,
    dir: "up",
    headline: "HBM3E 양산 승인 소식에 외국인 수급이 5거래일째 들어왔습니다.",
    verdict: "긍정 우위",
    factors: [
      { name: "수급", state: "강세" },
      { name: "밸류에이션", state: "중립" },
      { name: "모멘텀", state: "강세" },
      { name: "실적 추정", state: "상향" }
    ],
    hitRate: 64,
    sampleN: 41,
    news: [
      { time: "09:12", title: "삼성전자, 엔비디아 HBM3E 품질 승인 절차 마무리 단계", source: "전자신문", tag: "호재 신호", tone: "up" },
      { time: "08:40", title: "3분기 반도체 부문 영업이익 컨센서스 2주 연속 상향", source: "한국경제", tag: "호재 신호", tone: "up" },
      { time: "07:55", title: "메모리 현물가 상승폭 둔화 — 4분기 가격 협상 변수", source: "머니투데이", tag: "확인 필요", tone: "watch" },
      { time: "어제", title: "파운드리 2나노 수주 관련 공식 입장 없음", source: "연합뉴스", tag: "중립", tone: "flat" }
    ],
    filings: [
      { date: "09.04", title: "자기주식 취득 결과보고서", meta: "취득 완료 · 1,200억원 규모" },
      { date: "09.01", title: "단일판매·공급계약 체결", meta: "계약금액 8,400억원 · 매출액 대비 0.3%" }
    ],
    consensus: { target: "94,000", upside: "+31.7% 여력", low: "78,000", high: "112,000", count: "증권사 27곳", bandLeft: "18%", bandWidth: "58%", markPos: "24%" },
    opinions: [
      { label: "매수", n: 24, pct: "89%", tone: "up" },
      { label: "중립", n: 3, pct: "11%", tone: "flat" },
      { label: "매도", n: 0, pct: "0%", tone: "down" }
    ],
    flows: [
      { date: "09.04", foreign: 1240, inst: -310 },
      { date: "09.03", foreign: 890, inst: 220 },
      { date: "09.02", foreign: 1510, inst: -140 },
      { date: "09.01", foreign: 430, inst: 610 },
      { date: "08.29", foreign: 720, inst: -80 }
    ],
    series: [62, 61, 63, 62, 64, 66, 65, 67, 66, 68, 67, 69, 71, 70, 69, 71, 73, 72, 74, 73, 75, 74, 76, 78, 77, 79, 81, 80, 82, 84],
    upcomingEvent: { date: "09.08", text: "삼성전자 3분기 잠정실적 발표 예정" }
  },
  "000660": {
    price: "214,500",
    changePct: 3.12,
    dir: "up",
    headline: "목표주가 상향이 이어지지만, 밸류에이션 부담을 지적하는 리포트도 함께 나왔습니다.",
    verdict: "관망",
    factors: [
      { name: "수급", state: "중립" },
      { name: "밸류에이션", state: "부담" },
      { name: "모멘텀", state: "강세" },
      { name: "실적 추정", state: "상향" }
    ],
    hitRate: 52,
    sampleN: 33,
    news: [
      { time: "10:05", title: "증권가 목표주가 잇단 상향 — 평균 26만원선", source: "이데일리", tag: "호재 신호", tone: "up" },
      { time: "09:31", title: "PBR 2.4배, 과거 고점 구간 진입 지적", source: "서울경제", tag: "확인 필요", tone: "watch" },
      { time: "08:20", title: "HBM 공급 계약 연장 협의 진행 중", source: "블룸버그", tag: "호재 신호", tone: "up" }
    ],
    filings: [{ date: "09.02", title: "투자판단 관련 주요경영사항", meta: "청주 M15X 증설 투자 결정 · 4.2조원" }],
    consensus: { target: "262,000", upside: "+22.1% 여력", low: "205,000", high: "310,000", count: "증권사 22곳", bandLeft: "12%", bandWidth: "66%", markPos: "16%" },
    opinions: [
      { label: "매수", n: 19, pct: "86%", tone: "up" },
      { label: "중립", n: 3, pct: "14%", tone: "flat" },
      { label: "매도", n: 0, pct: "0%", tone: "down" }
    ],
    flows: [
      { date: "09.04", foreign: 2140, inst: 180 },
      { date: "09.03", foreign: -420, inst: 340 },
      { date: "09.02", foreign: 980, inst: -220 },
      { date: "09.01", foreign: 1310, inst: -60 },
      { date: "08.29", foreign: -190, inst: 410 }
    ],
    series: [58, 60, 59, 62, 64, 63, 66, 68, 67, 70, 72, 71, 74, 76, 75, 73, 76, 78, 80, 79, 82, 84, 83, 86, 88, 87, 90, 92, 91, 94],
    upcomingEvent: { date: "09.11", text: "SK하이닉스 기관투자자 설명회" }
  },
  "035720": {
    price: "38,150",
    changePct: -2.41,
    dir: "down",
    headline: "규제 이슈가 재점화되며 기관 매도가 3거래일 이어졌습니다.",
    verdict: "주의",
    factors: [
      { name: "수급", state: "약세" },
      { name: "밸류에이션", state: "중립" },
      { name: "모멘텀", state: "약세" },
      { name: "실적 추정", state: "하향" }
    ],
    hitRate: 58,
    sampleN: 27,
    news: [
      { time: "11:20", title: "플랫폼 수수료 관련 공정위 현장조사 착수", source: "조선비즈", tag: "악재 신호", tone: "down" },
      { time: "09:44", title: "3분기 광고 매출 추정치 소폭 하향", source: "미래에셋리서치", tag: "악재 신호", tone: "down" },
      { time: "08:15", title: "AI 서비스 신규 구독 지표는 개선 흐름", source: "테크M", tag: "호재 신호", tone: "up" }
    ],
    filings: [{ date: "08.30", title: "주식매수선택권 부여 결정", meta: "임직원 42만주 · 행사가 41,300원" }],
    consensus: { target: "48,000", upside: "+25.8% 여력", low: "36,000", high: "62,000", count: "증권사 18곳", bandLeft: "10%", bandWidth: "70%", markPos: "14%" },
    opinions: [
      { label: "매수", n: 11, pct: "61%", tone: "up" },
      { label: "중립", n: 6, pct: "33%", tone: "flat" },
      { label: "매도", n: 1, pct: "6%", tone: "down" }
    ],
    flows: [
      { date: "09.04", foreign: -310, inst: -740 },
      { date: "09.03", foreign: -120, inst: -520 },
      { date: "09.02", foreign: 90, inst: -410 },
      { date: "09.01", foreign: -260, inst: 130 },
      { date: "08.29", foreign: 140, inst: -80 }
    ],
    series: [86, 85, 87, 84, 82, 83, 80, 81, 78, 76, 77, 74, 75, 72, 70, 71, 68, 69, 66, 64, 65, 62, 60, 61, 58, 56, 57, 54, 52, 50],
    upcomingEvent: { date: "09.15", text: "카카오 공정위 자료 제출 기한" }
  },
  "005380": {
    price: "246,000",
    changePct: -0.2,
    dir: "down",
    quiet: true,
    headline: "오늘은 조용합니다.",
    verdict: "관망",
    factors: [
      { name: "수급", state: "중립" },
      { name: "밸류에이션", state: "저평가" },
      { name: "모멘텀", state: "중립" },
      { name: "실적 추정", state: "유지" }
    ],
    hitRate: 49,
    sampleN: 36,
    news: [{ time: "3일 전", title: "분기 배당 지급 관련 공시 외 신규 소식 없음", source: "DART", tag: "중립", tone: "flat" }],
    filings: [{ date: "09.01", title: "현금·현물배당 결정", meta: "주당 2,000원 · 시가배당률 0.8%" }],
    consensus: { target: "312,000", upside: "+26.8% 여력", low: "270,000", high: "360,000", count: "증권사 24곳", bandLeft: "16%", bandWidth: "62%", markPos: "20%" },
    opinions: [
      { label: "매수", n: 20, pct: "83%", tone: "up" },
      { label: "중립", n: 4, pct: "17%", tone: "flat" },
      { label: "매도", n: 0, pct: "0%", tone: "down" }
    ],
    flows: [
      { date: "09.04", foreign: 60, inst: -40 },
      { date: "09.03", foreign: -30, inst: 80 },
      { date: "09.02", foreign: 120, inst: -20 },
      { date: "09.01", foreign: -70, inst: 50 },
      { date: "08.29", foreign: 40, inst: 10 }
    ],
    series: [70, 71, 70, 69, 70, 71, 72, 71, 70, 71, 70, 69, 70, 71, 72, 71, 70, 69, 70, 71, 70, 71, 72, 71, 70, 69, 70, 71, 70, 70]
  }
};

/** 프로토타입 기본 상태: SK하이닉스 시세 수신 실패 (재시도/넘어가기 UI 데모용). */
const QUOTE_ERROR_TICKERS = new Set(["000660"]);

export function getMockBriefing(ticker: string): BriefingSnapshot | null {
  const meta = findSecurity(ticker);
  const raw = RAW[ticker];
  if (!meta || !raw) return null;
  return {
    ticker: meta.ticker,
    name: meta.name,
    sector: meta.sector,
    price: raw.price,
    changePct: raw.changePct,
    dir: raw.dir,
    headline: raw.headline,
    verdict: raw.verdict,
    factors: raw.factors,
    hitRate: raw.hitRate,
    sampleN: raw.sampleN,
    quiet: raw.quiet,
    quoteError: QUOTE_ERROR_TICKERS.has(ticker),
    news: raw.news,
    filings: raw.filings,
    consensus: raw.consensus,
    opinions: raw.opinions,
    flows: raw.flows,
    series: raw.series,
    updated: "오늘 15:42 기준 · 시세 15분 지연",
    upcomingEvent: raw.upcomingEvent
  };
}

export function getMockBriefings(tickers: string[]): BriefingSnapshot[] {
  return tickers.map(getMockBriefing).filter((b): b is BriefingSnapshot => !!b);
}

export const MOCK_TICKERS = Object.keys(RAW);
