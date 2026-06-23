import { useState } from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import RoutingMachine from "./RoutingMachine";

export const App = () => {
  const [stops, setStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/route");
      const json = await res.json();
      setStops(json.data[0]);
    } catch (e) {
      console.error("Error fetching route data:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <button
        onClick={fetchData}
        className="px-4 py-2 bg-blue-600 text-white rounded w-fit"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Fetch Route"}
      </button>

      <MapContainer
        center={[47.69008467960837, 19.13739702507176]}
        zoom={13}
        className="h-[500px] w-[500px]"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {stops
          .filter((s) => s.visible)
          .map((stop, i) => (
            <Marker key={i} position={[stop.lat, stop.lon]}>
              <Tooltip>{stop.megallo}</Tooltip>
            </Marker>
          ))}
        {stops.length > 0 && (
          <RoutingMachine
            waypoints={stops
              .filter((s) => s.visible)
              .map((s) => [s.lat, s.lon])}
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
