import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { cache } from "../middleware/cache.js";

const router = express.Router();

const stations = [
  {
    "id": "hight",
    "stationUrl": "https://www.idokep.hu/automata/hight",
    "cameraUrl": "https://www.idokep.hu/webkamera/hight",
    "cameraFeedUrl": "//cam.idokep.hu/live/hight/live-f733593540.m3u8",
    "feedType": "stream",
    "lat": "47.6872",
    "lon": "19.139",
    "dir": "270",
    "provider": "idokep",
    "owner": "idokep"
  },
  {
    "id": "tod2",
    "stationUrl": "https://www.idokep.hu/automata/tod2",
    "cameraUrl": "https://www.idokep.hu/webkamera/tod2",
    "cameraFeedUrl": "https://cam.idokep.hu/kamera.php?user=tod2&token=211cee523ed66c96e92f48ce7727c382&t=179103636645038",
    "feedType": "image",
    "lat": "47.6938",
    "lon": "19.156",
    "dir": "90",
    "provider": "idokep",
    "owner": "szabotamas"
  },
  {
    "id": "tod3",
    "stationUrl": undefined,
    "cameraUrl": "https://www.idokep.hu/webkamera/tod3",
    "cameraFeedUrl": "//cam.idokep.hu/kamera.php?user=tod3&token=d4568980b507766af91e3c1ea2eb3d57&t=179103705915391",
    "feedType": "image",
    "lat": "47.6938",
    "lon": "19.156",
    "dir": "225",
    "provider": "idokep",
    "owner": "szabotamas"
  },
]

router.get(
  "/",
  cache(10 * 60 * 1000),
  asyncHandler(async (req, res) => {
    res.json(stations);
  }),
);

export default router;
