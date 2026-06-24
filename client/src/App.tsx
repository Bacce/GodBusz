import { useState } from "react";
import { MapView } from "./components/map/MapView";
import { Header } from "./components/ui/Header";
import { PopupModal } from "./components/ui/PopupModal";
import { useStops } from "./hooks/useStops";
import { useBuses } from "./hooks/useBuses";
import { usePopups } from "./hooks/usePopups";
import { useMapPersistence } from "./hooks/useMapPersistence";

export const App = () => {
  const [polling, setPolling] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);

  const stops = useStops();
  const buses = useBuses(polling);
  const { popup, dismiss } = usePopups();
  const { center, zoom, saveCenter, saveZoom } = useMapPersistence();

  return (
    <div className="flex flex-col h-screen">
      <Header polling={polling} onTogglePolling={() => setPolling((p) => !p)} />

      <div className="flex-1">
        <MapView
          center={center}
          zoom={zoom}
          stops={stops}
          buses={buses}
          polling={polling}
          selectedRoute={selectedRoute}
          onRouteSelect={setSelectedRoute}
          onRouteDeselect={() => setSelectedRoute(null)}
          onMoveEnd={saveCenter}
          onZoomEnd={saveZoom}
        />
      </div>

      {popup && <PopupModal popup={popup} onDismiss={dismiss} />}
    </div>
  );
};
