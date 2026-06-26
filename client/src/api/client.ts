import {
  API_STOPS,
  API_BUSES,
  API_POPUPS,
  BACKEND_URL,
} from "../lib/constants";
import type { Stop, Bus, PopupData } from "../lib/types";

async function get<T>(
  url: string,
  params?: Record<string, string>,
): Promise<T> {
  const fullUrl = new URL(`${BACKEND_URL}${url}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) fullUrl.searchParams.append(key, value);
    });
  }
  const res = await fetch(fullUrl.toString());
  if (!res.ok)
    throw new Error(`HTTP ${res.status} fetching ${fullUrl.toString()}`);
  return res.json() as Promise<T>;
}

export async function fetchStops(date?: string): Promise<Stop[]> {
  const json = await get<{ stops?: Stop[] } | Stop[]>(API_STOPS, { date });
  return (Array.isArray(json) ? json : json.stops) ?? [];
}

export async function fetchBuses(date?: string): Promise<Bus[]> {
  const positions = await get<Bus[] & { error?: string }>(API_BUSES, { date });
  if ("error" in positions && positions.error !== undefined) {
    throw new Error("Bus API returned an error");
  }
  if (!Array.isArray(positions) || positions.some((b) => !b.lat || !b.lon)) {
    throw new Error("Bus positions missing lat/lon");
  }
  return positions;
}

export async function fetchPopups(): Promise<PopupData | null> {
  const json = await get<{ data?: PopupData[] }>(API_POPUPS);
  return json.data && json.data.length > 0 ? json.data[0] : null;
}
