'use client';

import { Zap } from 'lucide-react';
import type { FocusLevel } from '@/lib/user-context';
import type { FlowGreetingResult } from '@/lib/getFlowGreeting';

const FOCUS_CHIP: Record<
  FocusLevel,
  { emoji: string; label: string; bg: string; text: string; ring: string; iconColor: string }
> = {
  focused: {
    emoji: '⚓',
    label: 'Smooth Sailing',
    bg: 'from-green-200 via-emerald-200 to-green-300 dark:from-green-800/40 dark:via-emerald-800/40 dark:to-green-800/40',
    text: 'text-green-900 dark:text-green-100',
    ring: 'ring-green-200/70 dark:ring-green-800/50',
    iconColor: 'text-green-700 dark:text-green-300',
  },
  scattered: {
    emoji: '🌊',
    label: 'Choppy Waters',
    bg: 'from-yellow-200 via-amber-200 to-yellow-300 dark:from-yellow-800/40 dark:via-amber-800/40 dark:to-yellow-800/40',
    text: 'text-yellow-900 dark:text-yellow-100',
    ring: 'ring-yellow-200/70 dark:ring-yellow-800/50',
    iconColor: 'text-yellow-700 dark:text-yellow-300',
  },
  unfocused: {
    emoji: '🌫️',
    label: "Navigating Fog",
    bg: 'from-red-200 via-rose-200 to-red-300 dark:from-red-800/40 dark:via-rose-800/40 dark:to-red-800/40',
    text: 'text-red-900 dark:text-red-100',
    ring: 'ring-red-200/70 dark:ring-red-800/50',
    iconColor: 'text-red-700 dark:text-red-300',
  },
};

interface HeaderStatusProps {
  focusLevel: FocusLevel | null;
  flowGreeting: FlowGreetingResult;
  timeInfo?: {
    totalMinutes: number;
    isPastStop: boolean;
  } | null;
  onFocusClick?: () => void;
  compact?: boolean;
}

export function HeaderStatus({
  focusLevel,
  flowGreeting,
  timeInfo,
  onFocusClick,
}: HeaderStatusProps) {
  const focusChip = focusLevel ? FOCUS_CHIP[focusLevel] : null;
  const focusLabel = focusChip ? `${focusChip.emoji} ${focusChip.label}` : 'Set focus';

  const renderFocusCard = () => {
    if (!focusChip) {
      return (
        <button
          type="button"
          onClick={onFocusClick}
          className="min-w-[120px] flex flex-shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-br from-slate-50 via-slate-100/80 to-slate-50 px-2.5 py-2 text-sm font-semibold shadow-sm ring-1 ring-slate-200/80 backdrop-blur text-slate-600 dark:from-slate-900/60 dark:via-slate-800/50 dark:to-slate-900/60 dark:ring-slate-700 dark:text-slate-400 transition hover:opacity-90"
        >
          <Zap className="h-4 w-4 text-slate-500 dark:text-slate-400" />
          {focusLabel}
        </button>
      );
    }

    const CardComponent = onFocusClick ? 'button' : 'div';
    const cardProps = onFocusClick
      ? {
        type: 'button' as const,
        onClick: onFocusClick,
        className: 'transition hover:opacity-90',
      }
      : {};

    return (
      <CardComponent
        {...cardProps}
        className={`min-w-[120px] flex flex-shrink-0 items-center gap-1.5 rounded-2xl bg-gradient-to-br px-2.5 py-2 text-sm font-semibold shadow-sm ring-1 backdrop-blur ${focusChip.bg} ${focusChip.text} ${focusChip.ring} ${cardProps.className || ''}`}
      >
        <span className="text-base leading-none">{focusChip.emoji}</span>
        <span>{focusChip.label}</span>
      </CardComponent>
    );
  };

  return (
    <section className="rounded-3xl bg-transparent">
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1">
        {renderFocusCard()}
      </div>
    </section>
  );
}
