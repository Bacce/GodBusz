import express from "express";
import rateLimit from "express-rate-limit";
import apiRoutes from "./routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;
const ALLOWED_ORIGIN = "https://god-busz.vercel.app";

app.use((req, res, next) => {
  const origin = req.get("Origin");
  if (process.env.NODE_ENV === "production") {
    if (origin === ALLOWED_ORIGIN) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      res.setHeader("Access-Control-Allow-Origin", "null");
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Serve static files from the 'public' directory
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("These ain't the droids you're looking for. 🤖");
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 1000, // Increased to accommodate 2s polling on /buses (~450 req/15min)
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

// Backend endpoints
app.use(
  "/api/v1",
  (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      const origin = req.get("Origin");
      if (origin !== ALLOWED_ORIGIN) {
        return res
          .status(403)
          .json({
            error: "Forbidden: Access only allowed from the official domain.",
          });
      }
    }
    next();
  },
  limiter,
  apiRoutes,
);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
