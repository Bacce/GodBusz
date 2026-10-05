import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { cache } from "../middleware/cache.js";

import * as cheerio from "cheerio";

const feedCache = new Map();
const FEED_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function scrapeCameraFeedUrl(cameraUrl, feedType) {
  const cached = feedCache.get(cameraUrl);
  if (cached && Date.now() - cached.timestamp < FEED_CACHE_TTL) {
    return cached.url;
  }

  try {
    const response = await fetch(cameraUrl);
    if (!response.ok) return cached ? cached.url : null;
    const html = await response.text();
    const $ = cheerio.load(html);

    let feedUrl = null;

    if (feedType === "stream") {
      $('source, a, video').each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("href");
        if (src && src.includes(".m3u8")) {
          feedUrl = src;
          return false;
        }
      });
    } else if (feedType === "image") {
      $('img, a').each((_, el) => {
        const src = $(el).attr("src") || $(el).attr("href");
        if (src && src.includes("kamera.php")) {
          feedUrl = src;
          return false;
        }
      });
    }

    if (feedUrl) {
      if (feedUrl.startsWith("//")) {
        feedUrl = `https:${feedUrl}`;
      } else if (!feedUrl.startsWith("http")) {
        const urlObj = new URL(cameraUrl);
        feedUrl = new URL(feedUrl, urlObj.origin).href;
      }
      feedCache.set(cameraUrl, { url: feedUrl, timestamp: Date.now() });
    }
  } catch (error) {
    console.error(`Error scraping ${cameraUrl}:`, error);
    return cached ? cached.url : null;
  }

  return feedUrl || (cached ? cached.url : null);
}

const router = express.Router();

const stations = [
  {
    "id": "hight",
    "stationUrl": "https://www.idokep.hu/automata/hight",
    "cameraUrl": "https://www.idokep.hu/webkamera/hight",
    "feedType": "stream",
    "lat": "47.6872",
    "lng": "19.139",
    "dir": "270",
    "provider": "idokep",
    "owner": "idokep"
  },
  {
    "id": "tod2",
    "stationUrl": "https://www.idokep.hu/automata/tod2",
    "cameraUrl": "https://www.idokep.hu/webkamera/tod2",
    "feedType": "image",
    "lat": "47.6938",
    "lng": "19.156",
    "dir": "90",
    "provider": "idokep",
    "owner": "szabotamas"
  },
  {
    "id": "tod3",
    "stationUrl": undefined,
    "cameraUrl": "https://www.idokep.hu/webkamera/tod3",
    "feedType": "image",
    "lat": "47.693645598936406",
    "lng": "19.155832529067997",
    "dir": "225",
    "provider": "idokep",
    "owner": "szabotamas"
  },
];

router.get(
  "/",
  cache(10 * 60 * 1000),
  asyncHandler(async (req, res) => {
    const stationsWithFeeds = await Promise.all(
      stations.map(async (s) => ({
        ...s,
        cameraFeedUrl: await scrapeCameraFeedUrl(s.cameraUrl, s.feedType),
      }))
    );
    res.json(stationsWithFeeds);
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const station = stations.find((s) => s.id === req.params.id);
    if (!station) {
      return res.status(404).json({ error: "Station not found" });
    }

    const feedUrl = await scrapeCameraFeedUrl(station.cameraUrl, station.feedType);
    res.json({ ...station, cameraFeedUrl: feedUrl });
  }),
);

export default router;
