import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import type { PopupData, TrainStopMarkerData } from "./lib/types";
import { MapView } from "./components/map/MapView";
import { Header } from "./components/ui/Header";
import { PopupModal } from "./components/ui/PopupModal";
import { useStops } from "./hooks/useStops";
import { useBuses } from "./hooks/useBuses";
import { usePopups } from "./hooks/usePopups";
import { useMapPersistence } from "./hooks/useMapPersistence";
import { useFerries } from "./hooks/useFerries";
import { StopPage } from "./pages/StopPage";
import { CookieBanner } from "./components/ui/CookieBanner";
import { PwaInstallBanner } from "./components/ui/PwaInstallBanner";
import { MapStatusOverlay } from "./components/map/MapStatusOverlay";
import { initGTM } from "./lib/analytics";
import { getTodayISO } from "./lib/utils";

export const App = () => {
  const [polling, setPolling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [shouldFocusStop, setShouldFocusStop] = useState(false);
  const [errorPopup, setErrorPopup] = useState<PopupData | null>(null);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(
    localStorage.getItem("cookies_accepted") === "true" ? true : null,
  );

  useEffect(() => {
    if (cookiesAccepted === true) {
      initGTM();
    }
  }, [cookiesAccepted]);

  const { stops, loading: stopsLoading } = useStops(selectedDate);
  const { ferries } = useFerries();
  const buses = useBuses(
    polling,
    () => {
      setPolling(false);
      setErrorPopup({
        title: "Hiba",
        txt: "Jármű követés nem elérhető, próbálja meg később",
      });
    },
    selectedDate,
  );
  const { popup, dismiss } = usePopups();
  const { center, zoom, saveCenter, saveZoom } = useMapPersistence();

  const trainStopMarkers: TrainStopMarkerData[] = [
    { id: "Felsőgöd", lat: 47.7054455, lng: 19.1430698 },
    { id: "Göd", lat: 47.687874, lng: 19.137394 },
    { id: "Alsógöd", lat: 47.67823981970107, lng: 19.134696722030643 },
  ];


  const handleAcceptCookies = () => {
    localStorage.setItem("cookies_accepted", "true");
    setCookiesAccepted(true);
  };

  const handleDeclineCookies = () => {
    setCookiesAccepted(false);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedRoute(null);
    setSelectedStopId(null);
  };

  const handleStopSelect = (mid: string, focusOnly = false) => {
    const stop = stops.find((s) => s.mid === mid);
    if (stop) {
      if (!focusOnly) {
        setSelectedRoute(stop.route);
      }
      setSelectedStopId(mid);
      setShouldFocusStop(true);
    }
  };

  return (
    <Router>
      <div className="flex flex-col h-dvh overflow-hidden">
        <Header
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          stops={stops}
          onStopSelect={handleStopSelect}
        />

        <Routes>
          <Route
            path="/"
            element={
              <div className="flex-1 relative">
                <MapView
                  center={center}
                  zoom={zoom}
                  stops={stops}
                  buses={buses}
                  polling={polling}
                  onTogglePolling={() => setPolling((p) => !p)}
                  selectedRoute={selectedRoute}
                  onRouteSelect={setSelectedRoute}
                  onRouteDeselect={() => setSelectedRoute(null)}
                  onMoveEnd={saveCenter}
                  onZoomEnd={saveZoom}
                  selectedStopId={selectedStopId}
                  shouldFocusStop={shouldFocusStop}
                  onFocusHandled={() => setShouldFocusStop(false)}
                  selectedDate={selectedDate}
                  trainStopMarkers={trainStopMarkers}
                  ferryMarkers={ferries}
                />

                <MapStatusOverlay loading={stopsLoading} empty={stops.length === 0} />
              </div>
            }
          />
          <Route path="/stop/:mid" element={<StopPage selectedDate={selectedDate} />} />

        </Routes>

        {popup && <PopupModal popup={popup} onDismiss={dismiss} />}
        {errorPopup && (
          <PopupModal popup={errorPopup} onDismiss={() => setErrorPopup(null)} />
        )}

        <PwaInstallBanner />

        {cookiesAccepted === null && <CookieBanner onAccept={handleAcceptCookies} onDecline={handleDeclineCookies} />}
      </div>
    </Router>
  );

};
