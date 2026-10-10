import { useState, useEffect } from "react";
import L from "leaflet";
import { Marker, Popup, Tooltip } from "react-leaflet";
import type { WebcamMarkerData } from "../../lib/types";

interface WebcamMarkerProps {
  marker: WebcamMarkerData;
  zoom: number;
}

const WebcamPopupContent = ({ marker, timestamp }: { marker: WebcamMarkerData; timestamp: number }) => {
  return (
    <>
      {marker.feedType === "stream" && marker.cameraFeedUrl && (
        <video
          src={marker.cameraFeedUrl}
          autoPlay
          muted
          style={{ width: "300px", marginBottom: "8px" }}
        />
      )}
      {marker.feedType === "image" && marker.cameraFeedUrl && (
        <img
          src={`${marker.cameraFeedUrl}${marker.cameraFeedUrl.includes("?") ? "&" : "?"}t=${timestamp}`}
          style={{ width: "300px", marginBottom: "8px" }}
          alt="Webcam feed"
        />
      )}
      {(marker.stationUrl || marker.cameraUrl) && (
        <a
          href={marker.stationUrl || marker.cameraUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-2 py-1 mt-2 text-xs font-bold text-[#009ee3] bg-white border border-[#009ee3] rounded hover:bg-blue-50 transition-colors"
        >
          További információ
        </a>
      )}
    </>
  );
}

export const WebcamMarker = ({ marker, zoom }: WebcamMarkerProps) => {
  const [timestamp, setTimestamp] = useState(Date.now());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setTimestamp(Date.now()), 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const isSmall = zoom < 15;
  const size = isSmall ? 14 : 20;
  const icon = L.divIcon({
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="stop-icon no-arrow stop-icon-filled ${isSmall ? "small" : ""}" style="--stop-color: #20b2aa;"></div>`,
  });

  return (
    <Marker icon={icon} position={[marker.lat, marker.lng]}>
      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
        Webkamera "{marker.id}"
      </Tooltip>
      <Popup eventHandlers={{ add: () => setIsOpen(true), remove: () => setIsOpen(false) }} minWidth={300}>
        <WebcamPopupContent key={isOpen ? 'open' : 'closed'} marker={marker} timestamp={timestamp} />
      </Popup>
    </Marker>
  );
};
