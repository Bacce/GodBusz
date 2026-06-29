import { useState, useRef, useEffect } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { getStopIcon } from "../../lib/icons";
import type { Stop } from "../../lib/types";
import { Pill } from "../ui/Pill";
import { Timetable } from "../ui/Timetable";

interface StopMarkerProps {
  stop: Stop;
  onClick: (route: string) => void;
  zoom: number;
  selectedDate?: string;
}

export const StopMarker = ({ stop, onClick, zoom, selectedDate }: StopMarkerProps) => {
  const navigate = useNavigate();
  const markerRef = useRef<any>(null);

  useEffect(() => {
    const handleOpenPopup = (event: Event) => {
      if ((event as CustomEvent).detail === stop.mid) {
        markerRef.current?.openPopup();
      }
    };

    window.addEventListener("open-stop-popup", handleOpenPopup);
    return () => window.removeEventListener("open-stop-popup", handleOpenPopup);
  }, [stop.mid]);

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorite_stops");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = (mid: string) => {
    const newFavorites = favorites.includes(mid)
      ? favorites.filter((id) => id !== mid)
      : [...favorites, mid];
    setFavorites(newFavorites);
    localStorage.setItem("favorite_stops", JSON.stringify(newFavorites));
  };

  const icon = getStopIcon(stop.route, stop.dir ?? undefined, zoom);

  return (
    <Marker
      position={[stop.lat, stop.lon]}
      icon={icon}
      ref={markerRef}
      eventHandlers={{ click: () => onClick(stop.route) }}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
        {stop.name}
      </Tooltip>
      <Popup>
        <div className="text-sm font-bold flex items-center gap-2 pb-1 min-w-40">
          <button
            className={`transition-colors ${favorites.includes(stop.mid)
                ? "text-yellow-500"
                : "text-gray-400 hover:text-yellow-500"
              }`}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(stop.mid);
            }}
          >
            {favorites.includes(stop.mid) ? "★" : "☆"}
          </button>
           <span
             className="cursor-pointer hover:text-gray-500 transition-colors"
             onClick={() => {
               navigate(`/stop/${stop.mid}`);
               markerRef.current?.closePopup();
             }}
           >
            {stop.name}
          </span>
        </div>
        <Pill variant={stop.route}>{stop.route}</Pill>
        <div className="pb-6"></div>
         <Timetable trips={stop.trips} date={selectedDate} />
      </Popup>

    </Marker>
  );
};
