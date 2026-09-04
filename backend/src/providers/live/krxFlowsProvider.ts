import { env } from "../../env.js";
import type { FlowItem } from "../../types.js";

/**
 * 수급(외국인·기관 순매수) — KRX 정보데이터시스템 Open API (openapi.krx.co.kr).
 *
 * 정직하게 밝히면: 이 세션은 developers/opendart 계열은 사전 지식으로 정확한 스펙을 알지만,
 * openapi.krx.co.kr의 "투자자별 거래실적" 서비스는 최근에 개편된 상품이라 정확한 엔드포인트
 * 경로·요청 파라미터·응답 필드명을 확신할 수 없다. 게다가 이 샌드박스에서 해당 호스트로
 * 나가는 아웃바운드가 막혀 있어 추측한 경로를 실제로 찔러볼 수도 없었다.
 *
 * 잘못 추측한 경로로 "그럴듯한 코드"를 만드는 것보다, 여기서 명시적으로 멈추는 편이 안전하다 —
 * 잘못된 엔드포인트는 조용히 mock으로 폴백되지만(marketData.ts), 만약 우연히 200을 반환하는
 * 다른 응답이면 실제 수급 수치인 것처럼 잘못된 값을 보여줄 위험이 있기 때문이다.
 *
 * 필요한 것: openapi.krx.co.kr에서 "투자자별 거래실적"(또는 동일 상품) 신청 후 발급되는
 * 요청 예시(curl) 또는 실제 응답 JSON 샘플 — 그거면 바로 정확하게 붙일 수 있다.
 */
export async function fetchKrxFlows(_ticker: string): Promise<FlowItem[]> {
  if (!env.krxAuthKey) throw new Error("KRX_AUTH_KEY not configured");
  throw new Error(
    "KRX flows endpoint not confirmed yet — need a sample request/response from openapi.krx.co.kr to finish this provider"
  );
}
