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
