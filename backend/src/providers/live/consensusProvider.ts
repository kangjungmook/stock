import * as cheerio from "cheerio";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout.js";
import type { ConsensusInfo, OpinionItem } from "../../types.js";

/**
 * 컨센서스(목표주가·투자의견)는 공식 무료 API가 없어 WiseReport(FnGuide 제휴, 네이버 금융이
 * 그대로 임베드하는 페이지)를 크롤링한다. 비공식 스크레이핑이라 사이트 구조가 바뀌면 깨진다.
 *
 * 이 세션에서는 navercomp.wisereport.co.kr로 나가는 아웃바운드가 막혀 있어 실제 HTML로
 * 셀렉터를 검증하지 못했다 — 지금 셀렉터는 최선의 추정치일 뿐이라, target/low/high 중
 * 하나라도 못 읽으면 null을 반환해 mock으로 조용히 폴백하게 해 뒀다. 배포 후 이 함수가
 * 계속 null만 반환하면(로그에 "consensus selectors" 경고), 실제로 받은 HTML 조각을
 * 알려주면 셀렉터를 정확히 맞춘다.
 */
const CONSENSUS_URL = "https://navercomp.wisereport.co.kr/v2/company/c1010001.aspx";

function parseNumber(text: string): number {
  const n = Number(text.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function fetchConsensus(
  ticker: string,
  currentPrice: number
): Promise<{ consensus: ConsensusInfo; opinions: OpinionItem[] } | null> {
  const res = await fetchWithTimeout(
    `${CONSENSUS_URL}?cmp_cd=${ticker}`,
    { headers: { "User-Agent": "Mozilla/5.0 (compatible; stock-briefing-bot/1.0)" } },
    8_000
  );
  if (!res.ok) throw new Error(`consensus scrape HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const target = parseNumber($(".target_consensus, #target_price").first().text());
  const low = parseNumber($(".target_low, #target_price_low").first().text());
  const high = parseNumber($(".target_high, #target_price_high").first().text());
  const brokerCountText = $(".broker_count, #consensus_count").first().text().trim();

  if (!target || !low || !high || high <= low) {
    console.warn("[consensus] selectors did not match expected fields — falling back to mock");
    return null;
  }

  const opinions: OpinionItem[] = [];
  $(".opinion_table tr, .consensus_table tr").each((_, el) => {
    const cells = $(el).find("td, th");
    const label = cells.eq(0).text().trim();
    if (!["매수", "중립", "매도"].includes(label)) return;
    opinions.push({
      label,
      n: parseNumber(cells.eq(1).text()),
      pct: cells.eq(2).text().trim() || "0%",
      tone: label === "매수" ? "up" : label === "매도" ? "down" : "flat"
    });
  });

  const span = high - low || 1;
  const clampedCurrent = Math.min(Math.max(currentPrice, low), high);
  const upsidePct = currentPrice ? ((target - currentPrice) / currentPrice) * 100 : 0;

  return {
    consensus: {
      target: Math.round(target).toLocaleString("ko-KR"),
      upside: `${upsidePct >= 0 ? "+" : ""}${upsidePct.toFixed(1)}% 여력`,
      low: Math.round(low).toLocaleString("ko-KR"),
      high: Math.round(high).toLocaleString("ko-KR"),
      count: brokerCountText ? `증권사 ${parseNumber(brokerCountText)}곳` : "",
      bandLeft: `${(((target - low) / span) * 0.4 * 100).toFixed(0)}%`,
      bandWidth: "50%",
      markPos: `${(((clampedCurrent - low) / span) * 100).toFixed(0)}%`
    },
    opinions
  };
}
