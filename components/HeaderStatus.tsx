'use client';

import { Zap } from 'lucide-react';
import type { EnergyLevel } from '@/lib/capacity';
import type { FlowGreetingResult } from '@/lib/getFlowGreeting';

const ENERGY_CHIP: Record<
  EnergyLevel,
  { emoji: string; label: string; bg: string; text: string; ring: string; iconColor: string }
> = {
  sparky: {
    emoji: '⚡',
    label: 'Sparky',
    bg: 'from-pink-200 via-rose-200 to-pink-300 dark:from-pink-800/40 dark:via-rose-800/40 dark:to-pink-800/40',
    text: 'text-pink-900 dark:text-pink-100',
    ring: 'ring-pink-200/70 dark:ring-pink-800/50',
    iconColor: 'text-pink-700 dark:text-pink-300',
  },
  steady: {
    emoji: '☀️',
    label: 'Steady',
    bg: 'from-emerald-200 via-teal-200 to-emerald-300 dark:from-emerald-800/40 dark:via-teal-800/40 dark:to-emerald-800/40',
    text: 'text-emerald-900 dark:text-emerald-100',
    ring: 'ring-emerald-200/70 dark:ring-emerald-800/50',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
  },
  flowing: {
    emoji: '🌊',
    label: 'Flowing',
    bg: 'from-sky-200 via-blue-200 to-sky-300 dark:from-sky-800/40 dark:via-blue-800/40 dark:to-sky-800/40',
    text: 'text-sky-900 dark:text-sky-100',
    ring: 'ring-sky-200/70 dark:ring-sky-800/50',
    iconColor: 'text-sky-700 dark:text-sky-300',
  },
  foggy: {
    emoji: '🌫️',
    label: 'Foggy',
    bg: 'from-purple-200 via-violet-200 to-purple-300 dark:from-purple-800/40 dark:via-violet-800/40 dark:to-purple-800/40',
    text: 'text-purple-900 dark:text-purple-100',
    ring: 'ring-purple-200/70 dark:ring-purple-800/50',
    iconColor: 'text-purple-700 dark:text-purple-300',
  },
  resting: {
    emoji: '🌙',
    label: 'Resting',
    bg: 'from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700/40 dark:via-slate-600/40 dark:to-slate-700/40',
    text: 'text-slate-900 dark:text-slate-100',
    ring: 'ring-slate-200/80 dark:ring-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
};

interface HeaderStatusProps {
  energyLevel: EnergyLevel | null;
  flowGreeting: FlowGreetingResult;
  timeInfo?: {
    totalMinutes: number;
    isPastStop: boolean;
  } | null;
  onEnergyClick?: () => void;
}

export function HeaderStatus({
  energyLevel,
  flowGreeting,
  timeInfo,
  onEnergyClick,
}: HeaderStatusProps) {
  const energyChip = energyLevel ? ENERGY_CHIP[energyLevel] : null;
  const energyLabel = energyChip ? `${energyChip.emoji} ${energyChip.label}` : 'Set energy';

  const renderEnergyCard = () => {
    if (!energyChip) {
      return (
        <button
          type="button"
          onClick={onEnergyClick}
          className="min-w-[140px] flex flex-shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-100/80 to-slate-50 px-3 py-2 text-sm font-semibold shadow-sm ring-1 ring-slate-200/80 backdrop-blur text-slate-600 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-slate-900/60 dark:ring-slate-700 dark:text-slate-400 transition hover:opacity-90"
        >
          <Zap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          {energyLabel}
        </button>
      );
    }

    const CardComponent = onEnergyClick ? 'button' : 'div';
    const cardProps = onEnergyClick
      ? {
          type: 'button' as const,
          onClick: onEnergyClick,
          className: 'transition hover:opacity-90',
        }
      : {};

    return (
      <CardComponent
        {...cardProps}
        className={`min-w-[140px] flex flex-shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-br px-3 py-2 text-sm font-semibold shadow-sm ring-1 backdrop-blur ${energyChip.bg} ${energyChip.text} ${energyChip.ring} ${cardProps.className || ''}`}
      >
        <span className="text-base leading-none">{energyChip.emoji}</span>
        <span>{energyChip.label}</span>
      </CardComponent>
    );
  };

  return (
    <section className="rounded-3xl bg-transparent">
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
        {renderEnergyCard()}
      </div>
    </section>
  );
}
