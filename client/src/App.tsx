import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Pill } from "./Pill";
import { Timetable } from "./Timetable";
import RoutingMachine from "./RoutingMachine";

export const App = () => {
  const [stops, setStops] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [busLoading, setBusLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const MapClickHandler = () => {
    useMapEvents({
      click: () => setSelectedRoute(null),
    });
    return null;
  };

  const bounds = [
    // [47.72073370652853, 19.119644165039066],
    // [47.66642780836732, 19.1792106628418],
  ];

  const busIconG3 = L.icon({
    iconUrl:
      "https://go.bkk.hu/api/ui-service/v1/icon?name=bus&color=009EE3&secondaryColor=FFFFFF&scale=1",
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });

  const busIconG4 = L.icon({
    iconUrl:
      "https://go.bkk.hu/api/ui-service/v1/icon?name=bus&color=e41f18&secondaryColor=FFFFFF&scale=1",
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });

  const STOP_ROTATIONS: Record<string, number> = {
    // G3 - Blue line
    "970": 125,
    "971": 210,
    "972": 180,
    "973": 0,
    "974": 90,

    // G4 - Red line
    "1001": -90,
    "1002": -90,
    "1003": 0,
    "1004": 30,
    "1005": -55,
  };

  const getStopIcon = (route: string, rotation?: number) =>
    L.divIcon({
      className: "",
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      html: `<div class="${route === "G3" ? "stop-iconG3" : "stop-iconG4"} ${rotation === undefined ? "no-arrow" : ""}" style="${rotation !== undefined ? `--rotate: ${rotation}deg` : ""}"></div>`,
    });

  const fetchStops = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/stops");
      const json = await res.json();
      setStops(json.stops || json);
    } catch (e) {
      console.error("Error fetching stops:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    setBusLoading(true);
    try {
      const res = await fetch(`/api/v1/buses`);
      const positions = await res.json();
      if (positions.error !== undefined) {
        throw new Error("Something failed");
      }
      if (!positions || positions.some((b) => !b.lat || !b.lon)) {
        console.error("Bus positions missing lat/lon");
        throw new Error("Bus position missing lat/lon");
      }
      setBuses(positions);
    } catch (e) {
      console.error("Error fetching bus positions:", e);
    } finally {
      setBusLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between h-[54px] bg-white border-b-[3px] border-[#c6c6c6] px-4">
        <img src="/logo_godgo.png" alt="Logo" className="max-h-full" />
        <div className="flex gap-2">
          <button
            onClick={fetchBuses}
            className="px-4 py-2 bg-green-600 text-white rounded w-fit"
            disabled={busLoading}
          >
            {busLoading ? "Fetching..." : "Get Bus Positions"}
          </button>
          <button
            onClick={fetchStops}
            className="px-4 py-2 bg-purple-600 text-white rounded w-fit"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Get Stops"}
          </button>
        </div>
      </header>
      <div className="flex-1">
        <MapContainer
          center={[47.69008467960837, 19.13739702507176]}
          maxBounds={bounds}
          maxBoundsViscosity={1.0}
          zoom={13}
          className="h-full w-full"
        >
          <MapClickHandler />

          {/*<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />*/}
          <TileLayer
            url="http://localhost:3000/Tiles/{z}/{x}/{y}.png"
            keepBuffer={20}
            minZoom={14}
            maxZoom={17}
            updateWhenIdle={false}
            updateInterval={0}
          />
          {stops
            .filter((stop) => {
              if (selectedRoute !== null) {
                return stop.route === selectedRoute;
              }
              return stop;
            })
            .map((stop, i) => (
              <Marker
                key={i}
                position={[stop.lat, stop.lon]}
                icon={getStopIcon(stop.route, STOP_ROTATIONS[stop.mid])}
                eventHandlers={{ click: () => setSelectedRoute(stop.route) }}
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
            ))}
          {buses.map((bus, i) => (
            <Marker
              key={i}
              position={[bus.lat, bus.lon]}
              icon={bus.route === "G3" ? busIconG3 : busIconG4}
              eventHandlers={{ click: () => setSelectedRoute(bus.route) }}
            >
              <Tooltip>
                <Pill variant={bus.route}>{bus.route}</Pill> {bus.rendszam}
              </Tooltip>
            </Marker>
          ))}
          {stops.length > 0 && selectedRoute && (
            <RoutingMachine
              key={selectedRoute}
              waypoints={stops
                .filter((stop) => {
                  return stop.route === selectedRoute;
                })
                .map((s) => [s.lat, s.lon])}
              options={{
                router: L.Routing.osrmv1({
                  serviceUrl: "http://localhost:3000/api/v1/route-proxy",
                }),
                show: false,
                routeWhileDragging: false,
                createMarker: () => false,
                lineOptions: {
                  addWaypoints: false,
                  styles: [
                    {
                      color: selectedRoute === "G3" ? "#009ee3" : "#e41f18",
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
    </div>
  );
};
