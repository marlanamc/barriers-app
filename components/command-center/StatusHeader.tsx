'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  Zap,
  Target,
  Sparkles,
  Settings,
  Bell,
  BellRing,
  Moon,
  type LucideIcon,
} from 'lucide-react';
import { EnergyLevel, TaskComplexity, getTimeUntilStop } from '@/lib/capacity';
import { TimelineBar } from './TimelineBar';

const ENERGY_CHIP: Record<
  EnergyLevel,
  { emoji: string; label: string; text: string; bg: string; border: string }
> = {
  sparky: {
    emoji: '⚡',
    label: 'Sparky',
    text: 'text-yellow-800 dark:text-yellow-200',
    bg: 'bg-yellow-100/70 dark:bg-yellow-900/30',
    border: 'border-yellow-200/70 dark:border-yellow-800/50',
  },
  steady: {
    emoji: '☀️',
    label: 'Steady',
    text: 'text-orange-800 dark:text-orange-200',
    bg: 'bg-orange-100/70 dark:bg-orange-900/30',
    border: 'border-orange-200/70 dark:border-orange-800/50',
  },
  flowing: {
    emoji: '🌊',
    label: 'Flowing',
    text: 'text-blue-800 dark:text-blue-200',
    bg: 'bg-blue-100/70 dark:bg-blue-900/30',
    border: 'border-blue-200/70 dark:border-blue-800/50',
  },
  foggy: {
    emoji: '🌫️',
    label: 'Foggy',
    text: 'text-slate-700 dark:text-slate-200',
    bg: 'bg-slate-100/80 dark:bg-slate-900/40',
    border: 'border-slate-200/80 dark:border-slate-700',
  },
  resting: {
    emoji: '🌙',
    label: 'Resting',
    text: 'text-indigo-800 dark:text-indigo-200',
    bg: 'bg-indigo-100/70 dark:bg-indigo-900/30',
    border: 'border-indigo-200/70 dark:border-indigo-800/50',
  },
};

const WARNING_STYLES = {
  ok: {
    wrapper: 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    icon: 'text-slate-500 dark:text-slate-400',
    sub: 'text-slate-500 dark:text-slate-400',
  },
  warning: {
    wrapper: 'border-amber-100 bg-amber-50 dark:border-amber-800/40 dark:bg-amber-900/20',
    text: 'text-amber-900 dark:text-amber-100',
    icon: 'text-amber-500 dark:text-amber-300',
    sub: 'text-amber-700 dark:text-amber-200',
  },
  critical: {
    wrapper: 'border-rose-100 bg-rose-50 dark:border-rose-800/60 dark:bg-rose-900/30',
    text: 'text-rose-900 dark:text-rose-100',
    icon: 'text-rose-500 dark:text-rose-300',
    sub: 'text-rose-700 dark:text-rose-200',
  },
  past: {
    wrapper: 'border-indigo-200 bg-indigo-50 dark:border-indigo-800/60 dark:bg-indigo-900/20',
    text: 'text-indigo-900 dark:text-indigo-100',
    icon: 'text-indigo-500 dark:text-indigo-300',
    sub: 'text-indigo-700 dark:text-indigo-200',
  },
};

type CountdownVariant = keyof typeof WARNING_STYLES;

interface StatusHeaderProps {
  energyLevel: EnergyLevel | null;
  hardStopTime?: string;
  focusCount: number;
  focusCompleted: number;
  lifeCount: number;
  recommendedComplexity?: TaskComplexity | null;
  onEnergyChange?: () => void;
  onTimeSettings?: () => void;
}

