import { Marker, Popup } from "react-leaflet";
import { Pill } from "../ui/Pill";
import { busIconG3, busIconG4 } from "../../lib/icons";
import type { Bus } from "../../lib/types";
import { Plate } from "../ui/Plate";

interface BusMarkerProps {
  bus: Bus;
  onClick: (route: string) => void;
}

export const BusMarker = ({ bus, onClick }: BusMarkerProps) => (
  <Marker
    position={[bus.lat, bus.lon]}
    icon={bus.route === "G3" ? busIconG3 : busIconG4}
    eventHandlers={{ click: () => onClick(bus.route) }}
    zIndexOffset={1000}
  >
    <Popup>
      <Pill variant={bus.route}>{bus.route}</Pill>{" "}
      <Plate>{bus.rendszam}</Plate>
      <div>{Math.round(bus.speed)} km/h</div>
    </Popup>
  </Marker>
);
