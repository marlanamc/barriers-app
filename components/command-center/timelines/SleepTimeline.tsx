'use client';

import { timeToMinutes } from './TimeUtils';

export interface SleepTimelineProps {
  currentTime: Date;
  bedTime: string;
  nextWakeTime: string;
  timeRemaining: string;
}

function toPercent(part: number, total: number) {
  return total === 0 ? 0 : Math.max(0, Math.min(100, (part / total) * 100));
}

export function SleepTimeline({ currentTime, bedTime, nextWakeTime, timeRemaining }: SleepTimelineProps) {
  const bed = timeToMinutes(bedTime);
  const wake = timeToMinutes(nextWakeTime);
  const total = wake >= bed ? wake - bed : wake + 24 * 60 - bed;
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowRel = wake >= bed ? Math.max(Math.min(now - bed, total), 0) : (now - bed + 24 * 60) % (24 * 60);

  return (
    <div className="space-y-1">
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <span className="text-base">😴</span>
          <span>Deep sleep flow</span>
        </div>
        <div className="mt-1 flex items-center justify-end gap-2">
          <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-100">
            Sleeping
          </span>
          <span className="text-xs opacity-70 text-slate-100">{timeRemaining}</span>
        </div>
      </div>

      <div className="relative h-12 rounded-full bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 ring-1 ring-slate-700/60 shadow-inner">
        <div className="absolute inset-x-3 top-1/2 flex h-3 -translate-y-1/2 overflow-hidden rounded-full bg-gradient-to-r from-indigo-800 via-purple-800 to-slate-900">
          <div className="h-full w-full opacity-75" />
        </div>
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-indigo-200 bg-white shadow-lg"
          style={{ left: `${toPercent(nowRel, total)}%` }}
        />
        <div className="mt-3 text-center text-xs font-semibold text-indigo-100">
          You’re in your sleep window. Try to rest if you can.
        </div>
      </div>
    </div>
  );
}
