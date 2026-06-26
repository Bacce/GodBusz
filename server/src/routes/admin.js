import express from "express";
import * as analytics from "../analytics/service.js";

const router = express.Router();

router.get("/request-stats", (req, res) => {
  const limit = Number(req.query.limit || 168);
  const data = analytics.getHourlyEndpointStats(limit);

  res.json(data);
});

export default router;
