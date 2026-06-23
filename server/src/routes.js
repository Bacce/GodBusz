import express from "express";
import { formatData, getCurrentDate } from "./helper.js";
import { apiService } from "./services/apiService.js";
import { asyncHandler } from "./middleware/asyncHandler.js";

const router = express.Router();

router.get(
  "/route",
  asyncHandler(async (req, res) => {
    const dateStr = getCurrentDate();

    const data = await apiService.loadRoute("14", dateStr);
    res.send(formatData(data));
  }),
);

router.get(
  "/location",
  asyncHandler(async (req, res) => {
    const data = await apiService.getLocation("MLTM-138");
    res.json(data);
  }),
);

export default router;
