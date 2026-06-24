import { Marker, Popup } from "react-leaflet";
import { getStopIcon, STOP_ROTATIONS } from "../../lib/icons";
import type { Stop } from "../../lib/types";
import { Pill } from "../ui/Pill";
import { Timetable } from "../ui/Timetable";

interface StopMarkerProps {
  stop: Stop;
  onClick: (route: string) => void;
}

export const StopMarker = ({ stop, onClick }: StopMarkerProps) => (
  <Marker
    position={[stop.lat, stop.lon]}
    icon={getStopIcon(stop.route, STOP_ROTATIONS[stop.mid])}
    eventHandlers={{ click: () => onClick(stop.route) }}
  >
    <Popup>
      <div className="text-sm font-bold flex pb-1 min-w-40">
        {stop.name} - {stop.mid}
      </div>
      <Pill variant={stop.route}>{stop.route}</Pill>
      <div className="pb-6"></div>
      <Timetable trips={stop.trips} />
    </Popup>
  </Marker>
);
