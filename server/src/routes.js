import express from "express";
import { formatData, getCurrentDate } from "./helper.js";
import { apiService } from "./services/apiService.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
import { cache } from "./middleware/cache.js";

const router = express.Router();

router.get(
  "/route",
  cache(10 * 60 * 1000),
  asyncHandler(async (req, res) => {
    const dateStr = getCurrentDate();

    const data = await apiService.loadRoute("14", dateStr);
    res.send(formatData(data));
  }),
);

router.get(
  "/position/:id",
  asyncHandler(async (req, res) => {
    const data = await apiService.getLocation(req.params.id);
    res.json(data);
  }),
);

export default router;
