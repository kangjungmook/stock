import { env } from "../../env.js";
import { fetchWithTimeout } from "../../lib/fetchWithTimeout.js";
import type { BriefingSnapshot } from "../../types.js";

/**
 * AI 신호 스펙트럼 — 이미 모아둔 데이터(판단 근거·컨센서스·최근 뉴스·수급)를 Gemini에게
 * 그대로 넘기고 매수~매도 성향만 점수화하게 한다. 뉴스 provider와 달리 여기서는 검색
 * grounding을 쓰지 않는다 — 새로운 사실을 찾아오게 하는 게 아니라 이미 검증된 데이터를
 * 종합·요약하게 하는 것뿐이라, grounding 없이 순수 reasoning으로 충분하고 비용도 덜 든다.
 * 프롬프트로 "주어진 데이터에만 근거하라"고 강하게 제한해 새 사실을 지어내지 못하게 막는다.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export interface AiVerdictResult {
  score: number;
  summary: string;
}

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

function buildPrompt(s: BriefingSnapshot): string {
  const factors = s.factors.map((f) => `${f.name} ${f.state}`).join(", ") || "정보 없음";
  const news = s.news.slice(0, 4).map((n) => `- (${n.tag}) ${n.title}`).join("\n") || "없음";
  const flows =
    s.flows
      .slice(0, 5)
      .map((f) => `${f.date} 외국인 ${f.foreign}억 · 기관 ${f.inst}억`)
      .join("\n") || "없음";

  return [
    `"${s.name}"(${s.ticker}) 종목에 대해, 아래 데이터에만 근거해서 매수~매도 성향을 점수화해줘.`,
    `현재가 ${s.price}원 (전일대비 ${s.changePct}%)`,
    `판단 근거: ${factors}`,
    `컨센서스: 목표주가 ${s.consensus.target}원 (${s.consensus.upside})`,
    `최근 뉴스:\n${news}`,
    `최근 수급:\n${flows}`,
    `-100(강한 매도 신호) ~ +100(강한 매수 신호) 사이의 정수 점수와, 그 이유를 담은 한국어 한 문장 요약을 만들어줘.`,
    `반드시 위 데이터만 근거로 삼고 새로운 사실을 지어내지 마. "매수하세요"/"매도하세요" 같은 권유 문구는 쓰지 말고 근거 요약만 써.`,
    `다른 설명 없이 아래 JSON 형식만 출력해: {"score": 정수, "summary": "한 문장 요약"}`
  ].join("\n");
}

export async function fetchAiVerdict(snapshot: BriefingSnapshot): Promise<AiVerdictResult | null> {
  const res = await fetchWithTimeout(
    `${ENDPOINT}?key=${env.newsAiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: buildPrompt(snapshot) }] }] })
    },
    12_000
  );
  if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;

  let raw: { score?: unknown; summary?: unknown };
  try {
    raw = JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
  if (typeof raw.score !== "number" || !Number.isFinite(raw.score)) return null;

  return {
    score: Math.max(-100, Math.min(100, Math.round(raw.score))),
    summary: typeof raw.summary === "string" ? raw.summary.trim() : ""
  };
}
