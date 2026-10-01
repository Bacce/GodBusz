import L from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { AirMonitoringMarkerData } from "../../lib/types";

interface AirMonitoringMarkerProps {
  marker: AirMonitoringMarkerData;
}

export const AirMonitoringMarker = ({ marker }: AirMonitoringMarkerProps) => {
  const icon = L.divIcon({
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    html: `<div class="stop-icon no-arrow stop-icon-filled" style="--stop-color: #20b2aa;"></div>`,
  });
  return (
    <Marker position={[marker.lat, marker.lng]} icon={icon}>
      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
        <div className="flex items-center gap-1">
          <h1 className="font-bold">Levegő minőség - {marker.name}</h1>
        </div>
      </Tooltip>
      <Popup maxWidth={300}>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">Levegő minőség - {marker.name}</div>
          <a
            href={marker.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white text-[#009ee3] border border-[#009ee3] px-2 py-1 rounded text-center font-bold hover:bg-blue-50 transition-colors"
          >
            Megnyitás
          </a>
        </div>
      </Popup>
    </Marker>
  );
};
