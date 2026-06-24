import express from "express";
import {
  formatData,
  getCurrentDate,
  getAllStops,
  getAllBus,
} from "./helper.js";
import { apiService } from "./services/apiService.js";
import { asyncHandler } from "./middleware/asyncHandler.js";
const router = express.Router();
const routeCache = new Map();

router.use(
  "/route-proxy",
  asyncHandler(async (req, res) => {
    const targetUrl = "https://osrm.hqnet.hu:8083/route/v1" + req.url;
    if (routeCache.has(targetUrl)) {
      return res.json(routeCache.get(targetUrl));
    }
    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`OSRM responded with ${response.status}`);
      }
      const data = await response.json();
      routeCache.set(targetUrl, data);
      res.json(data);
    } catch (e) {
      console.error(`Proxy error for ${targetUrl}:`, e);
      res.status(500).json({ error: "Proxy error", message: e.message });
    }
  }),
);

router.get(
  "/route",
  asyncHandler(async (req, res) => {
    const dateStr = getCurrentDate();
    const data = await apiService.loadRoute(dateStr);
    res.send(formatData(data));
  }),
);

router.get(
  "/stops",
  asyncHandler(async (req, res) => {
    const dateStr = getCurrentDate();
    const data = await apiService.loadRoute(dateStr);
    res.send(getAllStops(data));
  }),
);

router.get(
  "/buses",
  asyncHandler(async (req, res) => {
    const dateStr = getCurrentDate();
    const data = await apiService.loadRoute(dateStr);
    const buses = getAllBus(data);
    const locations = await apiService.getLocation(
      buses
        .map((bus) => {
          return bus.plate;
        })
        .join(","),
    );
    const richLocation = locations.gps.map((loc) => {
      return {
        ...loc,
        route: buses.find((bus) => {
          return bus.plate === loc.rendszam;
        }).route,
      };
    });

    res.json(richLocation);
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
