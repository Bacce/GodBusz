import {
  API_STOPS,
  API_BUSES,
  API_POPUPS,
  BACKEND_URL,
} from "../lib/constants";
import type { Stop, Bus, PopupData } from "../lib/types";

async function get<T>(url: string): Promise<T> {
  const fullUrl = `${BACKEND_URL}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${fullUrl}`);
  return res.json() as Promise<T>;
}

export async function fetchStops(): Promise<Stop[]> {
  const json = await get<{ stops?: Stop[] } | Stop[]>(API_STOPS);
  return (Array.isArray(json) ? json : json.stops) ?? [];
}

export async function fetchBuses(): Promise<Bus[]> {
  const positions = await get<Bus[] & { error?: string }>(API_BUSES);
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
