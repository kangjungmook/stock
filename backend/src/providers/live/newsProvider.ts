import { env } from "../../env.js";
import type { NewsItem, Tone } from "../../types.js";

/**
 * 뉴스 — Gemini API + Google Search grounding.
 *
 * 종목별 뉴스를 크롤링하는 공식 무료 API가 없어서, "실제로 검색된 사건만" 다루도록 프롬프트로
 * 강하게 제한하고 grounding(Google 검색 연동)을 켜서 모델이 지어낸 기사를 만들지 못하게 한다.
 * 순수 생성형(grounding 없이)은 쓰지 않는다 — 실제 언론사 이름을 출처로 붙인 가짜 기사가
 * 나올 위험이 있기 때문 (사용자와 상의해 이 방식으로 확정).
 *
 * 참고: Gemini는 최근 Interactions API(베타)로 넘어가는 중이지만, 이 구현은 그보다 오래되고
 * 스펙을 확실히 아는 `models/{model}:generateContent` + `tools:[{google_search:{}}]` 방식을
 * 쓴다. 이 세션에서는 generativelanguage.googleapis.com으로 나가는 아웃바운드가 막혀 있어
 * 실제 응답으로 검증하지 못했다 — 배포 후 에러가 나면 HTTP status와 본문을 알려주면 된다.
 */

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const VALID_TONES: Tone[] = ["up", "down", "watch", "flat"];
const TAG_LABEL: Record<Tone, string> = {
  up: "호재 신호",
  down: "악재 신호",
  watch: "확인 필요",
  flat: "중립"
};

interface GeminiCandidate {
  content?: { parts?: { text?: string }[] };
  groundingMetadata?: { groundingChunks?: { web?: { uri: string; title: string } }[] };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

interface RawNewsItem {
  title?: string;
  time?: string;
  source?: string;
  tone?: string;
}

function buildPrompt(stockName: string, ticker: string): string {
  return [
    `"${stockName}"(${ticker}) 종목과 관련된 오늘 또는 최근 며칠 사이의 실제 뉴스를 한국어로 최대 4건 찾아줘.`,
    `검색으로 실제 확인되지 않은 내용은 절대 지어내지 마. 확인된 기사가 없으면 빈 배열을 반환해.`,
    `다른 설명 없이 아래 형식의 JSON 배열만 출력해:`,
    `[{"title":"기사 제목","time":"HH:MM 또는 상대시간(예: 3시간 전)","source":"언론사명","tone":"up|down|watch|flat"}]`,
    `tone은 이 종목 주가에 호재면 up, 악재면 down, 불확실/확인 필요면 watch, 중립이면 flat.`
  ].join("\n");
}

export async function fetchGroundedNews(stockName: string, ticker: string): Promise<NewsItem[]> {
  const res = await fetch(`${ENDPOINT}?key=${env.newsAiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: buildPrompt(stockName, ticker) }] }],
      tools: [{ google_search: {} }]
    })
  });
  if (!res.ok) throw new Error(`Gemini API HTTP ${res.status}: ${await res.text()}`);

  const data = (await res.json()) as GeminiResponse;
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const chunks = candidate?.groundingMetadata?.groundingChunks ?? [];

  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) return [];

  let raw: RawNewsItem[];
  try {
    raw = JSON.parse(jsonMatch[0]);
  } catch {
    return [];
  }

  return raw
    .filter((item) => item.title)
    .slice(0, 4)
    .map((item): NewsItem => {
      const tone: Tone = VALID_TONES.includes(item.tone as Tone) ? (item.tone as Tone) : "flat";
      // 모델이 인용한 출처(source) 이름이 grounding chunk 제목/URL과 겹치면 실제 링크를 붙인다.
      const matchedChunk = chunks.find(
        (c) => c.web?.title && item.source && c.web.title.includes(item.source)
      );
      return {
        time: item.time ?? "",
        title: item.title ?? "",
        source: item.source ?? "",
        tag: TAG_LABEL[tone],
        tone,
        url: matchedChunk?.web?.uri
      };
    });
}
