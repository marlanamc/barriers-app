'use client';

import { X } from 'lucide-react';
import { EnergyLevel, getEnergyCapacityRangeText, getEnergyCapacityMessage } from '@/lib/capacity';

interface EnergyModalProps {
  isOpen: boolean;
  currentEnergy: EnergyLevel | null;
  onClose: () => void;
  onSelect: (energy: EnergyLevel) => void;
}

const ENERGY_OPTIONS: Array<{
  value: EnergyLevel;
  emoji: string;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 'sparky',
    emoji: '⚡',
    label: 'Sparky',
    description: 'Peak focus - ready for your hardest tasks',
    color: 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30',
  },
  {
    value: 'steady',
    emoji: '☀️',
    label: 'Steady',
    description: 'Good energy for meaningful work',
    color: 'border-orange-400 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/30',
  },
  {
    value: 'flowing',
    emoji: '🌊',
    label: 'Flowing',
    description: 'Gentle energy - choose lighter tasks',
    color: 'border-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
  },
  {
    value: 'foggy',
    emoji: '🌫️',
    label: 'Foggy',
    description: 'Low energy - be kind to yourself',
    color: 'border-gray-400 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30',
  },
  {
    value: 'resting',
    emoji: '🌙',
    label: 'Resting',
    description: 'Rest time - no deep work expected',
    color: 'border-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30',
  },
];

export function EnergyModal({ isOpen, currentEnergy, onClose, onSelect }: EnergyModalProps) {
  if (!isOpen) return null;

  const handleSelect = (energy: EnergyLevel) => {
    onSelect(energy);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                How's your energy?
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                This helps us suggest the right tasks for you
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Energy Options */}
          <div className="max-h-[60vh] space-y-3 overflow-y-auto p-6">
            {ENERGY_OPTIONS.map((option) => {
              const isSelected = currentEnergy === option.value;
              const capacityRange = getEnergyCapacityRangeText(option.value);

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition ${
                    isSelected
                      ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                      : option.color
                  }`}
                >
                  <span className="text-4xl">{option.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        {option.label}
                      </p>
                      {isSelected && (
                        <span className="rounded-full bg-cyan-600 px-2 py-0.5 text-xs font-medium text-white dark:bg-cyan-500">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {option.description}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-500">
                      Capacity: {capacityRange} meaningful tasks
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              💡 You can change this anytime. Your energy naturally changes throughout the day.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
