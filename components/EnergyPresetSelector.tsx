'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { ENERGY_PRESETS, type EnergySchedulePreset } from '@/lib/energyPresets';
import type { EnergyLevel } from '@/lib/capacity';

const ENERGY_COLORS: Record<EnergyLevel, string> = {
  sparky: 'bg-yellow-400',
  steady: 'bg-green-400',
  flowing: 'bg-blue-400',
  foggy: 'bg-purple-400',
  resting: 'bg-slate-400',
};

interface EnergyPresetSelectorProps {
  selectedPresetId?: string | null;
  onSelectPreset: (preset: EnergySchedulePreset) => void;
}

export function EnergyPresetSelector({ selectedPresetId, onSelectPreset }: EnergyPresetSelectorProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {ENERGY_PRESETS.map((preset) => {
        const isSelected = selectedPresetId === preset.id;
        const isExpanded = expandedId === preset.id;

        return (
          <div
            key={preset.id}
            className={`rounded-xl border-2 transition ${
              isSelected
                ? 'border-cyan-400 bg-cyan-50/50 dark:border-cyan-600 dark:bg-cyan-900/20'
                : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
            }`}
          >
            <button
              onClick={() => {
                setExpandedId(isExpanded ? null : preset.id);
              }}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{preset.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {preset.name}
                      </h3>
                      {isSelected && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                      {preset.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview Timeline */}
              {isExpanded && (
                <div className="mt-4 space-y-2">
                  {preset.schedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 dark:bg-slate-900/50"
                    >
                      <span className="w-16 text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.time}
                      </span>
                      <div className={`h-3 w-3 rounded-full ${ENERGY_COLORS[item.energyLevel]}`} />
                      <span className="text-sm capitalize text-slate-600 dark:text-slate-400">
                        {item.energyLevel}
                      </span>
                      {item.label && (
                        <span className="text-xs text-slate-500 dark:text-slate-500">
                          · {item.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </button>

            {isExpanded && (
              <div className="border-t border-slate-200 p-3 dark:border-slate-700">
                <button
                  onClick={() => onSelectPreset(preset)}
                  className={`w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isSelected
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                      : 'bg-cyan-600 text-white hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600'
                  }`}
                >
                  {isSelected ? 'Currently Selected' : 'Use This Blueprint'}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
