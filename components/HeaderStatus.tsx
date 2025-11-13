'use client';

import { useEffect, useState } from 'react';
import { Clock, Zap, Hourglass, Target } from 'lucide-react';
import type { EnergyLevel } from '@/lib/capacity';
import type { FlowGreetingResult } from '@/lib/getFlowGreeting';

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  sparky: 'Sparky',
  steady: 'Steady',
  flowing: 'Flowing',
  foggy: 'Foggy',
  resting: 'Resting',
};

const ENERGY_CARD_STYLES: Record<
  EnergyLevel,
  { bg: string; text: string; ring: string; iconColor: string }
> = {
  sparky: {
    bg: 'from-amber-50/90 to-yellow-100/90 dark:from-amber-900/30 dark:to-yellow-900/20',
    text: 'text-amber-900 dark:text-amber-100',
    ring: 'ring-amber-100 dark:ring-amber-800/60',
    iconColor: 'text-amber-600 dark:text-amber-300',
  },
  steady: {
    bg: 'from-orange-50/90 to-orange-100/90 dark:from-orange-900/30 dark:to-orange-900/20',
    text: 'text-orange-900 dark:text-orange-100',
    ring: 'ring-orange-100 dark:ring-orange-800/60',
    iconColor: 'text-orange-500 dark:text-orange-300',
  },
  flowing: {
    bg: 'from-sky-50/90 to-cyan-100/90 dark:from-sky-900/30 dark:to-cyan-900/20',
    text: 'text-sky-900 dark:text-cyan-100',
    ring: 'ring-sky-100 dark:ring-cyan-900/50',
    iconColor: 'text-sky-500 dark:text-cyan-300',
  },
  foggy: {
    bg: 'from-slate-50/95 to-slate-200/90 dark:from-slate-900/40 dark:to-slate-800/30',
    text: 'text-slate-900 dark:text-slate-100',
    ring: 'ring-slate-200 dark:ring-slate-700',
    iconColor: 'text-slate-600 dark:text-slate-200',
  },
  resting: {
    bg: 'from-indigo-50/90 to-violet-100/90 dark:from-indigo-900/30 dark:to-violet-900/20',
    text: 'text-indigo-900 dark:text-indigo-100',
    ring: 'ring-indigo-100 dark:ring-indigo-800/60',
    iconColor: 'text-indigo-600 dark:text-indigo-300',
  },
};

const DEFAULT_CARD_STYLE = {
  bg: 'from-slate-50/90 to-white/90 dark:from-slate-900/40 dark:to-slate-900/20',
  text: 'text-slate-700 dark:text-slate-200',
  ring: 'ring-slate-100 dark:ring-slate-800',
  iconColor: 'text-slate-500 dark:text-slate-300',
};

const STATIC_CARD_STYLES = {
  time: {
    bg: 'from-[#f4f4ff] via-[#ecf2ff] to-[#e3f0ff] dark:from-slate-900/70 dark:via-slate-800/60 dark:to-slate-700/50',
    text: 'text-indigo-900 dark:text-white',
    ring: 'ring-[#d9e3ff] dark:ring-slate-900/40',
    iconColor: 'text-[#7a88ff] dark:text-slate-200',
  },
  remaining: {
    bg: 'from-[#fdefff] via-[#f7e7ff] to-[#f2e5ff] dark:from-violet-900/50 dark:via-purple-900/40 dark:to-fuchsia-900/40',
    text: 'text-purple-900 dark:text-violet-100',
    ring: 'ring-[#f3d8ff] dark:ring-violet-800/60',
    iconColor: 'text-[#b05cd6] dark:text-violet-300',
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

function formatTimeLeft(timeInfo?: HeaderStatusProps['timeInfo']) {
  if (!timeInfo) {
    return 'Set hard stop';
  }
  if (timeInfo.isPastStop) {
    return 'Past stop';
  }
  if (timeInfo.totalMinutes >= 60) {
    const hours = Math.floor(timeInfo.totalMinutes / 60);
    const minutes = timeInfo.totalMinutes % 60;
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} left`;
    }
    return `${hours}h ${minutes}m left`;
  }
  const minutes = Math.max(timeInfo.totalMinutes, 1);
  return `${minutes} min left`;
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
  });

  const dateLabel = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const energyLabel = energyLevel ? ENERGY_LABELS[energyLevel] : 'Set energy';
  const timeRemaining = formatTimeLeft(timeInfo);
  const capacityLabel = `Capacity ${focusCount}/${Math.max(capacityTarget, 1)}`;

  const energyCard = energyLevel ? ENERGY_CARD_STYLES[energyLevel] : DEFAULT_CARD_STYLE;

  const staticCards = [
    {
      key: 'time',
      label: timeLabel,
      Icon: Clock,
      style: STATIC_CARD_STYLES.time,
      minWidth: 'min-w-[120px]',
    },
    {
      key: 'remaining',
      label: timeRemaining,
      Icon: Hourglass,
      style: STATIC_CARD_STYLES.remaining,
      minWidth: 'min-w-[150px]',
    },
    {
      key: 'capacity',
      label: capacityLabel,
      Icon: Target,
      style: STATIC_CARD_STYLES.capacity,
      minWidth: 'min-w-[140px]',
    },
  ];

  const [timeCard, ...otherCards] = staticCards;

  const renderCard = ({ key, label, Icon, style, minWidth }: typeof staticCards[number]) => (
    <div
      key={key}
      className={`${minWidth} flex flex-shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-br px-3 py-2 text-sm font-semibold shadow-sm ring-1 backdrop-blur ${style.bg} ${style.text} ${style.ring}`}
    >
      <Icon className={`h-4 w-4 ${style.iconColor}`} />
      {label}
    </div>
  );

  return (
    <section className="rounded-3xl bg-transparent">
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
        {renderCard(timeCard)}
        <button
          type="button"
          onClick={onEnergyClick}
          className={`min-w-[130px] flex flex-shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-br px-3 py-2 text-sm font-semibold shadow-sm ring-1 transition hover:opacity-90 ${energyCard.bg} ${energyCard.text} ${energyCard.ring}`}
        >
          <Zap className={`h-4 w-4 ${energyCard.iconColor}`} />
          {energyLabel}
        </button>
        {otherCards.map(renderCard)}
      </div>
      <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
        {dateLabel}
      </p>
      <p className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100">
        Welcome to your {flowGreeting.emoji} {flowGreeting.flow}.
      </p>
    </section>
  );
}
