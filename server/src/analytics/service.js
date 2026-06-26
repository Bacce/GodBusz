import db from "./db.js";

// format: YYYY-MM-DDTHH (UTC hour)
function getCurrentHour() {
  return new Date().toISOString().slice(0, 13);
}

// prepared statements (faster)
const insertStmt = db.prepare(`
  INSERT INTO hourly_requests(hour, count)
  VALUES (?, 1)
  ON CONFLICT(hour)
  DO UPDATE SET count = count + 1
`);

const selectStmt = db.prepare(`
  SELECT hour, count
  FROM hourly_requests
  ORDER BY hour DESC
  LIMIT ?
`);

const deleteOldStmt = db.prepare(`
  DELETE FROM hourly_requests
  WHERE hour < ?
`);

export function recordRequest() {
  try {
    insertStmt.run(getCurrentHour());
  } catch (err) {
    console.error("analytics recordRequest failed:", err);
  }
}

export function getHourlyStats(limit = 168) {
  try {
    return selectStmt.all(limit);
  } catch (err) {
    console.error("analytics getHourlyStats failed:", err);
    return [];
  }
}

export function cleanupOldStats(retentionDays = 90) {
  try {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 13);

    deleteOldStmt.run(cutoff);
  } catch (err) {
    console.error("analytics cleanup failed:", err);
  }
}
