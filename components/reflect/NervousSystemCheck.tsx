'use client';

interface NervousSystemCheckProps {
  selected: string[];
  onChange: (signals: string[]) => void;
}

const NERVOUS_SYSTEM_SIGNALS = [
  { id: 'jaw_tight', label: 'Jaw tight' },
  { id: 'shoulders_raised', label: 'Shoulders raised' },
  { id: 'stomach_tight', label: 'Stomach tight' },
  { id: 'eyes_tired', label: 'Eyes tired' },
  { id: 'mind_racing', label: 'Mind racing' },
  { id: 'zoning_out', label: 'Zoning out' },
  { id: 'heavy_body', label: 'Heavy/sluggish body' },
  { id: 'restless', label: 'Restless/fidgety' },
  { id: 'calm_neutral', label: 'Calm/neutral' },
];

export function NervousSystemCheck({ selected, onChange }: NervousSystemCheckProps) {
  const toggleSignal = (signalId: string) => {
    if (selected.includes(signalId)) {
      onChange(selected.filter(s => s !== signalId));
    } else {
      onChange([...selected, signalId]);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          Body Check-In
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson mt-1">
          What do you notice right now?
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {NERVOUS_SYSTEM_SIGNALS.map((signal) => {
          const isSelected = selected.includes(signal.id);
          return (
            <button
              key={signal.id}
              type="button"
              onClick={() => toggleSignal(signal.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600/50'
              }`}
            >
              {signal.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
