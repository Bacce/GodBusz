import { useState } from "react";
import {
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
} from "../lib/constants";

function readCenter(): [number, number] {
  try {
    const stored = localStorage.getItem("mapCenter");
    return stored ? JSON.parse(stored) : MAP_DEFAULT_CENTER;
  } catch {
    return MAP_DEFAULT_CENTER;
  }
}

function readZoom(): number {
  const stored = localStorage.getItem("mapZoom");
  return stored ? parseInt(stored, 10) : MAP_DEFAULT_ZOOM;
}

export function useMapPersistence() {
  const [center, setCenter] = useState<[number, number]>(readCenter());
  const [zoom, setZoom] = useState<number>(readZoom());

  const saveCenter = (lat: number, lng: number) => {
    const newCenter: [number, number] = [lat, lng];
    localStorage.setItem("mapCenter", JSON.stringify(newCenter));
    setCenter(newCenter);
  };

  const saveZoom = (z: number) => {
    localStorage.setItem("mapZoom", z.toString());
    setZoom(z);
  };

  return { center, zoom, saveCenter, saveZoom };
}
