import { useEffect } from "react";
import { useMap, Marker } from "react-leaflet";
import L from "leaflet";
import type { Stop } from "../../lib/types";

interface MapControllerProps {
  userPos: [number, number] | null;
  shouldFlyToUser: boolean;
  onFlyToUserHandled: () => void;
  shouldFocusStop: boolean;
  selectedStopId: string | null;
  stops: Stop[];
  onFocusHandled: () => void;
}

export const MapController = ({
  userPos,
  shouldFlyToUser,
  onFlyToUserHandled,
  shouldFocusStop,
  selectedStopId,
  stops,
  onFocusHandled,
}: MapControllerProps) => {
  const map = useMap();
  const userIcon = L.icon({
    iconUrl: "/icons/player1.png",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  useEffect(() => {
    if (shouldFlyToUser && userPos) {
      map.flyTo(userPos, 16);
      onFlyToUserHandled();
    }
  }, [shouldFlyToUser, userPos, map, onFlyToUserHandled]);

  useEffect(() => {
    if (shouldFocusStop && selectedStopId) {
      const stop = stops.find((s) => s.mid === selectedStopId);
      if (stop) {
        map.flyTo([stop.lat, stop.lon], 16);

        const timer = setTimeout(() => {
          map.eachLayer((layer) => {
            if (layer && layer.options && (layer.options as any).stopMid === selectedStopId) {
              layer.openPopup();
            }
          });
          onFocusHandled();
        }, 200);
        return () => clearTimeout(timer);
      } else {
        onFocusHandled();
      }
    }
  }, [shouldFocusStop, selectedStopId, stops, map, onFocusHandled]);

  return (
    <>
      {userPos && <Marker position={userPos} icon={userIcon} />}
    </>
  );
};
