import { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, Popup } from "react-leaflet";
import L from "leaflet";
import { Pill } from "./Pill";
import { Timetable } from "./Timetable";

// function ClickHandler() {
//   useMapEvents({
//     click(e) {
//       console.log("Clicked coordinates:", e.latlng);
//     },
//   });

//   return null;
// }

export const App = () => {
  const [stops, setStops] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [busIds, setBusIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busLoading, setBusLoading] = useState(false);

  const bounds = [
    [47.72073370652853, 19.119644165039066],
    [47.66642780836732, 19.1792106628418],
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

  const stopIconG3 = L.divIcon({
    className: "stop-iconG3",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const stopIconG4 = L.divIcon({
    className: "stop-iconG4",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/route");
      const json = await res.json();
      setStops(json.data[0]);
      setBusIds(
        json.data.map((child: any[]) => child[0]?.rendszam).filter(Boolean),
      );
    } catch (e) {
      console.error("Error fetching route data:", e);
    } finally {
      setLoading(false);
    }
  };

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
          {/*<button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded w-fit"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Fetch Route"}
          </button>*/}
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
          {/*<ClickHandler />*/}

          {/*<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />*/}
          <TileLayer
            url="http://localhost:3000/Tiles/{z}/{x}/{y}.png"
            keepBuffer={20}
            minZoom={14}
            maxZoom={16}
            updateWhenIdle={false}
            updateInterval={0}
          />
          {stops.map((stop, i) => (
            <Marker
              key={i}
              position={[stop.lat, stop.lon]}
              icon={stop.route == "G3" ? stopIconG3 : stopIconG4}
            >
              <Popup>
                {stop.name}
                <br />
                <Pill variant={stop.route}>{stop.route}</Pill>

                <Timetable trips={stop.trips} />
              </Popup>
            </Marker>
          ))}
          {buses.map((bus, i) => (
            <Marker
              key={i}
              position={[bus.lat, bus.lon]}
              icon={bus.route === "G3" ? busIconG3 : busIconG4}
            >
              <Tooltip>
                <Pill variant={bus.route}>{bus.route}</Pill> {bus.rendszam}
              </Tooltip>
            </Marker>
          ))}
          {/*{stops.length > 0 && (
            <RoutingMachine
              waypoints={stops.map((s) => [s.lat, s.lon])}
              options={{
                router: L.Routing.osrmv1({
                  serviceUrl: "https://osrm.hqnet.hu:8083/route/v1",
                }),
                show: false,
                routeWhileDragging: false,
                createMarker: () => false,
                lineOptions: {
                  addWaypoints: false,
                  styles: [
                    { color: "rgb(0, 158, 227)", opacity: 1, weight: 3 },
                  ],
                },
              }}
            />
          )}*/}
        </MapContainer>
      </div>
    </div>
  );
};
