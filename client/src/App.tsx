import { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import RoutingMachine from "./RoutingMachine";

export const App = () => {
  const [stops, setStops] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [busIds, setBusIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busLoading, setBusLoading] = useState(false);

  const busIcon = L.icon({
    iconUrl: "./marker-icon-bus.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
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

  const fetchBuses = async () => {
    if (busIds.length === 0) return;
    setBusLoading(true);
    try {
      const res = await fetch(`/api/v1/position/${busIds.join(",")}`);
      const positions = await res.json();
      if (!positions.gps || positions.gps.some((b) => !b.lat || !b.lon))
        console.error("Bus positions missing lat/lon");
      setBuses(positions.gps);
    } catch (e) {
      console.error("Error fetching bus positions:", e);
    } finally {
      setBusLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-2">
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-blue-600 text-white rounded w-fit"
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Route"}
        </button>
        <button
          onClick={fetchBuses}
          className="px-4 py-2 bg-green-600 text-white rounded w-fit"
          disabled={busLoading}
        >
          {busLoading ? "Fetching..." : "Get Bus Positions"}
        </button>
      </div>

      <MapContainer
        center={[47.69008467960837, 19.13739702507176]}
        zoom={13}
        className="h-[500px] w-[500px]"
      >
        {/*<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />*/}
        <TileLayer
          url="http://localhost:3000/Tiles/{z}/{x}/{y}.png"
          keepBuffer={20}
          minZoom={13}
          maxZoom={16}
          updateWhenIdle={false}
          updateInterval={0}
        />
        {stops
          .filter((s) => s.visible)
          .map((stop, i) => (
            <Marker key={i} position={[stop.lat, stop.lon]}>
              <Tooltip>{stop.megallo}</Tooltip>
            </Marker>
          ))}
        {buses.map((bus, i) => (
          <Marker key={i} position={[bus.lat, bus.lon]} icon={busIcon}>
            <Tooltip>{bus.rendszam}</Tooltip>
          </Marker>
        ))}
        {stops.length > 0 && (
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
                styles: [{ color: "blue", opacity: 1, weight: 3 }],
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
