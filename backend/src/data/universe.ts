import type { Security } from "../types.js";

/** 프로토타입(design/Stock Briefing Dashboard.dc.html)의 UNIVERSE를 그대로 옮김. */
export const UNIVERSE: Security[] = [
  { ticker: "005930", name: "삼성전자", sector: "반도체" },
  { ticker: "006400", name: "삼성SDI", sector: "2차전지" },
  { ticker: "207940", name: "삼성바이오로직스", sector: "바이오" },
  { ticker: "000660", name: "SK하이닉스", sector: "반도체" },
  { ticker: "035720", name: "카카오", sector: "인터넷" },
  { ticker: "005380", name: "현대차", sector: "자동차" },
  { ticker: "035420", name: "NAVER", sector: "인터넷" },
  { ticker: "373220", name: "LG에너지솔루션", sector: "2차전지" },
  { ticker: "068270", name: "셀트리온", sector: "바이오" },
  { ticker: "267260", name: "HD현대일렉트릭", sector: "전력기기" }
];

export function findSecurity(ticker: string): Security | undefined {
  return UNIVERSE.find((u) => u.ticker === ticker);
}

export function searchUniverse(query: string): Security[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return UNIVERSE.filter((u) => u.name.toLowerCase().includes(q) || u.ticker.includes(q)).slice(0, 8);
}
