import { useState, useEffect } from "react";
import { fetchStops } from "../api/client";
import type { Stop } from "../lib/types";

export function useStops() {
  const [stops, setStops] = useState<Stop[]>([]);

  useEffect(() => {
    fetchStops()
      .then(setStops)
      .catch((e) => console.error("Error fetching stops:", e));
  }, []);

  return stops;
}
