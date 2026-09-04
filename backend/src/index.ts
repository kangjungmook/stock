import express from "express";
import cors from "cors";
import { env, liveProvidersConfigured } from "./env.js";
import { securitiesRouter } from "./routes/securities.js";
import { briefingsRouter } from "./routes/briefings.js";
import { indicesRouter } from "./routes/indices.js";
import { proxyRouter } from "./routes/proxy.js";

const app = express();

// Vercel gives one project several valid hostnames (production alias, git-branch alias,
// team-scoped domain, preview deployments) — an exact-match allowlist keeps breaking when
// the user opens a different one, so allow the whole *.vercel.app family plus the explicit
// FRONTEND_ORIGIN list (for localhost / a future custom domain).
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (env.frontendOrigins.includes(origin)) return callback(null, true);
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin)) return callback(null, true);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  })
);
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/securities", securitiesRouter);
app.use("/api/briefings", briefingsRouter);
app.use("/api/indices", indicesRouter);
app.use("/api/proxy", proxyRouter);

app.listen(env.port, () => {
  const live = Object.entries(liveProvidersConfigured)
    .filter(([, on]) => on)
    .map(([name]) => name);
  console.log(`[server] listening on :${env.port} (live providers: ${live.length ? live.join(", ") : "none, mock"})`);
});
