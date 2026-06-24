import L from "leaflet";
import {
  BUS_ICON_URL_G3,
  BUS_ICON_URL_G4,
  STOP_ROTATIONS,
  COLOR_G3,
  COLOR_G4,
} from "./constants";

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

export const getStopIcon = (route: string, rotation?: number) =>
  L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<div class="stop-icon ${
      rotation === undefined ? "no-arrow" : ""
    }" style="${rotation !== undefined ? `--rotate: ${rotation}deg;` : ""} --stop-color: ${route === "G3" ? COLOR_G3 : COLOR_G4}"></div>`,
  });

export { STOP_ROTATIONS };
