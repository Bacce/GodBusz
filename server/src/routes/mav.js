import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { isTooOld } from "../helper.js";
import { mavService } from "../services/mavService.js";

const router = express.Router();
const stopCache = new Map();

router.get(
  "/stop/:stopId",
  asyncHandler(async (req, res) => {
    const { stopId } = req.params;
    const cached = stopCache.get(stopId);
    if (cached && !isTooOld(cached.timestamp, 60 * 1000)) {
      return res.json(cached.data);
    }
    const data = await mavService.requestMavStopData(stopId);
    if (stopCache.size > 10) stopCache.clear();
    stopCache.set(stopId, { data, timestamp: new Date().toISOString() });
    res.send(data);
  }),
);

export default router;
