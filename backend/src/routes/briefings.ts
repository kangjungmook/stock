import { Router } from "express";
import { getBriefing, getBriefings } from "../providers/marketData.js";

export const briefingsRouter = Router();

briefingsRouter.get("/", async (req, res) => {
  const tickers = String(req.query.tickers || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (tickers.length === 0) {
    res.json([]);
    return;
  }
  res.json(await getBriefings(tickers));
});

briefingsRouter.get("/:ticker", async (req, res) => {
  const snapshot = await getBriefing(req.params.ticker);
  if (!snapshot) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json(snapshot);
});
