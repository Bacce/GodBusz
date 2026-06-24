import type { LatLngBoundsLiteral } from "leaflet";

// ── Map ──────────────────────────────────────────────────────────────────────
export const MAP_DEFAULT_CENTER: [number, number] = [
  47.69008467960837,
  19.13739702507176,
];
export const MAP_DEFAULT_ZOOM = 13;

export const MAP_BOUNDS: LatLngBoundsLiteral = [
  [47.73868842051323, 19.073553085327152],
  [47.6515704994603, 19.225044250488285],
];

// ── Routes / colours ─────────────────────────────────────────────────────────
export const COLOR_G3 = "#009ee3";
export const COLOR_G4 = "#e41f18";

// ── Bus icon URLs ─────────────────────────────────────────────────────────────
const BKK_ICON_BASE =
  "https://go.bkk.hu/api/ui-service/v1/icon?name=bus&secondaryColor=FFFFFF&scale=";

export const BUS_ICON_URL_G3 = `${BKK_ICON_BASE}1&color=009EE3`;
export const BUS_ICON_URL_G4 = `${BKK_ICON_BASE}1&color=e41f18`;
export const BUS_ICON_URL_HEADER = `${BKK_ICON_BASE}0.3&color=009EE3`;

// ── Stop arrow rotations (keyed by stop mid) ──────────────────────────────────
export const STOP_ROTATIONS: Record<string, number> = {
  // G3 – Blue line
  "970": 125,
  "971": 210,
  "972": 180,
  "973": 0,
  "974": 90,

  // G4 – Red line
  "1001": -90,
  "1002": -90,
  "1003": 0,
  "1004": 30,
  "1005": -55,
};

// ── API endpoints ─────────────────────────────────────────────────────────────
export const API_STOPS = "/api/v1/stops";
export const API_BUSES = "/api/v1/buses";
export const API_POPUPS = "/api/v1/popups";
export const API_ROUTE_PROXY = "/api/v1/route-proxy";

// ── Bus polling ───────────────────────────────────────────────────────────────
/** Number of consecutive identical responses before polling is auto-stopped. */
export const MAX_NO_CHANGE_COUNT = 20;
export const POLL_INTERVAL_MS = 2000;
