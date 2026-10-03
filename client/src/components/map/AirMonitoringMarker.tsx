import { useState, useRef, useCallback } from "react";
import L from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { AirMonitoringMarkerData, AirQualityMetric } from "../../lib/types";
import { fetchAirQuality } from "../../api/client";
interface AirMonitoringMarkerProps {
  marker: AirMonitoringMarkerData;
  zoom: number;
}

export const AirMonitoringMarker = ({ marker, zoom }: AirMonitoringMarkerProps) => {
  const [metric, setMetric] = useState<AirQualityMetric | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const isSmall = zoom < 15;
  const size = isSmall ? 14 : 20;
  const icon = L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="stop-icon no-arrow stop-icon-filled ${isSmall ? "small" : ""}" style="--stop-color: #4988dbff;"></div>`,
  });
  const handlePopupOpen = useCallback(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    setLoading(true);
    setError(null);

    fetchAirQuality(marker.id)
      .then((data) => {
        if (data.metrics && data.metrics.length > 0) {
          setMetric(data.metrics[data.metrics.length - 1]);
        }
      })
      .catch((err) => setError(err.message ?? "Hiba történt"))
      .finally(() => setLoading(false));
  }, [marker.id]);
  const getQuality = (key: keyof AirQualityMetric, value: number) => {
    switch (key) {
      case "pm10": return value < 50 ? "Jó" : "Rossz";
      case "pm02": return value < 25 ? "Jó" : "Rossz";
      case "pm01": return value < 30 ? "Jó" : "Rossz";
      case "rco2": return value < 1000 ? "Jó" : "Rossz";
      case "tvocIndex":
        if (value >= 32501) return "Tökéletes";
        if (value >= 30001) return "Átlagos";
        return "Rossz";
      case "noxIndex":
        if (value <= 19199) return "Tökéletes";
        if (value <= 20600) return "Átlagos";
        return "Rossz";
      default: return "—";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "Tökéletes":
      case "Jó": return "text-green-600";
      case "Átlagos": return "text-yellow-600";
      case "Rossz": return "text-red-600";
      default: return "text-gray-400";
    }
  };

  return (
    <Marker
      position={[marker.lat, marker.lng]}
      icon={icon}
      eventHandlers={{ popupopen: handlePopupOpen }}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
        <div className="flex items-center gap-1">
          <h1 className="font-bold">Levegőminőség - {marker.name}</h1>
        </div>
      </Tooltip>
      <Popup maxWidth={300}>
        <div className="flex flex-col gap-2">
          <div className="text-sm font-bold">Levegőminőség - {marker.name}</div>
          {loading && <div className="text-sm text-gray-500">Betöltés…</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}
          {!loading && !error && metric && (
            <table className="w-full text-left border-collapse min-w-max">
              <thead className="text-gray-500 border-b border-gray-200 font-semibold">
                <tr className="text-gray-500">
                  <th className="py-1 px-2 font-medium whitespace-nowrap text-left">Paraméter</th>
                  <th className="py-1 px-2 font-medium whitespace-nowrap text-left">Érték</th>
                  <th className="py-1 px-2 font-medium whitespace-nowrap text-right">Minőség</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">PM10</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.pm10} µg/m³</td>
                  <td className={`py-1 px-2 whitespace-nowrap text-right ${getQualityColor(getQuality("pm10", metric.pm10))}`}>{getQuality("pm10", metric.pm10)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">PM2.5</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.pm02} µg/m³</td>
                  <td className={`py-1 px-2 whitespace-nowrap text-right ${getQualityColor(getQuality("pm02", metric.pm02))}`}>{getQuality("pm02", metric.pm02)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">PM1.0</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.pm01} µg/m³</td>
                  <td className={`py-1 px-2 whitespace-nowrap text-right ${getQualityColor(getQuality("pm01", metric.pm01))}`}>{getQuality("pm01", metric.pm01)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">CO2</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.rco2} ppm</td>
                  <td className={`py-1 px-2 whitespace-nowrap text-right ${getQualityColor(getQuality("rco2", metric.rco2))}`}>{getQuality("rco2", metric.rco2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">Hőmérséklet</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.atmp} °C</td>
                  <td className="py-1 px-2 whitespace-nowrap text-right text-gray-400">{getQuality("atmp", metric.atmp)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">Nedvesség</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.rhum} %</td>
                  <td className="py-1 px-2 whitespace-nowrap text-right text-gray-400">{getQuality("rhum", metric.rhum)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">TVOC Index</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.tvocIndex}</td>
                  <td className={`py-1 px-2 whitespace-nowrap text-right ${getQualityColor(getQuality("tvocIndex", metric.tvocIndex))}`}>{getQuality("tvocIndex", metric.tvocIndex)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-1 px-2 whitespace-nowrap">NOx Index</td>
                  <td className="py-1 px-2 whitespace-nowrap font-medium">{metric.noxIndex}</td>
                  <td className={`py-1 px-2 whitespace-nowrap text-right ${getQualityColor(getQuality("noxIndex", metric.noxIndex))}`}>{getQuality("noxIndex", metric.noxIndex)}</td>
                </tr>
              </tbody>
            </table>
          )}
          {!loading && !error && metric && (
            <div className="text-[10px] text-gray-400 text-right mt-2 italic">
              Mérés: {new Date(metric.createdAt).toLocaleString("hu-HU")}
            </div>
          )}
          {!loading && !error && !metric && hasFetched.current && (
            <div className="text-sm text-gray-400">Nincs adat</div>
          )}
          <a
            href={marker.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white text-[#009ee3] border border-[#009ee3] px-2 py-1 rounded text-center font-bold hover:bg-blue-50 transition-colors"
          >
            Részletes adatok megnyitása
          </a>
        </div>
      </Popup>
    </Marker>
  );
};
