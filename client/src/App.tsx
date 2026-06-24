import { useState, useEffect, useRef } from "react";
import DOMPurify from "dompurify";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Pill } from "./Pill";
import { Plate } from "./Plate";
import { Timetable } from "./Timetable";
import RoutingMachine from "./RoutingMachine";

export const App = () => {
  const [stops, setStops] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [polling, setPolling] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [popup, setPopup] = useState<any | null>(null);

  const lastBusesRef = useRef<any[]>([]);
  const noChangeCountRef = useRef(0);

  const center = JSON.parse(
    localStorage.getItem("mapCenter") ||
      "[47.69008467960837, 19.13739702507176]",
  );
  const zoom = parseInt(localStorage.getItem("mapZoom") || "13", 10);

  const MapClickHandler = () => {
    useMapEvents({
      click: () => setSelectedRoute(null),
      moveend: (e) =>
        localStorage.setItem(
          "mapCenter",
          JSON.stringify([e.target.getCenter().lat, e.target.getCenter().lng]),
        ),
      zoomend: (e) =>
        localStorage.setItem("mapZoom", e.target.getZoom().toString()),
    });
    return null;
  };

  const bounds = [
    [47.73868842051323, 19.073553085327152],
    [47.6515704994603, 19.225044250488285],
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
    try {
      const res = await fetch("/api/v1/stops");
      const json = await res.json();
      setStops(json.stops || json);
    } catch (e) {
      console.error("Error fetching stops:", e);
    }
  };

  const fetchPopups = async () => {
    try {
      const res = await fetch("/api/v1/popups");
      const json = await res.json();
      if (json.data && json.data.length > 0) {
        setPopup(json.data[0]);
      }
    } catch (e) {
      console.error("Error fetching popups:", e);
    }
  };

  const fetchBuses = async () => {
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

      if (JSON.stringify(positions) === JSON.stringify(lastBusesRef.current)) {
        noChangeCountRef.current++;
        if (noChangeCountRef.current >= 20) {
          setPolling(false);
        }
      } else {
        noChangeCountRef.current = 0;
      }
      lastBusesRef.current = positions;

      setBuses(positions);
    } catch (e) {
      console.error("Error fetching bus positions:", e);
    }
  };

  useEffect(() => {
    fetchStops();
    fetchPopups();
  }, []);

  useEffect(() => {
    if (!polling) {
      noChangeCountRef.current = 0;
      lastBusesRef.current = [];
      return;
    }
    fetchBuses();
    const id = setInterval(fetchBuses, 2000);
    return () => clearInterval(id);
  }, [polling]);

  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between h-13.5 bg-white border-b-[3px] border-[#c6c6c6] px-4">
        <img src="/logo_godgo.png" alt="Logo" className="max-h-full" />
        <div className="flex gap-2">
          <button
            onClick={() => setPolling(!polling)}
            className={`pl-2 pr-4 py-1 rounded w-fit flex items-center gap-2 transition-colors ${
              polling
                ? "bg-[#009EE3] text-white"
                : "bg-transparent text-gray-600 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            <img src="https://go.bkk.hu/api/ui-service/v1/icon?name=bus&color=009EE3&secondaryColor=FFFFFF&scale=0.3" />
            Járművek követése
          </button>
        </div>
      </header>
      <div className="flex-1">
        <MapContainer
          center={center}
          maxBounds={bounds}
          maxBoundsViscosity={1.0}
          zoom={zoom}
          className="h-full w-full"
        >
          <MapClickHandler />

          {/*<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />*/}
          <TileLayer
            url={import.meta.env.VITE_TILES_URL ?? "/Tiles/{z}/{x}/{y}.png"}
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
          {polling &&
            buses.map((bus, i) => (
              <Marker
                key={i}
                position={[bus.lat, bus.lon]}
                icon={bus.route === "G3" ? busIconG3 : busIconG4}
                eventHandlers={{ click: () => setSelectedRoute(bus.route) }}
                zIndexOffset={1000}
              >
                <Popup>
                  <Pill variant={bus.route}>{bus.route}</Pill>{" "}
                  <Plate>{bus.rendszam}</Plate>
                  <div>{Math.round(bus.speed)} km/h</div>
                </Popup>
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
                  serviceUrl: "/api/v1/route-proxy",
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
      {popup && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPopup(null)}
        >
          <div
            className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto relative p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setPopup(null)}
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">{popup.title}</h2>
            <div
              className="text-gray-700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(popup.txt ?? ""),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
