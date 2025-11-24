'use client';

interface BandwidthCheckProps {
  selected: string | null;
  onChange: (bandwidth: string) => void;
}

const DAY_REVIEW_OPTIONS = [
  { id: 'a_little', label: 'Got some things done', description: 'Made progress on what mattered' },
  { id: 'not_much', label: 'Struggled today', description: 'Day didn\'t go as planned' },
  { id: 'running_on_empty', label: 'Survival mode', description: 'Just got through the day' },
];

export function BandwidthCheck({ selected, onChange }: BandwidthCheckProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          How Did Today Go?
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson mt-1">
          No judgment, just noticing
        </p>
      </div>

      <div className="space-y-2">
        {DAY_REVIEW_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`w-full px-4 py-3.5 rounded-xl text-left transition-all duration-200 ${
                isSelected
                  ? 'bg-violet-100 dark:bg-violet-900/40 border border-violet-300 dark:border-violet-700'
                  : 'bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600/50'
              }`}
            >
              <span className={`text-sm font-medium block ${
                isSelected ? 'text-violet-700 dark:text-violet-300' : 'text-slate-700 dark:text-slate-300'
              }`}>
                {option.label}
              </span>
              <span className={`text-xs block mt-0.5 ${
                isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
