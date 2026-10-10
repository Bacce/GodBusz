import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

// Stop times taken from:
// https://szigetmonostor.hu/okos-terkep/godi-rev-2/
// https://szigetmonostor.hu/wp-content/uploads/2026/03/ujsagolo_2026_marcius_web_page-0028-scaled.jpg
const FERRIES = [
  {
    id: "ferry-0",
    name: "Horányi rév",
    lat: 47.68242214781732,
    lng: 19.1208028793335,
    times: [
      //{ hour: 5, minute: 0, recurrence: "workday" },
      { hour: 5, minute: 25, recurrence: "workday" },
      { hour: 5, minute: 55, recurrence: "workday" },

      { hour: 6, minute: 20, recurrence: "every-day" },
      { hour: 6, minute: 45, recurrence: "workday" },

      { hour: 7, minute: 20, recurrence: "every-day" },
      { hour: 7, minute: 50, recurrence: "workday" },

      { hour: 8, minute: 25, recurrence: "holiday-weekend" },

      { hour: 9, minute: 25, recurrence: "every-day" },
      { hour: 10, minute: 25, recurrence: "every-day" },
      { hour: 11, minute: 25, recurrence: "every-day" },
      { hour: 12, minute: 25, recurrence: "every-day" },
      { hour: 13, minute: 25, recurrence: "every-day" },

      { hour: 14, minute: 25, recurrence: "every-day" },
      { hour: 14, minute: 55, recurrence: "school-day" },

      { hour: 15, minute: 25, recurrence: "every-day" },

      { hour: 16, minute: 0, recurrence: "school-day" },
      { hour: 16, minute: 25, recurrence: "holiday-weekend" },
      { hour: 16, minute: 30, recurrence: "workday" },

      { hour: 17, minute: 0, recurrence: "workday" },
      { hour: 17, minute: 25, recurrence: "holiday-weekend" },
      { hour: 17, minute: 30, recurrence: "workday" },

      { hour: 18, minute: 0, recurrence: "workday" },
      { hour: 18, minute: 25, recurrence: "holiday-weekend" },
      { hour: 18, minute: 30, recurrence: "workday" },

      { hour: 19, minute: 25, recurrence: "holiday-weekend" },
      { hour: 19, minute: 30, recurrence: "workday" },

      { hour: 20, minute: 25, recurrence: "holiday-weekend" },
      { hour: 20, minute: 30, recurrence: "workday" },

      { hour: 21, minute: 25, recurrence: "holiday-weekend" },
      { hour: 21, minute: 30, recurrence: "workday" }
    ]
  },
  {
    id: "ferry-1",
    name: "Gödi rév",
    lat: 47.68012515937115,
    lng: 19.125781059265137,
    times: [
      //  { hour: 5, minute: 5, recurrence: "by-reservation" },
      { hour: 5, minute: 30, recurrence: "workday" },

      { hour: 6, minute: 0, recurrence: "workday" },
      { hour: 6, minute: 25, recurrence: "every-day" },
      { hour: 6, minute: 50, recurrence: "workday" },

      { hour: 7, minute: 25, recurrence: "every-day" },
      { hour: 7, minute: 55, recurrence: "workday" },

      { hour: 8, minute: 0, recurrence: "workday" },
      { hour: 8, minute: 30, recurrence: "holiday-weekend" },

      { hour: 9, minute: 30, recurrence: "every-day" },
      { hour: 10, minute: 30, recurrence: "every-day" },
      { hour: 11, minute: 30, recurrence: "every-day" },
      { hour: 12, minute: 30, recurrence: "every-day" },
      { hour: 13, minute: 30, recurrence: "every-day" },

      { hour: 14, minute: 30, recurrence: "every-day" },

      { hour: 15, minute: 0, recurrence: "school-day" },
      { hour: 15, minute: 30, recurrence: "every-day" },

      { hour: 16, minute: 5, recurrence: "school-day" },
      { hour: 16, minute: 30, recurrence: "holiday-weekend" },
      { hour: 16, minute: 35, recurrence: "workday" },

      { hour: 17, minute: 5, recurrence: "workday" },
      { hour: 17, minute: 30, recurrence: "holiday-weekend" },
      { hour: 17, minute: 35, recurrence: "workday" },

      { hour: 18, minute: 5, recurrence: "workday" },
      { hour: 18, minute: 30, recurrence: "holiday-weekend" },
      { hour: 18, minute: 35, recurrence: "workday" },

      { hour: 19, minute: 30, recurrence: "holiday-weekend" },
      { hour: 19, minute: 35, recurrence: "workday" },

      { hour: 20, minute: 30, recurrence: "holiday-weekend" },
      { hour: 20, minute: 35, recurrence: "workday" },

      { hour: 21, minute: 30, recurrence: "holiday-weekend" },
      { hour: 21, minute: 35, recurrence: "workday" }
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
