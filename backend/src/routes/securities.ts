import { Router } from "express";
import { listSecurities, searchSecurities } from "../providers/marketData.js";

export const securitiesRouter = Router();

securitiesRouter.get("/", (_req, res) => {
  res.json(listSecurities());
});

securitiesRouter.get("/search", (req, res) => {
  const q = String(req.query.q || "");
  res.json(searchSecurities(q));
});
