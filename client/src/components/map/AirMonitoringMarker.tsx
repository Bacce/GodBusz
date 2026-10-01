import L from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { AirMonitoringMarkerData } from "../../lib/types";

interface AirMonitoringMarkerProps {
  marker: AirMonitoringMarkerData;
  zoom: number;
}

export const AirMonitoringMarker = ({ marker, zoom }: AirMonitoringMarkerProps) => {
  const isSmall = zoom < 15;
  const size = isSmall ? 14 : 20;
  const icon = L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="stop-icon no-arrow stop-icon-filled ${isSmall ? "small" : ""}" style="--stop-color: #4988dbff;"></div>`,
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
