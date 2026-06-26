import { Marker, Popup } from "react-leaflet";
import { Pill } from "../ui/Pill";
import { busIconG1, busIconG2, busIconG3, busIconG4 } from "../../lib/icons";
import type { Bus } from "../../lib/types";
import { Plate } from "../ui/Plate";

interface BusMarkerProps {
  bus: Bus;
  onClick: (route: string) => void;
}

export const BusMarker = ({ bus, onClick }: BusMarkerProps) => {
  const icons: Record<string, any> = {
    G1: busIconG1,
    G2: busIconG2,
    G3: busIconG3,
    G4: busIconG4,
  };

  return (
    <Marker
      position={[bus.lat, bus.lon]}
      icon={icons[bus.route] || busIconG3}
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
};
