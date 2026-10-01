import { MapContainer, TileLayer } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import { MapClickHandler } from "./MapClickHandler";
import { StopMarker } from "./StopMarker";
import { BusMarker } from "./BusMarker";
import { TrainStopMarker } from "./TrainStopMarker";
import { AirMonitoringMarker } from "./AirMonitoringMarker";
import { AIR_MONITORING_STATIONS } from "../../lib/air-monitoring";
import RoutingMachine from "./RoutingMachine";
import {
  BUS_ICON_URL_HEADER,
  MAP_BOUNDS,
  COLOR_G3_ROUTE,
  ROUTE_COLORS,
  API_ROUTE_PROXY,
  BACKEND_URL,
} from "../../lib/constants";
import { MapController } from "./MapController";
import type { Stop, Bus, TrainStopMarkerData, AirMonitoringMarkerData } from "../../lib/types";


interface MapViewProps {
  center: [number, number];
  zoom: number;
  stops: Stop[];
  buses: Bus[];
  polling: boolean;
  onTogglePolling: () => void;
  selectedRoute: string | null;
  onRouteSelect: (route: string) => void;
  onRouteDeselect: () => void;
  onMoveEnd: (lat: number, lng: number) => void;
  onZoomEnd: (zoom: number) => void;
  selectedStopId: string | null;
  shouldFocusStop: boolean;
  onFocusHandled: () => void;
  selectedDate: string;
  trainStopMarkers?: TrainStopMarkerData[];
}

export const MapView = ({
  center,
  zoom,
  stops,
  buses,
  polling,
  onTogglePolling,
  selectedRoute,
  onRouteSelect,
  onRouteDeselect,
  onMoveEnd,
  onZoomEnd,
  selectedStopId,
  shouldFocusStop,
  onFocusHandled,
  selectedDate,
  trainStopMarkers = [],
}: MapViewProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [shouldFlyToUser, setShouldFlyToUser] = useState(false);

  const handleLocateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];

        const bounds = L.latLngBounds(MAP_BOUNDS);
        if (bounds.contains(L.latLng(coords[0], coords[1]))) {
          setUserLocation(coords);
          setShouldFlyToUser(true);
        } else {
          console.warn("User location is outside map bounds");
        }
      },
      (err) => console.error(err)
    );
  };

  const visibleStops =
    selectedRoute !== null
      ? stops.filter((s) => s.route === selectedRoute)
      : stops;




  return (
    <div className="relative h-full w-full">
      <div className="absolute top-1 right-2 z-[1000] flex flex-col items-end">
        <button
          onClick={onTogglePolling}
          title="Járművek megjelenítése"
          className={`px-1.5 py-0.5 mt-1 flex items-center justify-between gap-1.5 rounded border font-bold text-[13px] cursor-pointer select-none pointer-events-auto opacity-70 transition-colors min-w-[110px] ${polling
            ? "bg-[#4c0e5f] text-white border-[#c6c6c6] hover:border-[#1e1e1e]"
            : "bg-white text-[#1e1e1e] border-[#c6c6c6] hover:border-[#1e1e1e]"
            }`}
        >
          <span className="pl-0.5">Járművek</span>
          <img src={BUS_ICON_URL_HEADER} alt="" className="w-5 h-5 ml-1.5 mr-1" />
        </button>
        <button
          onClick={handleLocateUser}
          title="Saját helyzet"
          className="px-1.5 py-0.5 mt-1 flex items-center justify-between gap-1.5 rounded border font-bold text-[13px] cursor-pointer select-none pointer-events-auto opacity-70 transition-colors bg-white text-[#1e1e1e] border-[#c6c6c6] hover:border-[#1e1e1e] min-w-[110px]"
        >
          <span className="pl-0.5">Helyem</span>
          <span className="ml-1.5 mr-0.5">📍</span>
        </button>
      </div>
      <MapContainer
        center={center}
        maxBounds={MAP_BOUNDS}
        maxBoundsViscosity={1.0}
        zoom={zoom}
        className="h-full w-full"
      >
        <MapController
          userPos={userLocation}
          shouldFlyToUser={shouldFlyToUser}
          onFlyToUserHandled={() => setShouldFlyToUser(false)}
          shouldFocusStop={shouldFocusStop}
          selectedStopId={selectedStopId}
          stops={stops}
          onFocusHandled={onFocusHandled}
        />



        <MapClickHandler
          onMapClick={onRouteDeselect}

          onMoveEnd={onMoveEnd}
          onZoomEnd={onZoomEnd}
        />

        {/* <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> */}
        <TileLayer
          url={import.meta.env.VITE_BACKEND_URL + "/Tiles/{z}/{x}/{y}.png"}
          keepBuffer={20}
          minZoom={14}
          maxZoom={17}
          updateWhenIdle={false}
          updateInterval={0}
        />

        {/* Draw stops */}
        {visibleStops.map((stop) => (
          <StopMarker key={stop.mid} stop={stop} onClick={onRouteSelect} zoom={zoom} selectedDate={selectedDate} allStops={stops} />
        ))}

        {/* Draw buses */}
        {polling &&
          buses.map((bus) => (
            <BusMarker key={bus.rendszam} bus={bus} onClick={onRouteSelect} />
          ))}

        {/* Draw train stop markers */}
        {trainStopMarkers.map((marker) => (
          <TrainStopMarker key={marker.id} marker={marker} />
        ))}

        {/* Draw air monitoring markers */}
        {AIR_MONITORING_STATIONS.map((marker) => (
          <AirMonitoringMarker key={marker.id} marker={marker} />
        ))}

        {/* Draw route line */}
        {stops.length > 0 && selectedRoute && (
          <RoutingMachine
            key={selectedRoute}
            waypoints={stops
              .filter((s) => s.route === selectedRoute)
              .map((s) => [s.lat, s.lon])}
            options={{
              router: L.Routing.osrmv1({
                serviceUrl: BACKEND_URL + API_ROUTE_PROXY,
              }),
              show: false,
              routeWhileDragging: false,
              createMarker: () => false,
              lineOptions: {
                addWaypoints: false,
                styles: [
                  {
                    color: ROUTE_COLORS[selectedRoute] || COLOR_G3_ROUTE,
                    opacity: 1,
                    weight: 3,
                  },
                ],
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
