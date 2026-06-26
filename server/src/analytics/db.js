import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ensure data directory exists
const dataDir = path.join(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "analytics.db");
const db = new Database(dbPath);

// initialize schema
db.exec(`
DROP TABLE IF EXISTS hourly_requests;
CREATE TABLE IF NOT EXISTS hourly_endpoint_requests (
  hour TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hour, endpoint)
);
`);

export default db;
