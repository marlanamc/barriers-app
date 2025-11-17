'use client';

import { useEffect, useState } from 'react';
import { Clock, Target, Zap } from 'lucide-react';
import type { EnergyLevel } from '@/lib/capacity';
import type { FlowGreetingResult } from '@/lib/getFlowGreeting';

const ENERGY_CHIP: Record<
  EnergyLevel,
  { emoji: string; label: string; bg: string; text: string; ring: string; iconColor: string }
> = {
  sparky: {
    emoji: '⚡',
    label: 'Sparky',
    bg: 'from-yellow-50 via-yellow-100/80 to-amber-50 dark:from-yellow-900/40 dark:via-yellow-900/30 dark:to-amber-900/40',
    text: 'text-yellow-900 dark:text-yellow-100',
    ring: 'ring-yellow-200/70 dark:ring-yellow-800/50',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  steady: {
    emoji: '☀️',
    label: 'Steady',
    bg: 'from-orange-50 via-orange-100/80 to-amber-50 dark:from-orange-900/40 dark:via-orange-900/30 dark:to-amber-900/40',
    text: 'text-orange-900 dark:text-orange-100',
    ring: 'ring-orange-200/70 dark:ring-orange-800/50',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  flowing: {
    emoji: '🌊',
    label: 'Flowing',
    bg: 'from-blue-50 via-blue-100/80 to-cyan-50 dark:from-blue-900/40 dark:via-blue-900/30 dark:to-cyan-900/40',
    text: 'text-blue-900 dark:text-blue-100',
    ring: 'ring-blue-200/70 dark:ring-blue-800/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  foggy: {
    emoji: '🌫️',
    label: 'Foggy',
    bg: 'from-slate-50 via-slate-100/80 to-slate-50 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-slate-900/60',
    text: 'text-slate-900 dark:text-slate-100',
    ring: 'ring-slate-200/80 dark:ring-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
  resting: {
    emoji: '🌙',
    label: 'Resting',
    bg: 'from-indigo-50 via-indigo-100/80 to-purple-50 dark:from-indigo-900/40 dark:via-indigo-900/30 dark:to-purple-900/40',
    text: 'text-indigo-900 dark:text-indigo-100',
    ring: 'ring-indigo-200/70 dark:ring-indigo-800/50',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
};

const STATIC_CARD_STYLES = {
  time: {
    bg: 'from-[#f4f4ff] via-[#ecf2ff] to-[#e3f0ff] dark:from-slate-900/70 dark:via-slate-800/60 dark:to-slate-700/50',
    text: 'text-indigo-900 dark:text-white',
    ring: 'ring-[#d9e3ff] dark:ring-slate-900/40',
    iconColor: 'text-[#7a88ff] dark:text-slate-200',
  },
  capacity: {
    bg: 'from-[#e7fff4] via-[#edfff8] to-[#f2fff3] dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-cyan-900/40',
    text: 'text-emerald-900 dark:text-emerald-100',
    ring: 'ring-[#c8f5e5] dark:ring-emerald-800/60',
    iconColor: 'text-emerald-500 dark:text-emerald-300',
  },
};

interface HeaderStatusProps {
  energyLevel: EnergyLevel | null;
  focusCount: number;
  capacityTarget: number;
  flowGreeting: FlowGreetingResult;
  timeInfo?: {
    totalMinutes: number;
    isPastStop: boolean;
  } | null;
  onEnergyClick?: () => void;
}

export function HeaderStatus({
  energyLevel,
  focusCount,
  capacityTarget,
  flowGreeting,
  timeInfo,
  onEnergyClick,
}: HeaderStatusProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const timeLabel = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const dateLabel = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const capacityLabel = `Capacity ${focusCount}/${Math.max(capacityTarget, 1)}`;

  const energyChip = energyLevel ? ENERGY_CHIP[energyLevel] : null;
  const energyLabel = energyChip ? `${energyChip.emoji} ${energyChip.label}` : 'Set energy';

  const timeCard = {
    key: 'time',
    label: timeLabel,
    Icon: Clock,
    style: STATIC_CARD_STYLES.time,
    minWidth: 'min-w-[120px]',
  };

  const capacityCard = {
    key: 'capacity',
    label: capacityLabel,
    Icon: Target,
    style: STATIC_CARD_STYLES.capacity,
    minWidth: 'min-w-[140px]',
  };

  const renderCard = ({ key, label, Icon, style, minWidth }: typeof timeCard) => (
    <div
      key={key}
      className={`${minWidth} flex flex-shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-br px-3 py-2 text-sm font-semibold shadow-sm ring-1 backdrop-blur ${style.bg} ${style.text} ${style.ring}`}
    >
      <Icon className={`h-4 w-4 ${style.iconColor}`} />
      {label}
    </div>
  );

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

  // Hide capacity card during evening/wind-down flow
  const isEveningFlow = flowGreeting.flow.toLowerCase().includes('evening') || 
                        flowGreeting.flow.toLowerCase().includes('wind');

  return (
    <section className="rounded-3xl bg-transparent">
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
        {renderCard(timeCard)}
        {renderEnergyCard()}
        {!isEveningFlow && renderCard(capacityCard)}
      </div>
    </section>
  );
}
