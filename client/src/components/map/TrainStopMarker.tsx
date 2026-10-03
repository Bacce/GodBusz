import { useState, useRef, useCallback } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { TrainStopMarkerData, MavStopEntry } from "../../lib/types";
import { fetchMavStop } from "../../api/client";
import { getStopIcon } from "../../lib/icons";
import { MavTimetable } from "../ui/MavTimetable";

interface TrainStopMarkerProps {
  marker: TrainStopMarkerData;
}

export const TrainStopMarker = ({ marker }: TrainStopMarkerProps) => {
  const [entries, setEntries] = useState<MavStopEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const icon = getStopIcon("TRAIN");

  const refreshData = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchMavStop(marker.id)
      .then((data) => setEntries(data))
      .catch((err) => setError(err.message ?? "Hiba történt"))
      .finally(() => setLoading(false));
  }, [marker.id]);

  const handlePopupOpen = useCallback(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    refreshData();
  }, [refreshData]);

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
      <Popup maxWidth={400}>
        <div className="flex items-center justify-between pb-2">
          <div className="text-sm font-bold">{marker.id} vasútállomás</div>
          <button
            onClick={refreshData}
            disabled={loading}
            title="Frissítés"
            className="p-1 bg-white text-gray-600 border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <span className={loading ? "animate-spin inline-block" : ""}>🔄</span>
          </button>
        </div>
        {loading && entries.length === 0 && <div className="text-sm text-gray-500">Betöltés…</div>}
        {error && <div className="text-sm text-red-500">{error}</div>}
        {!loading && !error && entries.length === 0 && hasFetched.current && (
          <div className="text-sm text-gray-400">Nincs adat</div>
        )}
        {!error && entries.length > 0 && (
          <MavTimetable entries={entries} />
        )}
      </Popup>
    </Marker>
  );
};
