import { Router } from "express";
import { getIndices } from "../providers/marketData.js";

export const indicesRouter = Router();

indicesRouter.get("/", async (_req, res) => {
  res.json(await getIndices());
});
