'use client';

import { Clock, Zap, Target, Sparkles } from 'lucide-react';
import { EnergyLevel, getTimeUntilStop, getCapacityRangeText } from '@/lib/capacity';

const ENERGY_CONFIG: Record<
  EnergyLevel,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  sparky: {
    emoji: '⚡',
    label: 'Sparky',
    color: 'text-yellow-700 dark:text-yellow-300',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
  steady: {
    emoji: '☀️',
    label: 'Steady',
    color: 'text-orange-700 dark:text-orange-300',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  flowing: {
    emoji: '🌊',
    label: 'Flowing',
    color: 'text-blue-700 dark:text-blue-300',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  foggy: {
    emoji: '🌫️',
    label: 'Foggy',
    color: 'text-gray-700 dark:text-gray-300',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
  resting: {
    emoji: '🌙',
    label: 'Resting',
    color: 'text-indigo-700 dark:text-indigo-300',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
};

interface StatusHeaderProps {
  energyLevel: EnergyLevel | null;
  hardStopTime?: string;
  focusCount: number;
  focusCompleted: number;
  totalCapacity: number;
  usedCapacity: number;
  lifeCount: number;
  onEnergyChange?: () => void;
}

export function StatusHeader({
  energyLevel,
  hardStopTime,
  focusCount,
  focusCompleted,
  totalCapacity,
  usedCapacity,
  lifeCount,
  onEnergyChange,
}: StatusHeaderProps) {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeInfo = hardStopTime ? getTimeUntilStop(hardStopTime) : null;
  const energyConfig = energyLevel ? ENERGY_CONFIG[energyLevel] : null;

  return (
    <div className="space-y-4 border-b border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
      {/* Date and Time */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>
            {dateString} • {timeString}
          </span>
        </div>
        {timeInfo && !timeInfo.isPastStop && (
          <div className="text-slate-600 dark:text-slate-400">
            {timeInfo.message}
          </div>
        )}
      </div>

      {/* Energy Level */}
      {energyLevel && energyConfig ? (
        <button
          onClick={onEnergyChange}
          className={`flex w-full items-center gap-3 rounded-xl p-3 transition hover:opacity-80 ${energyConfig.bgColor}`}
        >
          <span className="text-3xl">{energyConfig.emoji}</span>
          <div className="flex-1 text-left">
            <p className={`font-semibold ${energyConfig.color}`}>
              {energyConfig.label} energy today
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Capacity: {getCapacityRangeText(energyLevel)} meaningful tasks
            </p>
          </div>
        </button>
      ) : (
        <button
          onClick={onEnergyChange}
          className="flex w-full items-center gap-3 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3 transition hover:border-cyan-500 hover:bg-cyan-50 dark:border-slate-600 dark:bg-slate-900/50 dark:hover:border-cyan-500 dark:hover:bg-cyan-900/20"
        >
          <Zap className="h-6 w-6 text-slate-400" />
          <div className="flex-1 text-left">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Set your energy level
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              How are you feeling today?
            </p>
          </div>
        </button>
      )}

      {/* Capacity Stats */}
      {energyLevel && (
        <div className="grid grid-cols-2 gap-3">
          {/* Focus Items */}
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Focus
              </span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {focusCompleted}/{focusCount}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {usedCapacity.toFixed(1)}/{totalCapacity} capacity
              </p>
            </div>
          </div>

          {/* Life Maintenance */}
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Life
              </span>
            </div>
            <div className="mt-1">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {lifeCount}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                tasks tracked
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Past Stop Warning */}
      {timeInfo?.isPastStop && (
        <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
          <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
            🌙 Past your hard stop - Your brain is done with deep work
          </p>
        </div>
      )}
    </div>
  );
}
