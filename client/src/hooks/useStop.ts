import { useState, useEffect } from "react";
import { fetchStop } from "../api/client";
import type { Stop } from "../lib/types";

export function useStop(mid: string, date?: string) {
  const [stop, setStop] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchStop(mid, date)
      .then((data) => {
        setStop(data);
      })
      .catch((e) => {
        console.error("Error fetching stop:", e);
        setError(e instanceof Error ? e : new Error(String(e)));
      })
      .finally(() => setLoading(false));
  }, [mid, date]);

  return { stop, loading, error };
}
