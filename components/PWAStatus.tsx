'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

export function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    // Check if installable
    const checkInstallable = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstallable(!isStandalone && !isInWebAppiOS);
    };

    checkInstallable();
    window.addEventListener('beforeinstallprompt', () => setIsInstallable(true));

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      });
    }
  };

  // Don't show anything if everything is normal and online
  if (isOnline && !updateAvailable) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex flex-col gap-2">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
            <WifiOff className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-amber-800 dark:text-amber-200">Offline</span>
          </div>
        )}

        {/* Update available */}
        {updateAvailable && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-800 dark:text-blue-200">Update available</span>
            <button
              onClick={handleUpdate}
              className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium transition"
            >
              Update
            </button>
          </div>
        )}

        {/* Online indicator (only show when coming back online) */}
        {isOnline && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg px-3 py-2 flex items-center gap-2 text-sm animate-fade-in">
            <Wifi className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-green-800 dark:text-green-200">Back online</span>
          </div>
        )}
      </div>
    </div>
  );
}
