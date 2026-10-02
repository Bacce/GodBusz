import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { cache } from "../middleware/cache.js";

const router = express.Router();

router.get(
  "/:id",
  cache(10 * 60 * 1000),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const response = await fetch(`https://levegotisztasaggod.hu/api/devices/${id}/metrics?hours=1&limit=150`);

    if (!response.ok) {
      return res.status(response.status).send(`External API error: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  }),
);

export default router;
