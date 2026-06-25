import { useState } from "react";
import type { PopupData } from "./lib/types";
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
  const [errorPopup, setErrorPopup] = useState<PopupData | null>(null);

  const { stops, loading: stopsLoading } = useStops();
  const buses = useBuses(polling, () => {
    setPolling(false);
    setErrorPopup({
      title: "Hiba",
      txt: "Jármű követés nem elérhető, próbálja meg később",
    });
  });
  const { popup, dismiss } = usePopups();
  const { center, zoom, saveCenter, saveZoom } = useMapPersistence();

  return (
    <div className="flex flex-col h-screen">
      <Header polling={polling} onTogglePolling={() => setPolling((p) => !p)} />

      <div className="flex-1 relative">
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

        {stopsLoading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-2 text-sm font-medium text-gray-700">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span>Megállók betöltése...</span>
          </div>
        )}
      </div>

      {popup && <PopupModal popup={popup} onDismiss={dismiss} />}
      {errorPopup && (
        <PopupModal popup={errorPopup} onDismiss={() => setErrorPopup(null)} />
      )}
    </div>
  );
};
