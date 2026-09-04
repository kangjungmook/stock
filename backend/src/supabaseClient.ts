import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env, supabaseConfigured } from "./env.js";

/**
 * SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 없으면 null을 반환한다.
 * 호출부는 null일 때 mock 데이터로 조용히 폴백해야 한다 — DB 없이도 앱 전체가
 * 동작해야 한다는 원칙 때문에, 여기서 에러를 던지지 않는다.
 */
export const supabase: SupabaseClient | null = supabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false }
    })
  : null;

if (!supabaseConfigured) {
  console.warn(
    "[supabase] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY가 설정되지 않았습니다 — mock 데이터로 동작합니다."
  );
}
