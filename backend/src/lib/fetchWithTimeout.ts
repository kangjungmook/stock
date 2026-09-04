/**
 * 외부 API 호출은 반드시 타임아웃을 걸어야 한다 — 안 그러면 하나가 느려지거나 멈췄을 때
 * /api/briefings 요청 전체가 무한정 걸려서 프론트가 로딩 스켈레톤에서 멈춰버린다.
 */
export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`요청 시간 초과 (${timeoutMs}ms): ${url}`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
