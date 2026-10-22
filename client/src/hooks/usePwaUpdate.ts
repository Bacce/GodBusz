import { useState, useEffect } from 'react';

export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    // Reload the page when the new service worker takes control
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    const checkForUpdates = async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        setUpdateAvailable(true);
      } else {
        setUpdateAvailable(false);
      }
    };

    // Check on mount
    checkForUpdates();

  }, []);

  const updateApp = async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage('SKIP_WAITING');
    }
  };

  // iOS Safari non-standard standalone property
  const nav = window.navigator as unknown as { standalone?: boolean };
  const isPwaMode = window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;

  return { updateAvailable, updateApp, isPwaMode };
}
