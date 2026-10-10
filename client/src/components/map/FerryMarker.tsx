import { Marker, Popup, Tooltip } from "react-leaflet";
import type { FerryMarkerData } from "../../lib/types";
import { getStopIcon } from "../../lib/icons";

interface FerryMarkerProps {
  marker: FerryMarkerData;
}

export const FerryMarker = ({ marker }: FerryMarkerProps) => {
  const icon = getStopIcon("FERRY");

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
        <div className="flex items-center gap-1">
          <h1 className="font-bold">{marker.name}</h1>
        </div>
      </Tooltip>
      <Popup maxWidth={400}>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">{marker.name}</div>
          <div className="text-xs text-gray-500">Kikötő / Kompkút</div>
          <div className="mt-2 border-t pt-2">
            <div className="text-xs font-semibold mb-1">Menetrend:</div>
            <div className="flex flex-col gap-1">
              {marker.times.map((t, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-mono">{t.hour.toString().padStart(2, "0")}:{t.minute.toString().padStart(2, "0")}</span>
                  <span className="text-gray-400 italic">
                    {t.recurrence === "every-day" && "Mindig"}
                    {t.recurrence === "workday" && "Munkanapokon"}
                    {t.recurrence === "holiday-weekend" && "Ünnep/Hétvége"}
                    {t.recurrence === "school-day" && "Tanítási napokon"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
