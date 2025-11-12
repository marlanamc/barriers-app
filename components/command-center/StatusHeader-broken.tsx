'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, Target, Sparkles } from 'lucide-react';
import { getTimeUntilStop } from '@/lib/capacity';

interface StatusHeaderProps {
  hardStopTime?: string;
  focusCount: number;
  focusCompleted: number;
  totalCapacity: number;
  usedCapacity: number;
  lifeCount: number;
}

export function StatusHeader({
  hardStopTime,
  focusCount,
  focusCompleted,
  totalCapacity,
  usedCapacity,
  lifeCount,
}: StatusHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const timeInfo = hardStopTime ? getTimeUntilStop(hardStopTime) : null;

  // Determine warning level
  const getWarningLevel = () => {
    if (!timeInfo) return null;
    if (timeInfo.isPastStop) return 'critical';
    if (timeInfo.totalMinutes < 60) return 'critical';
    if (timeInfo.totalMinutes < 120) return 'warning';
    return null;
  };

  const warningLevel = getWarningLevel();

  return (
    <div className="space-y-3 bg-white/80 px-4 py-3 backdrop-blur dark:bg-slate-800/80">
      {/* Current Time */}
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        <span className="text-lg font-medium text-slate-800 dark:text-slate-200">
          {timeString}
        </span>
      </div>

      {/* Time Warning */}
      {timeInfo && !timeInfo.isPastStop && warningLevel && (
        <div
          className={`rounded-xl p-3 ${
            warningLevel === 'critical'
              ? 'bg-red-50 dark:bg-red-900/20'
              : 'bg-amber-50 dark:bg-amber-900/20'
          }`}
        >
          <div className="flex items-start gap-2">
            <AlertTriangle
              className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                warningLevel === 'critical'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-semibold ${
                  warningLevel === 'critical'
                    ? 'text-red-900 dark:text-red-100'
                    : 'text-amber-900 dark:text-amber-100'
                }`}
              >
                {timeInfo.message}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  warningLevel === 'critical'
                    ? 'text-red-700 dark:text-red-200'
                    : 'text-amber-700 dark:text-amber-200'
                }`}
              >
                {warningLevel === 'critical'
                  ? 'Time to wrap up and finish what you're working on'
                  : 'This is your last focus window - choose wisely'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Past Stop Warning */}
      {timeInfo?.isPastStop && (
        <div className="rounded-xl bg-indigo-50 p-3 dark:bg-indigo-900/20">
          <div className="flex items-start gap-2">
            <span className="text-lg">🌙</span>
            <div>
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                Past your hard stop
              </p>
              <p className="mt-0.5 text-xs text-indigo-700 dark:text-indigo-200">
                Your brain is done with deep work - time to rest
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/30">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Focus
            </span>
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {focusCompleted}/{focusCount}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            {usedCapacity.toFixed(1)}/{totalCapacity} capacity
          </p>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Life
            </span>
          </div>
          <div className="mt-1">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {lifeCount}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            tasks tracked
          </p>
        </div>
      </div>
    </div>
  );
}
