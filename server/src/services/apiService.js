import { isTooOld } from "../helper.js";

const BASE_URL = "https://god.molteam.hu/ajax.php";
const routeCache = new Map();

async function request(params) {
  const url = new URL(BASE_URL);
  Object.keys(params).forEach((key) =>
    url.searchParams.append(key, params[key]),
  );

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`External API responded with status ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  loadRoute: (date) => {
    const cached = routeCache.get(date);
    if (cached && !isTooOld(cached.timestamp)) {
      return cached.promise;
    }
    const promise = request({ op: "loadRoute", d: date });
    routeCache.set(date, { promise, timestamp: new Date().toISOString() });
    return promise;
  },
  getLocation: (id) => request({ op: "getGps", id }),
  getPopups: () => request({ op: "getPopup", a: "1" }),
};
