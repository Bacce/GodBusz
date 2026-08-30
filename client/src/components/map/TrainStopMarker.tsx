import { useState, useRef, useCallback } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { TrainStopMarkerData, MavStopEntry } from "../../lib/types";
import { fetchMavStop } from "../../api/client";
import { getStopIcon } from "../../lib/icons";
import { Pill } from "../ui/Pill";

interface TrainStopMarkerProps {
  marker: TrainStopMarkerData;
}

export const TrainStopMarker = ({ marker }: TrainStopMarkerProps) => {
  const [entries, setEntries] = useState<MavStopEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const icon = getStopIcon("TRAIN");

  const handlePopupOpen = useCallback(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    setError(null);

    fetchMavStop(marker.id)
      .then((data) => setEntries(data))
      .catch((err) => setError(err.message ?? "Hiba történt"))
      .finally(() => setLoading(false));
  }, [marker.id]);

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
      eventHandlers={{ popupopen: handlePopupOpen }}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
        <div className="flex items-center gap-1">
          <h1 className="font-bold">{marker.id} vasútállomás</h1>
        </div>
      </Tooltip>
      <Popup>
        {loading && <div className="text-sm text-gray-500">Betöltés…</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && entries.length === 0 && !hasFetched.current && null}
        {!loading && !error && entries.length === 0 && hasFetched.current && (
          <div className="text-sm text-gray-400">Nincs adat</div>
        )}
      </Popup>
    </Marker>
  );
};