export function StatusHeader({
  energyLevel,
  hardStopTime,
  focusCount,
  focusCompleted,
  lifeCount,
  recommendedComplexity,
  onEnergyChange,
  onTimeSettings,
}: StatusHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeInfo = hardStopTime ? getTimeUntilStop(hardStopTime) : null;
  const energyChip = energyLevel ? ENERGY_CHIP[energyLevel] : null;

  // Determine warning level based on time remaining
  const getWarningLevel = () => {
    if (!timeInfo) return null;
    if (timeInfo.totalMinutes < 60) return 'critical';
    if (timeInfo.totalMinutes < 120) return 'warning';
    return null;
  };

  const countdownVariant: CountdownVariant | null = timeInfo
    ? timeInfo.isPastStop
      ? 'past'
      : getWarningLevel() ?? 'ok'
    : null;

  const countdownSubtext =
    countdownVariant === 'critical'
      ? "Wrap up what you're working on"
      : countdownVariant === 'warning'
      ? 'Last focus window'
      : countdownVariant === 'past'
      ? 'Light tasks only'
      : null;

  const VARIANT_ICONS: Record<CountdownVariant, LucideIcon> = {
    ok: Clock,
    warning: Bell,
    critical: BellRing,
    past: Moon,
  };
  const IndicatorIcon = countdownVariant ? VARIANT_ICONS[countdownVariant] : Clock;

  const COMPLEXITY_SUMMARY: Record<
    TaskComplexity,
    { title: string; detail: string }
  > = {
    quick: {
      title: 'Quick win',
      detail: '2-15 min, keep it light.',
    },
    medium: {
      title: 'Meaningful task',
      detail: '30-60 min, single-focus block.',
    },
    deep: {
      title: 'Deep work',
      detail: '60-90 min, protect focus.',
    },
  };

  const capacitySummary = (() => {
    if (!energyLevel) {
      return {
        title: 'Capacity',
        detail: 'Set today’s energy to get guidance.',
      };
    }
    if (!recommendedComplexity) {
      return {
        title: 'At capacity',
        detail: 'Close open loops and wind down.',
      };
    }
    return COMPLEXITY_SUMMARY[recommendedComplexity];
  })();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-600 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {timeString}
          </span>
          <span className="text-slate-400 dark:text-slate-500">{dateString}</span>
          {hardStopTime && !timeInfo?.isPastStop && (
            <span className="text-slate-500 dark:text-slate-400">Hard stop {hardStopTime}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {energyChip && (
            <button
              onClick={onEnergyChange}
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-90 ${energyChip.bg} ${energyChip.text} ${energyChip.border}`}
            >
              <span>{energyChip.emoji}</span>
              <span>{energyChip.label}</span>
            </button>
          )}
          {onTimeSettings && (
            <button
              onClick={onTimeSettings}
              className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-500 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500"
            >
              Adjust
            </button>
          )}
        </div>
      </div>

      {timeInfo && countdownVariant && (
        <div
          className={`mt-3 rounded-2xl border px-4 py-3 ${WARNING_STYLES[countdownVariant].wrapper}`}
        >
          {countdownVariant === 'past' ? (
            <TimelineBar
              workStart={hardStopTime ? '08:00' : undefined}
              hardStop={hardStopTime}
              currentTime={currentTime}
              energyLevel={energyLevel}
              timeInfo={timeInfo}
            />
          ) : (
            <div className="flex items-start gap-3">
              <IndicatorIcon className={`mt-0.5 h-4 w-4 ${WARNING_STYLES[countdownVariant].icon}`} />
              <div className="flex-1">
                <p className={`font-semibold ${WARNING_STYLES[countdownVariant].text}`}>
                  {timeInfo.message}
                </p>
                {countdownSubtext && (
                  <p className={`text-xs ${WARNING_STYLES[countdownVariant].sub}`}>{countdownSubtext}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-3 grid gap-3 text-slate-600 dark:text-slate-400 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/30">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            Focus
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {focusCompleted}/{focusCount || 0}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">done today</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/30">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Life
          </div>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{lifeCount}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">essentials tracked</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/60 p-3 dark:border-slate-700 dark:bg-slate-900/30">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            Energy Plan
          </div>
          <p className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {capacitySummary.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{capacitySummary.detail}</p>
        </div>
      </div>
    </section>
  );
}
