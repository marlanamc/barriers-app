'use client';

interface EaseTomorrowProps {
  selected: string | null;
  onChange: (prep: string) => void;
}

const TOMORROW_PREPS = [
  { id: 'set_out_clothes', label: 'Set out clothes' },
  { id: 'prep_coffee', label: 'Prep coffee/tea' },
  { id: 'charge_devices', label: 'Charge devices' },
  { id: 'set_one_priority', label: 'Set one priority' },
  { id: 'clear_desk', label: 'Clear desk/space' },
  { id: 'nothing', label: 'Nothing tonight' },
];

export function EaseTomorrow({ selected, onChange }: EaseTomorrowProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          Ease Tomorrow
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson mt-1">
          One small thing to help future you
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TOMORROW_PREPS.map((prep) => {
          const isSelected = selected === prep.id;
          return (
            <button
              key={prep.id}
              type="button"
              onClick={() => onChange(prep.id)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600/50'
              }`}
            >
              {prep.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
