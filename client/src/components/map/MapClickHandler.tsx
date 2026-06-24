import { useMapEvents } from "react-leaflet";

interface MapClickHandlerProps {
  onMapClick: () => void;
  onMoveEnd: (lat: number, lng: number) => void;
  onZoomEnd: (zoom: number) => void;
}

export const MapClickHandler = ({
  onMapClick,
  onMoveEnd,
  onZoomEnd,
}: MapClickHandlerProps) => {
  useMapEvents({
    click: () => onMapClick(),
    moveend: (e) => {
      const { lat, lng } = e.target.getCenter();
      onMoveEnd(lat, lng);
    },
    zoomend: (e) => onZoomEnd(e.target.getZoom()),
  });
  return null;
};
