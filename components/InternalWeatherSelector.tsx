'use client';

import clsx from 'clsx';

export interface WeatherOption {
  key: string;
  label: string;
  description: string;
  icon: string;
}

interface InternalWeatherSelectorProps {
  selectedKey?: string | null;
  onSelect: (option: WeatherOption) => void;
}

export const internalWeatherOptions: WeatherOption[] = [
  { key: 'clear', label: 'Clear', description: 'Focused, light, steady', icon: '☀️' },
  { key: 'cloudy', label: 'Cloudy', description: 'A bit foggy but okay', icon: '🌤' },
  { key: 'rainy', label: 'Rainy', description: 'Heavy, slow, hard to get going', icon: '🌧' },
  { key: 'stormy', label: 'Stormy', description: 'Overwhelmed, scattered, tense', icon: '🌪' },
  { key: 'quiet', label: 'Quiet', description: 'Detached, tired, low input', icon: '🌙' },
];

export function InternalWeatherSelector({ selectedKey, onSelect }: InternalWeatherSelectorProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-2">
      <div className="flex gap-4 snap-x snap-mandatory">
        {internalWeatherOptions.map((option) => {
          const isActive = option.key === selectedKey;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => onSelect(option)}
              className={clsx(
                'min-w-[180px] flex-1 rounded-2xl border bg-white/80 backdrop-blur-sm px-4 py-5 text-left shadow-sm transition-all duration-200 snap-start',
                isActive
                  ? 'border-cyan-400 shadow-lg ring-2 ring-offset-1 ring-cyan-200'
                  : 'border-white/20 hover:border-cyan-200 hover:shadow-md'
              )}
            >
              <div className="text-3xl mb-3">{option.icon}</div>
              <p className="text-base font-semibold text-slate-900">{option.label}</p>
              <p className="text-sm text-slate-600">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
