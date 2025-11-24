'use client';

import { Feather } from 'lucide-react';

interface LogbookEmptyProps {
  onAddThought: () => void;
}

export function LogbookEmpty({ onAddThought }: LogbookEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Calm, minimal icon */}
      <div className="mb-6 rounded-full bg-pink-100 dark:bg-pink-900/30 p-4">
        <Feather className="h-8 w-8 text-pink-400 dark:text-pink-400" />
      </div>

      {/* Gentle, affirming message */}
      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 font-cinzel text-center">
        Your mind is clear
      </h2>

      <p className="mt-3 text-center text-sm text-slate-600 dark:text-slate-400 font-crimson max-w-xs leading-relaxed">
        Capture thoughts as they come. You can organize them later.
      </p>

      {/* Primary action - centered, calm */}
      <button
        onClick={onAddThought}
        className="mt-8 rounded-xl bg-slate-900 dark:bg-slate-100 px-6 py-3 text-sm font-medium text-white dark:text-slate-900 transition hover:bg-slate-800 dark:hover:bg-slate-200 font-crimson"
      >
        + Capture a Thought
      </button>
    </div>
  );
}
