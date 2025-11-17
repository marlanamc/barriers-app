'use client';

import { Inbox, ArrowRight, X } from 'lucide-react';
import type { TaskComplexity } from '@/lib/capacity';

interface InboxTask {
  id: string;
  description: string;
  complexity: TaskComplexity;
}

interface InboxCardProps {
  tasks: InboxTask[];
  onPromoteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

const COMPLEXITY_STYLES: Record<TaskComplexity, string> = {
  quick: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  deep: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
};

const COMPLEXITY_LABEL: Record<TaskComplexity, string> = {
  quick: 'Quick',
  medium: 'Medium',
  deep: 'Deep',
};

export function InboxCard({ tasks, onPromoteTask, onDeleteTask }: InboxCardProps) {
  if (tasks.length === 0) return null;

  return (
    <section className="rounded-3xl border border-slate-300/50 bg-gradient-to-br from-slate-50/80 via-white/60 to-slate-50/80 p-5 shadow-[0_8px_20px_rgba(100,116,139,0.1)] ring-1 ring-slate-200/50 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/40 dark:ring-slate-800/50">
      <div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
        <Inbox className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        <h2 className="text-base font-semibold">Inbox</h2>
        <span className="ml-auto rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
          {tasks.length}
        </span>
      </div>

      <p className="mb-3 text-xs text-slate-600 dark:text-slate-400">
        Captured ideas. Promote to Focus when ready, or delete if not needed.
      </p>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600"
          >
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {task.description}
              </p>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${COMPLEXITY_STYLES[task.complexity]}`}
            >
              {COMPLEXITY_LABEL[task.complexity]}
            </span>

            <button
              type="button"
              onClick={() => onPromoteTask(task.id)}
              className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2 py-1 text-xs font-semibold text-white opacity-0 transition hover:bg-cyan-700 group-hover:opacity-100 dark:bg-cyan-500 dark:hover:bg-cyan-600"
              title="Promote to Focus"
            >
              <ArrowRight className="h-3 w-3" />
            </button>

            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Delete"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
