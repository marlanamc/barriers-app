'use client';

import { useMemo } from 'react';
import type { EnergyLevel } from '@/lib/capacity';
import { timeToMinutes } from './TimeUtils';

type EnergyBlock = { start: string; end: string; level: EnergyLevel };

const ENERGY_COLORS: Record<EnergyLevel, string> = {
  sparky: 'bg-[#F9C74F]',
  steady: 'bg-[#43AA8B]',
  flowing: 'bg-[#577590]',
  foggy: 'bg-[#9B8AFB]',
  resting: 'bg-[#3D405B]',
};

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  sparky: 'Sparky',
  steady: 'Steady',
  flowing: 'Flowing',
  foggy: 'Foggy',
  resting: 'Resting',
};

function toPercent(part: number, total: number) {
  return total === 0 ? 0 : Math.max(0, Math.min(100, (part / total) * 100));
}

export interface DayTimelineProps {
  currentTime: Date;
  wakeTime: string;
  hardStopTime: string;
  energySchedule: EnergyBlock[];
  currentEnergyLevel: EnergyLevel;
  timeRemaining: string;
}

export function DayTimeline({
  currentTime,
  wakeTime,
  hardStopTime,
  energySchedule,
  currentEnergyLevel,
  timeRemaining,
}: DayTimelineProps) {
  const wake = timeToMinutes(wakeTime);
  const stop = timeToMinutes(hardStopTime);
  const total = stop >= wake ? stop - wake : stop + 24 * 60 - wake;
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowRel = stop >= wake
    ? Math.min(Math.max(now - wake, 0), total)
    : ((now - wake + 24 * 60) % (24 * 60));

  const blocks = useMemo(() => {
    if (!energySchedule?.length) {
      return [
        { start: 0, end: total, level: currentEnergyLevel } as const,
      ];
    }
    return energySchedule.map((b) => {
      const s = timeToMinutes(b.start);
      const e = timeToMinutes(b.end);
      const relStart = stop >= wake ? s - wake : (s - wake + 24 * 60) % (24 * 60);
      const relEnd = stop >= wake ? e - wake : (e - wake + 24 * 60) % (24 * 60);
      const endVal = relEnd <= relStart ? relStart + 15 : relEnd; // ensure forward progression
      return {
        start: Math.max(0, relStart),
        end: Math.min(total, endVal),
        level: b.level,
      };
    });
  }, [energySchedule, wake, stop, total, currentEnergyLevel]);

  return (
    <div className="space-y-1">
      <div className="px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <span className="text-base">🌞</span>
          <span>Daytime flow</span>
        </div>
        <div className="mt-1 flex items-center justify-end gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {ENERGY_LABELS[currentEnergyLevel]}
          </span>
          <span className="text-xs opacity-70 dark:text-slate-200">{timeRemaining}</span>
        </div>
      </div>

      <div className="relative h-12 rounded-full bg-slate-50 ring-1 ring-white/60 shadow-inner dark:bg-slate-800/80 dark:ring-slate-700/80">
        <div className="absolute inset-x-3 top-1/2 flex h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200/60 dark:bg-slate-700/70">
          {blocks.map((block, idx) => {
            const widthPercent = toPercent(block.end - block.start, total);
            if (widthPercent <= 0) return null;
            const rounded =
              idx === 0
                ? 'rounded-l-full'
                : idx === blocks.length - 1
                ? 'rounded-r-full'
                : '';
            const isCurrent = nowRel >= block.start && nowRel < block.end;
            return (
              <div
                key={`${block.start}-${block.end}-${block.level}`}
                className={`h-full ${ENERGY_COLORS[block.level]} ${rounded} ${isCurrent ? 'opacity-100 shadow-[0_0_10px_rgba(0,0,0,0.25)]' : 'opacity-80'}`}
                style={{ width: `${widthPercent}%` }}
              />
            );
          })}
        </div>

        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-lg dark:border-slate-200 dark:bg-white"
          style={{ left: `${toPercent(nowRel, total)}%` }}
        />
      </div>
    </div>
  );
}
