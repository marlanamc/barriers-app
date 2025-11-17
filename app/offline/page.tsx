'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    // If they come back online, redirect to home
    useEffect(() => {
      window.location.href = '/';
    }, []);
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
            <WifiOff className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            You're Offline
          </h1>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            It looks like you've lost your internet connection. Some features may not be available right now.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-2xl font-medium transition"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>

            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-2xl font-medium transition"
            >
              <Home className="h-5 w-5" />
              Go Home
            </Link>
          </div>

          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Offline Features Available:</strong>
            </p>
            <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <li>• View previously loaded pages</li>
              <li>• Access cached data</li>
              <li>• Use installed app features</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
