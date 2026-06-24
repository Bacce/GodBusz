import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import { MapClickHandler } from "./MapClickHandler";
import { StopMarker } from "./StopMarker";
import { BusMarker } from "./BusMarker";
import RoutingMachine from "../../RoutingMachine";
import { MAP_BOUNDS, COLOR_G3, COLOR_G4, API_ROUTE_PROXY } from "../../lib/constants";
import type { Stop, Bus } from "../../lib/types";

interface MapViewProps {
  center: [number, number];
  zoom: number;
  stops: Stop[];
  buses: Bus[];
  polling: boolean;
  selectedRoute: string | null;
  onRouteSelect: (route: string) => void;
  onRouteDeselect: () => void;
  onMoveEnd: (lat: number, lng: number) => void;
  onZoomEnd: (zoom: number) => void;
}

export const MapView = ({
  center,
  zoom,
  stops,
  buses,
  polling,
  selectedRoute,
  onRouteSelect,
  onRouteDeselect,
  onMoveEnd,
  onZoomEnd,
}: MapViewProps) => {
  const visibleStops =
    selectedRoute !== null
      ? stops.filter((s) => s.route === selectedRoute)
      : stops;

  return (
    <MapContainer
      center={center}
      maxBounds={MAP_BOUNDS}
      maxBoundsViscosity={1.0}
      zoom={zoom}
      className="h-full w-full"
    >
      <MapClickHandler
        onMapClick={onRouteDeselect}
        onMoveEnd={onMoveEnd}
        onZoomEnd={onZoomEnd}
      />

      {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
      <TileLayer
        url={import.meta.env.VITE_TILES_URL ?? "/Tiles/{z}/{x}/{y}.png"}
        keepBuffer={20}
        minZoom={14}
        maxZoom={17}
        updateWhenIdle={false}
        updateInterval={0}
      />

      {/* Draw stops */}
      {visibleStops.map((stop, i) => (
        <StopMarker key={i} stop={stop} onClick={onRouteSelect} />
      ))}

      {/* Draw buses */}
      {polling &&
        buses.map((bus, i) => (
          <BusMarker key={i} bus={bus} onClick={onRouteSelect} />
        ))}

      {/* Draw route line */}
      {stops.length > 0 && selectedRoute && (
        <RoutingMachine
          key={selectedRoute}
          waypoints={stops
            .filter((s) => s.route === selectedRoute)
            .map((s) => [s.lat, s.lon])}
          options={{
            router: L.Routing.osrmv1({ serviceUrl: API_ROUTE_PROXY }),
            show: false,
            routeWhileDragging: false,
            createMarker: () => false,
            lineOptions: {
              addWaypoints: false,
              styles: [
                {
                  color: selectedRoute === "G3" ? COLOR_G3 : COLOR_G4,
                  opacity: 1,
                  weight: 3,
                },
              ],
            },
          }}
        />
      )}
    </MapContainer>
  );
};
