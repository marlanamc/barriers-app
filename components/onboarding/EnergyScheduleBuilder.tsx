'use client';

import { useState } from 'react';

export interface EnergyLevel {
  time: string;
  energy: 'sparky' | 'steady' | 'flowing' | 'foggy' | 'resting';
}

const ENERGY_OPTIONS = [
  { value: 'sparky', label: 'Sparky', color: 'bg-yellow-400' },
  { value: 'steady', label: 'Steady', color: 'bg-orange-400' },
  { value: 'flowing', label: 'Flowing', color: 'bg-blue-400' },
  { value: 'foggy', label: 'Foggy', color: 'bg-gray-400' },
  { value: 'resting', label: 'Resting', color: 'bg-indigo-400' },
] as const;

const DEFAULT_SCHEDULE: EnergyLevel[] = [
  { time: '08:00', energy: 'steady' },
  { time: '12:00', energy: 'sparky' },
  { time: '15:00', energy: 'flowing' },
  { time: '18:00', energy: 'resting' },
];

interface EnergyScheduleBuilderProps {
  onScheduleChange: (schedule: EnergyLevel[]) => void;
  initialSchedule?: EnergyLevel[];
}

export function EnergyScheduleBuilder({
  onScheduleChange,
  initialSchedule = DEFAULT_SCHEDULE,
}: EnergyScheduleBuilderProps) {
  const [schedule, setSchedule] = useState<EnergyLevel[]>(initialSchedule);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const updateEnergy = (time: string, energy: EnergyLevel['energy']) => {
    const newSchedule = schedule.map((item) =>
      item.time === time ? { ...item, energy } : item
    );
    setSchedule(newSchedule);
    onScheduleChange(newSchedule);
    setSelectedTime(null);
  };

  const getEnergyOption = (energyValue: string) =>
    ENERGY_OPTIONS.find((opt) => opt.value === energyValue) || ENERGY_OPTIONS[0];

  return (
    <div className="space-y-6">
      <div className="space-y-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
        {schedule.map((item, index) => {
          const option = getEnergyOption(item.energy);
          return (
            <div key={item.time} className="space-y-2">
              <button
                onClick={() => setSelectedTime(item.time)}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {item.time}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {option.label}
                  </span>
                </div>
              </button>

              {selectedTime === item.time && (
                <div className="flex flex-wrap gap-2 rounded-lg bg-white p-3 dark:bg-slate-800">
                  {ENERGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => updateEnergy(item.time, opt.value)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                        item.energy === opt.value
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                          : 'border-slate-200 hover:border-cyan-300 dark:border-slate-700'
                      }`}
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Tap any time to change the energy level. This helps us suggest the best times for
          focused work.
        </p>
      </div>

      <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
        <p className="font-medium">What each level means:</p>
        <ul className="space-y-1">
          <li><strong>Sparky:</strong> Peak focus, tackle hardest tasks</li>
          <li><strong>Steady:</strong> Good for most work</li>
          <li><strong>Flowing:</strong> Creative work, easier tasks</li>
          <li><strong>Foggy:</strong> Low energy, minimal work</li>
          <li><strong>Resting:</strong> Time off, no work expected</li>
        </ul>
      </div>
    </div>
  );
}
