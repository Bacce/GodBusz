import { useState, useEffect } from "react";
import { fetchStops } from "../api/client";
import type { Stop } from "../lib/types";

export function useStops() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStops()
      .then((data) => {
        setStops(data);
      })
      .catch((e) => console.error("Error fetching stops:", e))
      .finally(() => setLoading(false));
  }, []);

  return { stops, loading };
}
