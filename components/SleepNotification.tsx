'use client';

import { useState } from 'react';
import { Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { getSleepNotification, type SleepNotification } from '@/lib/sleep-notifications';

interface SleepNotificationProps {
  wakeTime: string;
  compact?: boolean;
}

// Softer, less anxiety-inducing styles - all use calming colors
const URGENCY_STYLES = {
  relaxed: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    icon: Moon,
    iconColor: 'text-slate-500 dark:text-slate-400',
    titleColor: 'text-slate-700 dark:text-slate-200'
  },
  getting_late: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    icon: Moon,
    iconColor: 'text-slate-500 dark:text-slate-400',
    titleColor: 'text-slate-700 dark:text-slate-200'
  },
  urgent: {
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-200 dark:border-slate-700',
    icon: Moon,
    iconColor: 'text-slate-500 dark:text-slate-400',
    titleColor: 'text-slate-700 dark:text-slate-200'
  }
};

export function SleepNotification({ wakeTime, compact: initialCompact = false }: SleepNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const notification = getSleepNotification(wakeTime);

  if (!notification) return null;

  const styles = URGENCY_STYLES[notification.urgency];
  const Icon = styles.icon;

  // Compact View (Default)
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`w-full text-left ${styles.bg} border ${styles.border} rounded-xl p-3 flex items-center justify-between group transition-all hover:shadow-sm`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-white/50 dark:bg-slate-800/50 flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${styles.iconColor}`} />
          </div>
          <div>
            <span className={`text-sm font-semibold ${styles.titleColor} block`}>
              Bed by {notification.bedtime}
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-400">
              {notification.windDownHours}h wind-down recommended
            </span>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 ${styles.iconColor} opacity-50 group-hover:opacity-100 transition-opacity`} />
      </button>
    );
  }

  // Expanded View
  return (
    <div className={`${styles.bg} border ${styles.border} rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full bg-white/50 dark:bg-slate-800/50 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${styles.iconColor}`} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className={`font-semibold ${styles.titleColor}`}>
                Sleep Reminder
              </h4>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className={`p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors`}
            >
              <ChevronUp className={`w-4 h-4 ${styles.iconColor}`} />
            </button>
          </div>

          <div className="space-y-2 bg-white/40 dark:bg-black/10 rounded-xl p-3">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
              ADHD Wind-Down Tips
            </p>
            <ul className="space-y-2">
              {notification.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${styles.iconColor} mt-1.5 flex-shrink-0 opacity-60`} />
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {tip}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Moon className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-500">
              To wake up by {wakeTime}, aim for bed by {notification.bedtime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Multiple sleep scenarios component
 */
export function SleepScenarios({ wakeTime }: { wakeTime: string }) {
  return <SleepNotification wakeTime={wakeTime} />;
}
