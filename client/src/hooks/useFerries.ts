import { useState, useEffect } from "react";
import { fetchFerries } from "../api/client";
import type { FerryMarkerData } from "../lib/types";

export function useFerries() {
  const [ferries, setFerries] = useState<FerryMarkerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFerries()
      .then((data) => {
        setFerries(data);
      })
      .catch((e) => console.error("Error fetching ferries:", e))
      .finally(() => setLoading(false));
  }, []);

  return { ferries, loading };
}
