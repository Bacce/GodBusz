import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const checkStandalone = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as unknown as { standalone?: boolean }).standalone === true)
  );
};

const checkIOS = () => {
  if (typeof window === "undefined") return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
};

const checkDismissed = () => {
  if (typeof window === "undefined") return true;
  return localStorage.getItem("pwa_banner_dismissed") === "true";
};

export const PwaInstallBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone] = useState<boolean>(checkStandalone);
  const [isIOS] = useState<boolean>(checkIOS);
  const [dismissed, setDismissed] = useState<boolean>(checkDismissed);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isStandalone) return;

    // Handler for Android / Chromium browsers
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa_banner_dismissed", "true");
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
        handleDismiss();
      }
    } else if (isIOS) {
      setShowModal(true);
    }
  };

  if (isStandalone || dismissed) {
    return null;
  }

  // Only show if deferredPrompt is available (Android/Chrome) OR if on iOS
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-16 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border-2 border-[#52155a]/20 rounded-xl p-3.5 shadow-2xl z-[1900] flex items-center justify-between gap-3 animate-fade-in backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img
            src="/icon192.png"
            alt="GödGO App"
            className="w-11 h-11 rounded-lg shadow-sm border border-gray-100 flex-shrink-0"
          />
          <div>
            <h4 className="font-semibold text-gray-900 text-sm leading-tight">
              Telepítsd a GödGO-t!
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              {isIOS
                ? "Gyors elérés a kezdőképernyőről"
                : "Add hozzá a kezdőképernyőhöz az alkalmazást"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {deferredPrompt ? (
            <button
              onClick={handleInstallClick}
              className="bg-[#009EE3] hover:bg-[#008BCC] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              Telepítés
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#52155a] hover:bg-[#3d0f43] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1"
            >
              Telepítés
            </button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Bezárás"
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* iOS Installation Instruction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[2500]">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-[#52155a]/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <img src="/icon192.png" alt="GödGO" className="w-12 h-12 rounded-xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Alkalmazás telepítése iOS-en</h3>
              <p className="text-xs text-gray-500 mt-1">Kövesd a 2 egyszerű lépést:</p>
            </div>

            <div className="space-y-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#009EE3] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  Koppints a Safari böngésző alsó sávjában található <strong>Megosztás</strong> gombra:
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[#009EE3]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                    </svg>
                    Megosztás (Share)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#009EE3] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  Görgess le és válaszd a <strong>"Hozzáadás a kezdőképernyőhöz"</strong> opciót.
                  <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                    <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="12" y1="8" x2="12" y2="16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Hozzáadás a kezdőképernyőhöz
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                handleDismiss();
              }}
              className="w-full bg-[#009EE3] hover:bg-[#008BCC] text-white font-medium py-2.5 rounded-xl text-sm transition-colors shadow-sm"
            >
              Értem
            </button>
          </div>
        </div>
      )}
    </>
  );
};
