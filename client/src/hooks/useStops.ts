import { useState, useEffect } from "react";
import { fetchStops } from "../api/client";
import type { Stop } from "../lib/types";

export function useStops(date?: string) {
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStops(date)
      .then((data) => {
        setStops(data);
      })
      .catch((e) => console.error("Error fetching stops:", e))
      .finally(() => setLoading(false));
  }, [date]);

  return { stops, loading };
}
