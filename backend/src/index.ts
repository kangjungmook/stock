import express from "express";
import cors from "cors";
import { env } from "./env.js";
import { securitiesRouter } from "./routes/securities.js";
import { briefingsRouter } from "./routes/briefings.js";
import { indicesRouter } from "./routes/indices.js";
import { proxyRouter } from "./routes/proxy.js";

const app = express();

app.use(cors({ origin: env.frontendOrigins }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/securities", securitiesRouter);
app.use("/api/briefings", briefingsRouter);
app.use("/api/indices", indicesRouter);
app.use("/api/proxy", proxyRouter);

app.listen(env.port, () => {
  console.log(`[server] listening on :${env.port} (data provider: ${env.dataProvider})`);
});
