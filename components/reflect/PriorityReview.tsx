'use client';

import { Target } from 'lucide-react';

interface PriorityReviewProps {
  priorityText: string;
  selected: string | null;
  onChange: (outcome: string) => void;
}

const PRIORITY_OUTCOMES = [
  { id: 'made_progress', label: 'Made progress' },
  { id: 'didnt_get_to_it', label: "Didn't get to it" },
  { id: 'got_stuck', label: 'Got stuck' },
  { id: 'chose_rest', label: 'Chose rest' },
];

export function PriorityReview({ priorityText, selected, onChange }: PriorityReviewProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          Today's Priority
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson mt-1">
          What happened with it?
        </p>
      </div>

      {/* Show the priority */}
      <div className="px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/40 flex items-start gap-3">
        <Target className="h-4 w-4 text-violet-500 dark:text-violet-400 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-violet-900 dark:text-violet-200 font-crimson leading-relaxed">
          {priorityText}
        </p>
      </div>

      {/* Outcome options */}
      <div className="grid grid-cols-2 gap-2">
        {PRIORITY_OUTCOMES.map((outcome) => {
          const isSelected = selected === outcome.id;
          return (
            <button
              key={outcome.id}
              type="button"
              onClick={() => onChange(outcome.id)}
              className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 border border-transparent hover:bg-slate-200 dark:hover:bg-slate-600/50'
              }`}
            >
              {outcome.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
