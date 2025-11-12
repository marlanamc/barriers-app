'use client';

import { useState, useEffect } from 'react';
import { Clock, Zap, Target, Sparkles, Settings, AlertTriangle } from 'lucide-react';
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
  onTimeSettings?: () => void;
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
  });
  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const timeInfo = hardStopTime ? getTimeUntilStop(hardStopTime) : null;
  const energyConfig = energyLevel ? ENERGY_CONFIG[energyLevel] : null;

  // Determine warning level based on time remaining
  const getWarningLevel = () => {
    if (!timeInfo) return null;
    if (timeInfo.isPastStop) return 'critical';
    if (timeInfo.totalMinutes < 60) return 'critical';
    if (timeInfo.totalMinutes < 120) return 'warning';
    return null;
  };

  const warningLevel = getWarningLevel();

  return (
    <div className="space-y-4 border-b border-slate-200 bg-white/80 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
      {/* Date and Time Row */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
          <Clock className="h-4 w-4" />
          <span>
            {dateString} • {timeString}
          </span>
        </div>

        {/* Time Settings Button */}
        {onTimeSettings && (
          <button
            onClick={onTimeSettings}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-300"
          >
            <Settings className="h-3 w-3" />
            Time Settings
          </button>
        )}
      </div>

      {/* Time Countdown with Warnings */}
      {timeInfo && (
        <div className="space-y-2">
          {!timeInfo.isPastStop ? (
            <div
              className={`rounded-lg p-3 ${
                warningLevel === 'critical'
                  ? 'bg-red-100 dark:bg-red-900/30'
                  : warningLevel === 'warning'
                  ? 'bg-amber-100 dark:bg-amber-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              <div className="flex items-center gap-2">
                {warningLevel && (
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      warningLevel === 'critical'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  />
                )}
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold ${
                      warningLevel === 'critical'
                        ? 'text-red-900 dark:text-red-100'
                        : warningLevel === 'warning'
                        ? 'text-amber-900 dark:text-amber-100'
                        : 'text-blue-900 dark:text-blue-100'
                    }`}
                  >
                    {timeInfo.message}
                  </p>
                  {warningLevel === 'critical' && (
                    <p className="mt-1 text-xs text-red-700 dark:text-red-200">
                      Time to wrap up and finish what you're working on
                    </p>
                  )}
                  {warningLevel === 'warning' && (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-200">
                      This is your last focus window - choose wisely
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-indigo-100 p-3 dark:bg-indigo-900/30">
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                🌙 Past your hard stop - Your brain is done with deep work
              </p>
              <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-200">
                Time to rest and recharge for tomorrow
              </p>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
