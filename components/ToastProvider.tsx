'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant, durationMs?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = 'info', durationMs = 3200) => {
      if (!message) return;
      const id = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
      const toast: Toast = { id, message, variant, duration: durationMs };

      setToasts((prev) => [...prev, toast]);

      window.setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 left-1/2 z-[1200] w-full max-w-md -translate-x-1/2 space-y-2 px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg ring-1 transition ${
              toast.variant === 'success'
                ? 'border-emerald-200 bg-emerald-50 ring-emerald-200 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/40 dark:text-emerald-100'
                : toast.variant === 'error'
                  ? 'border-rose-200 bg-rose-50 ring-rose-200 text-rose-800 dark:border-rose-900/40 dark:bg-rose-900/40 dark:text-rose-100'
                  : 'border-slate-200 bg-white ring-slate-200 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="flex-1 text-sm leading-5">{toast.message}</div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="rounded-full p-1 text-xs text-slate-400 transition hover:bg-black/5 hover:text-slate-600 dark:hover:bg-white/10"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
