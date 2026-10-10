import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

const FERRIES = [
  {
    id: "ferry-1",
    name: "Gödi rév",
    lat: 47.68012515937115,
    lng: 19.125781059265137,
    times: [
      { hour: 6, minute: 30, recurrence: "every-day" },
      { hour: 12, minute: 0, recurrence: "workday" },
      { hour: 18, minute: 45, recurrence: "school-day" },
      { hour: 21, minute: 15, recurrence: "holiday-weekend" },
    ],
  },
];

router.get(
  "/",
  asyncHandler(async (req, res) => {
    res.json(FERRIES);
  }),
);

export default router;
