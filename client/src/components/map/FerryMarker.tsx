import { Marker, Popup, Tooltip } from "react-leaflet";
import type { FerryMarkerData } from "../../lib/types";
import { getStopIcon } from "../../lib/icons";
import { FerryTimetable } from "../ui/FerryTimetable";

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
          <div className="flex flex-col gap-1">
            <div className="text-[11px]">Az itt megadott időpontok tájékoztató jellegűek.</div>
            <a
              href="https://szigetmonostor.hu/okos-terkep/godi-rev-2/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Hivatalos menetrend
            </a>
            <a
              href="https://www.facebook.com/rev.godi/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Aktuális információk - Facebook
            </a>
          </div>

          <div className="mt-2">
            <FerryTimetable times={marker.times} />
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
