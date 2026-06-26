import db from "./db.js";

// format: YYYY-MM-DDTHH (UTC hour)
function getCurrentHour() {
  return new Date().toISOString().slice(0, 13);
}

function getEndpoint(req) {
  return req.route?.path || req.path;
}

// prepared statements (faster)
const recordStmt = db.prepare(`
  INSERT INTO hourly_endpoint_requests(hour, endpoint, count)
  VALUES (?, ?, 1)
  ON CONFLICT(hour, endpoint)
  DO UPDATE SET count = count + 1
`);

const selectStmt = db.prepare(`
  SELECT hour, endpoint, count
  FROM hourly_endpoint_requests
  ORDER BY hour DESC, count DESC
  LIMIT ?
`);

const deleteOldStmt = db.prepare(`
  DELETE FROM hourly_endpoint_requests
  WHERE hour < ?
`);

export function recordRequest(req) {
  try {
    const hour = getCurrentHour();
    const endpoint = getEndpoint(req);

    recordStmt.run(hour, endpoint);
  } catch (err) {
    console.error("analytics recordRequest failed:", err);
  }
}

export function getHourlyEndpointStats(limit = 168) {
  try {
    return selectStmt.all(limit);
  } catch (err) {
    console.error("analytics getHourlyEndpointStats failed:", err);
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
