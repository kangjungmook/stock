/**
 * 아주 단순한 in-memory TTL 캐시. 외부 API(토스/DART/컨센서스 크롤링)를 매 요청마다
 * 호출하면 rate limit에 걸리거나 느려지므로, 도메인별로 짧게라도 캐시해 둔다.
 * 프로세스 재시작하면 비워진다 — 여러 인스턴스로 스케일하면 Supabase 캐시 테이블처럼
 * 공유 스토리지로 옮겨야 하지만, 지금 규모에서는 이 정도면 충분하다.
 */
type Outcome<T> = { ok: true; value: T } | { ok: false; error: unknown };
interface Entry<T> {
  outcome: Outcome<T>;
  expiresAt: number;
}

const store = new Map<string, Entry<unknown>>();

/**
 * 성공/실패 모두 캐시한다 — 실패를 캐시 안 하면 계속 깨진 엔드포인트를 매 요청마다
 * 다시 두드리게 되어 응답이 느려진다(예: KRX/컨센서스 미확정 엔드포인트).
 */
export async function withCache<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    if (hit.outcome.ok) return hit.outcome.value as T;
    throw hit.outcome.error;
  }
  try {
    const value = await fn();
    store.set(key, { outcome: { ok: true, value }, expiresAt: Date.now() + ttlMs });
    return value;
  } catch (error) {
    store.set(key, { outcome: { ok: false, error }, expiresAt: Date.now() + ttlMs });
    throw error;
  }
}

const inFlight = new Set<string>();

/**
 * LLM 호출처럼 몇 초씩 걸릴 수 있는 건 /api/briefings 응답을 절대 기다리게 하면 안 된다 —
 * 캐시에 값이 있으면(만료됐어도) 즉시 그걸 반환하고, 없거나 만료됐으면 백그라운드로
 * 새로 받아와 캐시만 채워 두고 지금 요청은 null을 즉시 반환한다(그러면 호출부가 mock으로
 * 폴백한다). 다음 요청(수동 새로고침·15분 자동 갱신)부터는 캐시가 채워져 있어 바로 뜬다.
 */
export function staleWhileRevalidate<T>(key: string, ttlMs: number, fn: () => Promise<T>): T | null {
  const hit = store.get(key);
  const isFresh = !!hit && hit.expiresAt > Date.now();

  if (!isFresh && !inFlight.has(key)) {
    inFlight.add(key);
    fn()
      .then((value) => store.set(key, { outcome: { ok: true, value }, expiresAt: Date.now() + ttlMs }))
      .catch((error) => {
        store.set(key, { outcome: { ok: false, error }, expiresAt: Date.now() + ttlMs });
        console.warn(`[cache] 백그라운드 갱신 실패(${key}):`, error?.message ?? error);
      })
      .finally(() => inFlight.delete(key));
  }

  return hit?.outcome.ok ? (hit.outcome.value as T) : null;
}
