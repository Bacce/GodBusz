import type { LatLngBoundsLiteral } from "leaflet";

// ── Map ──────────────────────────────────────────────────────────────────────
export const MAP_DEFAULT_CENTER: [number, number] = [
  47.69008467960837, 19.13739702507176,
];
export const MAP_DEFAULT_ZOOM = 13;

export const MAP_BOUNDS: LatLngBoundsLiteral = [
  [47.73868842051323, 19.073553085327152],
  [47.6515704994603, 19.225044250488285],
];

// ── Routes / colours ─────────────────────────────────────────────────────────
export const COLOR_G1 = "#4ca22f";
export const COLOR_G2 = "#005ca5";
export const COLOR_G3 = "#009ee3";
export const COLOR_G4 = "#e41f18";

export const COLOR_G1_ROUTE = "#3d8526";
export const COLOR_G2_ROUTE = "#004a82";
export const COLOR_G3_ROUTE = "#0080B8";
export const COLOR_G4_ROUTE = "#C01A13";

// ── Bus icon URLs ─────────────────────────────────────────────────────────────
export const BUS_ICON_URL_G1 = `/icons/bus_g1.png`;
export const BUS_ICON_URL_G2 = `/icons/bus_g2.png`;
export const BUS_ICON_URL_G3 = `/icons/bus_g3.png`;
export const BUS_ICON_URL_G4 = `/icons/bus_g4.png`;
export const BUS_ICON_URL_HEADER = `/icons/bus_g3.png`;

// ── API endpoints ─────────────────────────────────────────────────────────────
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(
  /\/$/,
  "",
);
export const API_STOPS = "/api/v1/stops";
export const API_BUSES = "/api/v1/buses";
export const API_POPUPS = "/api/v1/popups";
export const API_STOP = "/api/v1/stop";
export const API_ROUTE_PROXY = "/api/v1/route-proxy";

// ── Bus polling ───────────────────────────────────────────────────────────────
/** Number of consecutive identical responses before polling is auto-stopped. */
export const MAX_NO_CHANGE_COUNT = 20;
export const POLL_INTERVAL_MS = 2000;
