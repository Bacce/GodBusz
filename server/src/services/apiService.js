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
    if (!routeCache.has(date)) {
      routeCache.set(date, request({ op: "loadRoute", d: date }));
    }
    return routeCache.get(date);
  },
  getLocation: (id) => request({ op: "getGps", id }),
};
