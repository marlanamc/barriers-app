'use client';

import type { KeyboardEvent } from 'react';
import { Plus, Target } from 'lucide-react';
import type { TaskComplexity } from '@/lib/capacity';

interface FocusTask {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
}

interface FocusSectionProps {
  tasks: FocusTask[];
  canAddMore: boolean;
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onTaskClick: (taskId: string) => void;
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

export function FocusSection({
  tasks,
  canAddMore,
  onAddTask,
  onToggleTask,
  onTaskClick,
}: FocusSectionProps) {
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  const handleKey = (event: KeyboardEvent<HTMLDivElement>, taskId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTaskClick(taskId);
    }
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-white/95 via-[#f6fbff]/90 to-[#fff5fb]/90 p-4 shadow-[0_20px_45px_rgba(153,178,255,0.25)] ring-1 ring-[#e0edff] backdrop-blur-sm dark:bg-none dark:bg-slate-900/50 dark:ring-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Target className="h-4 w-4 text-cyan-500 dark:text-cyan-300" />
          <h2 className="text-base font-semibold">Focus</h2>
        </div>
        <button
          type="button"
          onClick={onAddTask}
          aria-disabled={!canAddMore}
          className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-semibold transition ${
            canAddMore
              ? 'border-transparent bg-gradient-to-r from-[#bff1ff] to-[#e0f7ff] text-[#046d8b] shadow-[0_10px_25px_rgba(120,210,255,0.45)] hover:brightness-105 dark:border-cyan-800 dark:bg-none dark:bg-cyan-900/30 dark:text-cyan-100'
              : 'border-amber-200 bg-white/80 text-amber-700 shadow-none ring-1 ring-amber-100 dark:border-amber-800/60 dark:bg-slate-900/40 dark:text-amber-200'
          }`}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {!canAddMore && (
        <p className="mb-3 text-xs font-medium text-amber-700 dark:text-amber-200">
          You've done enough for today. Time to rest 💙
        </p>
      )}

      {activeTasks.length > 0 ? (
        <div className="space-y-2">
          {activeTasks.map((task) => (
            <div
              key={task.id}
              role="button"
              tabIndex={0}
              onClick={() => onTaskClick(task.id)}
              onKeyDown={(event) => handleKey(event, task.id)}
              className="flex items-center gap-3 rounded-2xl border border-transparent bg-white/90 px-3 py-3 text-left shadow-[0_15px_30px_rgba(173,191,255,0.25)] ring-1 ring-[#e3e0ff] transition hover:ring-[#c7d6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 dark:bg-slate-900/60 dark:ring-slate-800 dark:hover:ring-cyan-400/50"
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleTask(task.id);
                }}
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
                  task.completed
                    ? 'border-[#7cd1f8] bg-[#7cd1f8] text-white dark:border-cyan-300 dark:bg-cyan-400'
                    : 'border-[#dfe6ff] bg-white text-slate-400 hover:border-[#a7c8ff] dark:border-slate-700 dark:bg-slate-900'
                }`}
                aria-label={task.completed ? 'Mark as not done' : 'Mark as done'}
              >
                {task.completed ? '✓' : ''}
              </button>

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
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[#dbe9ff] bg-[#f6fbff] px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-200">Start with one meaningful task.</p>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="mt-3 border-t border-[#ebe2ff] pt-3 dark:border-slate-800">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Completed
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {completedTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => onToggleTask(task.id)}
                className="rounded-full border border-[#e0e5ff] bg-[#f4f5ff] px-3 py-1 text-xs text-[#8b8fae] line-through transition hover:border-[#c5ccff] hover:text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-slate-600"
              >
                {task.description}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
