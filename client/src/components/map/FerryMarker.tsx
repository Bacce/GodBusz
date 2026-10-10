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
        <div className="text-sm font-bold">{marker.name}</div>
        <div className="text-xs text-gray-500">Kikötő / Kompkút</div>
      </Popup>
    </Marker>
  );
};
