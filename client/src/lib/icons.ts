import L from "leaflet";
import {
  BUS_ICON_URL_G3,
  BUS_ICON_URL_G4,
  STOP_ROTATIONS,
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
    html: `<div class="${route === "G3" ? "stop-iconG3" : "stop-iconG4"} ${
      rotation === undefined ? "no-arrow" : ""
    }" style="${rotation !== undefined ? `--rotate: ${rotation}deg` : ""}"></div>`,
  });

export { STOP_ROTATIONS };
