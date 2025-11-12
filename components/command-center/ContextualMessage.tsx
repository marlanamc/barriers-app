'use client';

import { Sunrise, Sun, Moon, Target } from 'lucide-react';

interface ContextualMessageProps {
  type: 'morning' | 'midday' | 'evening' | 'empty';
  message: string;
  action?: string;
  onAction?: () => void;
}

const MESSAGE_ICONS = {
  morning: Sunrise,
  midday: Sun,
  evening: Moon,
  empty: Target,
};

const MESSAGE_COLORS = {
  morning: {
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
    text: 'text-amber-900 dark:text-amber-100',
    icon: 'text-amber-600 dark:text-amber-400',
  },
  midday: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    text: 'text-blue-900 dark:text-blue-100',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  evening: {
    bg: 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
    text: 'text-indigo-900 dark:text-indigo-100',
    icon: 'text-indigo-600 dark:text-indigo-400',
  },
  empty: {
    bg: 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20',
    text: 'text-slate-900 dark:text-slate-100',
    icon: 'text-slate-600 dark:text-slate-400',
  },
};

export function ContextualMessage({ type, message, action, onAction }: ContextualMessageProps) {
  const Icon = MESSAGE_ICONS[type];
  const colors = MESSAGE_COLORS[type];

  return (
    <div className={`rounded-2xl p-6 ${colors.bg}`}>
      <div className="flex items-start gap-4">
        <Icon className={`h-8 w-8 flex-shrink-0 ${colors.icon}`} />
        <div className="flex-1">
          <p className={`text-lg font-semibold ${colors.text}`}>{message}</p>
          {action && onAction && (
            <button
              onClick={onAction}
              className="mt-3 rounded-lg bg-white/80 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-white hover:shadow dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              {action}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
