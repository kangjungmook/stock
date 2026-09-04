export const env = {
  port: Number(process.env.PORT) || 8787,
  frontendOrigins: (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim()),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",

  dartApiKey: process.env.DART_API_KEY || "",

  tossClientId: process.env.TOSS_CLIENT_ID || "",
  tossClientSecret: process.env.TOSS_CLIENT_SECRET || "",

  krxAuthKey: process.env.KRX_AUTH_KEY || "",

  newsAiKey: process.env.NEWS_AI_KEY || ""
};

export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);

/**
 * 각 데이터 도메인은 필요한 키가 채워져 있을 때만 실 provider를 쓰고,
 * 없으면 자동으로 mock으로 폴백한다 (전역 DATA_PROVIDER 스위치 대신 도메인별 판단).
 */
export const liveProvidersConfigured = {
  dart: Boolean(env.dartApiKey),
  toss: Boolean(env.tossClientId && env.tossClientSecret),
  krx: Boolean(env.krxAuthKey),
  newsAi: Boolean(env.newsAiKey)
};
