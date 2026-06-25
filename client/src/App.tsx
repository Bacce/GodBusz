import { useState, useEffect } from "react";
import type { PopupData } from "./lib/types";
import { MapView } from "./components/map/MapView";
import { Header } from "./components/ui/Header";
import { PopupModal } from "./components/ui/PopupModal";
import { useStops } from "./hooks/useStops";
import { useBuses } from "./hooks/useBuses";
import { usePopups } from "./hooks/usePopups";
import { useMapPersistence } from "./hooks/useMapPersistence";

const GTM_ID = "G-EL1XL7XCKT";

const loadGTM = () => {
  if (typeof window === "undefined") return;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag() {
    (window as any).dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", GTM_ID);
};

export const App = () => {
  const [polling, setPolling] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [errorPopup, setErrorPopup] = useState<PopupData | null>(null);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(
    localStorage.getItem("cookies_accepted") === "true" ? true : null,
  );

  useEffect(() => {
    if (cookiesAccepted === true) {
      loadGTM();
    }
  }, [cookiesAccepted]);

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

  const handleAcceptCookies = () => {
    localStorage.setItem("cookies_accepted", "true");
    setCookiesAccepted(true);
  };

  const handleDeclineCookies = () => {
    setCookiesAccepted(false);
  };

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
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

      {cookiesAccepted === null && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-[3px] border-[#c6c6c6] p-4 shadow-lg z-[2000] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" fill="#B07030" />
              <circle cx="8" cy="9" r="1.2" fill="#5D2E0D" />
              <circle cx="15" cy="8" r="1.2" fill="#5D2E0D" />
              <circle cx="12" cy="13" r="1.2" fill="#5D2E0D" />
              <circle cx="17" cy="14" r="1.2" fill="#5D2E0D" />
              <circle cx="9" cy="16" r="1.2" fill="#5D2E0D" />
            </svg>
            <span className="text-gray-800 font-medium">
              Sütiket használunk az oldalmegtekintések követése céljából
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleDeclineCookies}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Elutasít
            </button>
            <button
              onClick={handleAcceptCookies}
              className="bg-[#009EE3] text-white px-4 py-2 rounded-md hover:bg-[#008BCC] transition-colors text-sm font-medium"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
