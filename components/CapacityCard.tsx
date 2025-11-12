'use client';

import { useState } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { getCapacityMessage, getCapacityRangeText } from '@/lib/capacity';
import type { EnergyLevel, TaskComplexity } from '@/lib/capacity';

interface CapacityStats {
  totalCapacity: number;
  usedCapacity: number;
  remainingCapacity: number;
  percentUsed: number;
  canAddTask: boolean;
  recommendedComplexity: TaskComplexity | null;
}

interface CapacityCardProps {
  energyLevel: EnergyLevel | null;
  hardStopTime?: string;
  focusCount: number;
  capacityInfo: CapacityStats | null;
  planHint?: string | null;
}

const ENERGY_COPY: Record<EnergyLevel, string> = {
  sparky: 'Today you can handle up to 4 meaningful tasks.',
  steady: 'Today you can handle up to 3 meaningful tasks.',
  flowing: 'Today you can handle up to 2 lighter tasks.',
  foggy: 'Today you can handle up to 1 meaningful task.',
  resting: 'Rest mode—no meaningful tasks required.',
};

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  sparky: 'Sparky',
  steady: 'Steady',
  flowing: 'Flowing',
  foggy: 'Foggy',
  resting: 'Resting',
};

function formatHardStop(time?: string) {
  if (!time) return null;
  const [hours, minutes] = time.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time;
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getSummaryCopy(energyLevel: EnergyLevel | null) {
  if (!energyLevel) {
    return 'Check your energy to set capacity.';
  }
  return ENERGY_COPY[energyLevel];
}

function getWarning(capacityInfo: CapacityStats | null) {
  if (!capacityInfo) return null;
  if (capacityInfo.remainingCapacity <= 0) {
    return 'You are past your plan. Close open loops and wind down.';
  }
  if (capacityInfo.remainingCapacity <= 0.5) {
    return 'You are near your limit.';
  }
  return null;
}

function getHint({
  planHint,
  energyLevel,
  capacityInfo,
}: {
  planHint?: string | null;
  energyLevel: EnergyLevel | null;
  capacityInfo: CapacityStats | null;
}) {
  if (planHint) return planHint;
  if (!energyLevel) return 'Set your energy to get a plan.';
  if (!capacityInfo?.recommendedComplexity) {
    return getCapacityMessage(energyLevel);
  }
  const complexity = capacityInfo.recommendedComplexity;
  const label =
    complexity === 'deep'
      ? 'Protect one deep work block.'
      : complexity === 'medium'
      ? 'Choose one meaningful task.'
      : 'Aim for a quick win.';
  return label;
}

export function CapacityCard({
  energyLevel,
  hardStopTime,
  focusCount,
  capacityInfo,
  planHint,
}: CapacityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const warningText = getWarning(capacityInfo);
  const hardStopLabel = formatHardStop(hardStopTime);
  const summary = getSummaryCopy(energyLevel);
  const hint = getHint({ planHint, energyLevel, capacityInfo });
  const capacityRange = energyLevel ? getCapacityRangeText(energyLevel) : null;
  const energyLabel = energyLevel ? ENERGY_LABELS[energyLevel] : 'Not set';

  return (
    <section className="rounded-3xl bg-gradient-to-r from-[#fff8fb]/95 via-[#f4fbff]/95 to-[#f6fff8]/95 px-4 py-3 shadow-[0_25px_50px_rgba(163,181,255,0.3)] ring-1 ring-[#e7e2ff] backdrop-blur-sm dark:bg-slate-900/50 dark:ring-slate-800">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[#9aa5ff] dark:text-slate-500">
            Capacity
          </p>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {summary}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {capacityRange && (
            <p className="text-xs uppercase tracking-wide text-[#9aa5ff] dark:text-slate-500">
              Guide: {capacityRange}
            </p>
          )}
          <p>
            Focus load: <span className="font-medium">{focusCount}</span>{' '}
            planned today.
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            Energy:{' '}
            <span className="font-medium text-slate-700 dark:text-slate-100">
              {energyLabel}
            </span>
            {hardStopLabel && (
              <>
                {' '}
                • Hard stop: {hardStopLabel}
              </>
            )}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {hint}
          </p>
          {warningText && (
            <p className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#fff4da] to-[#ffe8e8] px-3 py-2 text-sm text-amber-900 shadow-[0_10px_25px_rgba(255,188,122,0.35)] dark:bg-amber-900/20 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              {warningText}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
