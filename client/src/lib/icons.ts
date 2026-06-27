import L from "leaflet";
import {
  BUS_ICON_URL_G1,
  BUS_ICON_URL_G2,
  BUS_ICON_URL_G3,
  BUS_ICON_URL_G4,
  COLOR_G1,
  COLOR_G2,
  COLOR_G3,
  COLOR_G4,
} from "./constants";

export const busIconG1 = L.icon({
  iconUrl: BUS_ICON_URL_G1,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

export const busIconG2 = L.icon({
  iconUrl: BUS_ICON_URL_G2,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

export const busIconG3 = L.icon({
  iconUrl: BUS_ICON_URL_G3,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

export const busIconG4 = L.icon({
  iconUrl: BUS_ICON_URL_G4,
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

const ROUTE_COLORS: Record<string, string> = {
  G1: COLOR_G1,
  G2: COLOR_G2,
  G3: COLOR_G3,
  G4: COLOR_G4,
};

export const getStopIcon = (route: string, rotation?: number, zoom?: number) => {
  const isSmall = zoom !== undefined && zoom < 15;
  const size = isSmall ? 14 : 20;
  return L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="stop-icon ${
      rotation === undefined ? "no-arrow" : ""
    } ${isSmall ? "small" : ""}" style="${rotation !== undefined ? `--rotate: ${rotation}deg;` : ""} --stop-color: ${ROUTE_COLORS[route] || COLOR_G3}"></div>`,
  });
};
