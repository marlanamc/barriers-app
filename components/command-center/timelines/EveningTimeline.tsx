'use client';

import { timeToMinutes } from './TimeUtils';

export interface EveningTimelineProps {
  currentTime: Date;
  hardStopTime: string;
  bedTime: string;
  timeRemaining: string;
}

function toPercent(part: number, total: number) {
  return total === 0 ? 0 : Math.max(0, Math.min(100, (part / total) * 100));
}

export function EveningTimeline({ currentTime, hardStopTime, bedTime, timeRemaining }: EveningTimelineProps) {
  const stop = timeToMinutes(hardStopTime);
  const bed = timeToMinutes(bedTime);
  const total = bed >= stop ? bed - stop : bed + 24 * 60 - stop;
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowRel = bed >= stop ? Math.max(Math.min(now - stop, total), 0) : (now - stop + 24 * 60) % (24 * 60);

  return (
    <div className="space-y-1">
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <span className="text-base">🌙</span>
          <span>Evening flow</span>
        </div>
        <div className="mt-1 flex items-center justify-end gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            Low energy
          </span>
          <span className="text-xs opacity-70 dark:text-slate-200">{timeRemaining}</span>
        </div>
      </div>

      <div className="relative h-12 rounded-full bg-slate-50 ring-1 ring-white/60 shadow-inner dark:bg-slate-800/80 dark:ring-slate-700/70">
        <div className="absolute inset-x-3 top-1/2 flex h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-700/70">
          <div className="h-full w-full opacity-80" />
        </div>
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-lg dark:border-slate-200 dark:bg-white"
          style={{ left: `${toPercent(nowRel, total)}%` }}
        />
      </div>
    </div>
  );
}
