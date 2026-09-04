import { Router } from "express";
import { getProxyCoverage, getProxySeries } from "../providers/marketData.js";
import type { Timeframe } from "../types.js";

export const proxyRouter = Router();

const VALID_TFS: Timeframe[] = ["1분", "15분", "1시간", "4시간", "일", "주", "월"];

proxyRouter.get("/series", (req, res) => {
  const target = String(req.query.target || "MARKET");
  const tfRaw = String(req.query.tf || "15분");
  const tf = (VALID_TFS.includes(tfRaw as Timeframe) ? tfRaw : "15분") as Timeframe;
  res.json(getProxySeries(target, tf));
});

proxyRouter.get("/coverage", (req, res) => {
  const tickers = String(req.query.tickers || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  res.json(getProxyCoverage(tickers));
});
