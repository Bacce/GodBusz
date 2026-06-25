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
export const COLOR_G3 = "#009ee3";
export const COLOR_G4 = "#e41f18";
export const COLOR_G3_ROUTE = "#0080B8";
export const COLOR_G4_ROUTE = "#C01A13";

// ── Bus icon URLs ─────────────────────────────────────────────────────────────
export const BUS_ICON_URL_G3 = `/icons/bus_g3.png`;
export const BUS_ICON_URL_G4 = `/icons/bus_g4.png`;
export const BUS_ICON_URL_HEADER = `/icons/bus_g3.png`;

// ── Stop arrow rotations (keyed by stop mid) ──────────────────────────────────
export const STOP_ROTATIONS: Record<string, number> = {
  // G3 – Blue line
  //"965": 0,
  "966": 40,
  "967": -150,
  "968": -150,
  "969": 140,

  "970": 125,
  "971": 210,
  "972": 180,
  "973": 0,
  "974": 90,
  "975": 140,
  "976": -120,
  "977": -140,
  "978": -140,
  "979": -140,
  "980": -90,
  "981": -130,
  "982": 0,
  "983": 0,
  "984": 0,
  "985": 0,
  "986": 0,
  "987": 0,
  //"988": 0,

  // G4 – Red line
  "991": 180,
  "992": 180,
  "993": 180,
  "994": 180,
  "995": 90,
  "996": 40,
  "997": 40,
  "998": 40,
  "999": -120,
  "1000": -30,
  "1001": -90,
  "1002": -90,
  "1003": 0,
  "1004": 30,
  "1005": -55,
  "1006": -55,
  //"1007": 0,
};

// ── API endpoints ─────────────────────────────────────────────────────────────
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(
  /\/$/,
  "",
);
export const API_STOPS = "/api/v1/stops";
export const API_BUSES = "/api/v1/buses";
export const API_POPUPS = "/api/v1/popups";
export const API_ROUTE_PROXY = "/api/v1/route-proxy";

// ── Bus polling ───────────────────────────────────────────────────────────────
/** Number of consecutive identical responses before polling is auto-stopped. */
export const MAX_NO_CHANGE_COUNT = 20;
export const POLL_INTERVAL_MS = 2000;
