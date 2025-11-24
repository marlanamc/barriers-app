'use client';

import { Plus } from 'lucide-react';

interface ThoughtOffloadProps {
  onAddThought: () => void;
}

export function ThoughtOffload({ onAddThought }: ThoughtOffloadProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          Thought Offload
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson mt-1">
          Anything still bouncing around in your head?
        </p>
      </div>

      <button
        type="button"
        onClick={onAddThought}
        className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600/50 hover:text-slate-700 dark:hover:text-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium font-crimson">Add a quick thought</span>
      </button>
    </div>
  );
}
