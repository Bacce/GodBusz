import { useState, useEffect, useRef } from "react";
import { fetchBuses } from "../api/client";
import { MAX_NO_CHANGE_COUNT, POLL_INTERVAL_MS } from "../lib/constants";
import type { Bus } from "../lib/types";

export function useBuses(polling: boolean) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const lastBusesRef = useRef<Bus[]>([]);
  const noChangeCountRef = useRef(0);

  // Expose a setter so the caller can turn polling off when the feed stalls.
  const [active, setActive] = useState(polling);

  // Sync with the external `polling` flag.
  useEffect(() => {
    setActive(polling);
  }, [polling]);

  useEffect(() => {
    if (!active) {
      noChangeCountRef.current = 0;
      lastBusesRef.current = [];
      setBuses([]);
      return;
    }

    const poll = async () => {
      try {
        const positions = await fetchBuses();

        if (
          JSON.stringify(positions) === JSON.stringify(lastBusesRef.current)
        ) {
          noChangeCountRef.current++;
          if (noChangeCountRef.current >= MAX_NO_CHANGE_COUNT) {
            setActive(false);
          }
        } else {
          noChangeCountRef.current = 0;
        }
        lastBusesRef.current = positions;
        setBuses(positions);
      } catch (e) {
        console.error("Error fetching bus positions:", e);
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [active]);

  return buses;
}
