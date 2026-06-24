import { useState, useEffect } from "react";
import { fetchPopups } from "../api/client";
import type { PopupData } from "../lib/types";

export function usePopups() {
  const [popup, setPopup] = useState<PopupData | null>(null);

  useEffect(() => {
    fetchPopups()
      .then(setPopup)
      .catch((e) => console.error("Error fetching popups:", e));
  }, []);

  const dismiss = () => setPopup(null);

  return { popup, dismiss };
}
