'use client';

import { RefreshCw } from 'lucide-react';
import { EnergyLevel } from '@/lib/capacity';

const ENERGY_CONFIG: Record<
  EnergyLevel,
  {
    emoji: string;
    label: string;
    description: string;
    gradient: string;
    darkGradient: string;
    textColor: string;
  }
> = {
  sparky: {
    emoji: '⚡',
    label: 'Sparky',
    description: 'High energy, scattered',
    gradient: 'bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400',
    darkGradient: 'dark:from-red-600 dark:via-orange-600 dark:to-yellow-600',
    textColor: 'text-slate-900 dark:text-white',
  },
  steady: {
    emoji: '☀️',
    label: 'Steady',
    description: 'Good focus, productive',
    gradient: 'bg-gradient-to-r from-orange-300 to-yellow-200',
    darkGradient: 'dark:from-orange-700 dark:to-yellow-700',
    textColor: 'text-slate-900 dark:text-white',
  },
  flowing: {
    emoji: '🌊',
    label: 'Flowing',
    description: 'Calm, gentle energy',
    gradient: 'bg-gradient-to-r from-cyan-400 to-teal-300',
    darkGradient: 'dark:from-cyan-700 dark:to-teal-700',
    textColor: 'text-slate-900 dark:text-white',
  },
  foggy: {
    emoji: '🌫️',
    label: 'Foggy',
    description: 'Low energy, struggling',
    gradient: 'bg-gradient-to-r from-slate-300 to-slate-200',
    darkGradient: 'dark:from-slate-600 dark:to-slate-700',
    textColor: 'text-slate-900 dark:text-white',
  },
  resting: {
    emoji: '🌙',
    label: 'Resting',
    description: 'Winding down, no work',
    gradient: 'bg-gradient-to-r from-indigo-400 to-purple-300',
    darkGradient: 'dark:from-indigo-700 dark:to-purple-700',
    textColor: 'text-slate-900 dark:text-white',
  },
};

interface EnergyCardProps {
  energyLevel: EnergyLevel | null;
  onChangeEnergy: () => void;
}

export function EnergyCard({ energyLevel, onChangeEnergy }: EnergyCardProps) {
  if (!energyLevel) {
    // Empty state - prompt to set energy
    return (
      <button
        onClick={onChangeEnergy}
        className="group relative w-full overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-cyan-500 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-cyan-500 dark:hover:bg-slate-700"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              How's your energy today?
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Tap to set your energy level
            </p>
          </div>
          <div className="text-4xl opacity-50 transition group-hover:opacity-100">✨</div>
        </div>
      </button>
    );
  }

  const config = ENERGY_CONFIG[energyLevel];

  return (
    <button
      onClick={onChangeEnergy}
      className={`group relative w-full overflow-hidden rounded-2xl p-6 shadow-lg transition hover:shadow-xl ${config.gradient} ${config.darkGradient}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Energy Emoji */}
          <div className="text-5xl">{config.emoji}</div>

          {/* Energy Info */}
          <div className="text-left">
            <h3 className={`text-2xl font-bold ${config.textColor}`}>{config.label}</h3>
            <p className={`mt-1 text-sm font-medium ${config.textColor} opacity-80`}>
              {config.description}
            </p>
          </div>
        </div>

        {/* Change Button */}
        <div className="rounded-full bg-white/30 p-3 backdrop-blur-sm transition group-hover:bg-white/50 dark:bg-black/20 dark:group-hover:bg-black/30">
          <RefreshCw className={`h-5 w-5 ${config.textColor}`} />
        </div>
      </div>
    </button>
  );
}
