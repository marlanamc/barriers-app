'use client';

import { useState } from 'react';
import { CheckCircle, FileText, Archive, MoreHorizontal } from 'lucide-react';
import type { Thought } from '@/hooks/useThoughts';

interface ThoughtItemProps {
  thought: Thought;
  onConvertToTask: (id: string) => void;
  onConvertToNote: (id: string) => void;
  onArchive: (id: string) => void;
}

export function ThoughtItem({
  thought,
  onConvertToTask,
  onConvertToNote,
  onArchive,
}: ThoughtItemProps) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="group relative rounded-xl border border-slate-200/60 bg-white dark:bg-slate-800/80 p-4 transition-all hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600">
      {/* Thought text */}
      <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-wrap pr-8">
        {thought.text}
      </p>

      {/* Timestamp */}
      <span className="mt-2 block text-xs text-slate-400 dark:text-slate-500">
        {formatTime(thought.created_at)}
      </span>

      {/* Actions - show on hover or tap */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onConvertToTask(thought.id)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-sky-100 hover:text-sky-700 dark:hover:bg-sky-900/30 dark:hover:text-sky-400"
        >
          <CheckCircle className="h-3.5 w-3.5" />
          Task
        </button>

        <button
          onClick={() => onConvertToNote(thought.id)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-amber-900/30 dark:hover:text-amber-400"
        >
          <FileText className="h-3.5 w-3.5" />
          Note
        </button>

        <button
          onClick={() => onArchive(thought.id)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-600"
        >
          <Archive className="h-3.5 w-3.5" />
          Archive
        </button>
      </div>
    </div>
  );
}
