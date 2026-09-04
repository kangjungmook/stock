export const env = {
  port: Number(process.env.PORT) || 8787,
  frontendOrigins: (process.env.FRONTEND_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim()),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  dataProvider: (process.env.DATA_PROVIDER || "mock") as "mock" | "live"
};

export const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
