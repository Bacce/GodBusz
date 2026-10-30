import L from "leaflet";
import { useRef, useEffect, useMemo } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import { getStopIcon } from "../../lib/icons";
import type { Stop } from "../../lib/types";
import { Pill } from "../ui/Pill";
import { Timetable } from "../ui/Timetable";
import { normalize } from "../../lib/utils";
import { useFavorites } from "../../hooks/useFavorites";

interface StopMarkerProps {
  stop: Stop;
  onClick: (route: string) => void;
  zoom: number;
  selectedDate?: string;
  allStops: Stop[];
}

export const StopMarker = ({ stop, onClick, zoom, selectedDate, allStops }: StopMarkerProps) => {
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

  const { favorites, toggleFavorite } = useFavorites();

  const overlappingStops = useMemo(() => {
    return allStops.filter((s) =>
      s.mid !== stop.mid &&
      Math.abs(s.lat - stop.lat) < 1e-12 &&
      Math.abs(s.lon - stop.lon) < 1e-12
    );
  }, [stop.mid, stop.lat, stop.lon, allStops]);

  const iconBase = getStopIcon(stop.route, stop.dir ?? undefined, zoom);

  const icon = useMemo(() => {
    const overlapGroup = [stop, ...overlappingStops].sort((a, b) => a.mid.localeCompare(b.mid));
    const index = overlapGroup.findIndex((s) => s.mid === stop.mid);

    if (index === -1 || overlappingStops.length === 0) {
      return iconBase;
    }

    const offsetValue = (Math.floor(index / 2) + 1) * 5;
    const marginLeft = index % 2 === 0 ? `-${offsetValue}px` : `${offsetValue}px`;

    return L.divIcon({
      ...iconBase.options,
      html: typeof iconBase.options.html === "string"
        ? iconBase.options.html.replace(
            'style="',
            `style="margin-left: ${marginLeft}; `
          )
        : iconBase.options.html,
    });
  }, [iconBase, overlappingStops, stop.mid]);
  const siblingStops = useMemo(() => {
    const normName = normalize(stop.name);
    return allStops.filter((s) => normalize(s.name) === normName);
  }, [stop.name, allStops]);


  useEffect(() => {
    if (overlappingStops.length > 0) {
      //console.log(`Stop ${stop.mid} (${stop.name}) overlaps with:`, overlappingStops.map(s => s.name).join(", "));
    }
  }, [overlappingStops, stop.mid, stop.name]);

  return (
    <Marker
      position={[stop.lat, stop.lon]}
      icon={icon}
      ref={markerRef}
      eventHandlers={{ click: () => onClick(stop.route) }}
    >
      <Tooltip direction="top" offset={[0, -20]} opacity={1}>
        <div className="flex items-center gap-1">
          <Pill variant={stop.route}>{stop.route}</Pill>
          {stop.name}
        </div>
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
        <div className="flex gap-1">
          {siblingStops.map((s) => (
            <div
              key={s.mid}
              className={`cursor-pointer ${s.mid === stop.mid ? "opacity-100" : "opacity-50 hover:opacity-100"} transition-opacity`}
              onClick={(e) => {
                e.stopPropagation();
                if (s.mid !== stop.mid) {
                  onClick(s.route);
                  markerRef.current?.closePopup();
                  setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("open-stop-popup", { detail: s.mid }));
                  }, 300);
                }
              }}
            >
              <Pill variant={s.route}>{s.route}</Pill>
            </div>
          ))}
        </div>
        <div className="pb-6"></div>
        <Timetable trips={stop.trips} date={selectedDate} />
      </Popup>

    </Marker>
  );
};
