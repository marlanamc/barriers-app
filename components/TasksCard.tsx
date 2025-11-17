'use client';

import { useState, type KeyboardEvent } from 'react';
import { Target, Sparkles, X } from 'lucide-react';
import type { TaskComplexity } from '@/lib/capacity';

interface FocusTask {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
}

interface LifeTask {
  id: string;
  description: string;
  completed: boolean;
}

interface TasksCardProps {
  focusTasks: FocusTask[];
  lifeTasks: LifeTask[];
  canAddMoreFocus: boolean;
  onAddFocusTask: () => void;
  onToggleFocusTask: (taskId: string) => void;
  onFocusTaskClick: (taskId: string) => void;
  onAddLifeTask: (description: string) => void;
  onToggleLifeTask: (taskId: string) => void;
  onDeleteLifeTask: (taskId: string) => void;
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

export function TasksCard({
  focusTasks,
  lifeTasks,
  canAddMoreFocus,
  onAddFocusTask: _onAddFocusTask,
  onToggleFocusTask,
  onFocusTaskClick,
  onAddLifeTask: _onAddLifeTask,
  onToggleLifeTask,
  onDeleteLifeTask,
}: TasksCardProps) {
  const activeFocusTasks = focusTasks.filter((task) => !task.completed);
  const completedFocusTasks = focusTasks.filter((task) => task.completed);

  const handleKey = (event: KeyboardEvent<HTMLDivElement>, taskId: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onFocusTaskClick(taskId);
    }
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-white/95 via-[#f6fbff]/90 to-[#fff5fb]/90 p-5 shadow-[0_20px_45px_rgba(153,178,255,0.25)] ring-1 ring-[#e0edff] backdrop-blur-sm dark:bg-none dark:bg-slate-900/50 dark:ring-slate-800">
      {/* Focus Section */}
      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Target className="h-5 w-5 text-cyan-500 dark:text-cyan-300" />
            <h2 className="text-base font-semibold">Focus</h2>
          </div>
        </div>

        {!canAddMoreFocus && (
          <p className="mb-3 text-xs font-medium text-amber-700 dark:text-amber-200">
            You've done enough for today. Time to rest 💙
          </p>
        )}

        {activeFocusTasks.length > 0 ? (
          <div className="space-y-2.5">
            {activeFocusTasks.map((task) => (
              <div
                key={task.id}
                role="button"
                tabIndex={0}
                onClick={() => onFocusTaskClick(task.id)}
                onKeyDown={(event) => handleKey(event, task.id)}
                className="group flex items-center gap-3.5 rounded-2xl border border-transparent bg-white/90 px-4 py-3.5 text-left shadow-[0_8px_20px_rgba(173,191,255,0.15)] ring-1 ring-[#e3e0ff] transition hover:shadow-[0_12px_28px_rgba(153,178,255,0.25)] hover:ring-[#c7d6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:bg-slate-900/60 dark:ring-slate-800 dark:hover:ring-cyan-400/50"
                aria-label={`Edit focus task: ${task.description}`}
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFocusTask(task.id);
                  }}
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${
                    task.completed
                      ? 'border-[#7cd1f8] bg-[#7cd1f8] text-white shadow-[0_4px_12px_rgba(124,209,248,0.4)] dark:border-cyan-300 dark:bg-cyan-400'
                      : 'border-[#d0deff] bg-white text-slate-400 hover:border-[#a7c8ff] hover:scale-105 dark:border-slate-700 dark:bg-slate-900'
                  }`}
                  aria-label={`${task.completed ? 'Mark as not done' : 'Mark as done'}: ${task.description}`}
                  aria-pressed={task.completed}
                >
                  {task.completed ? '✓' : ''}
                </button>

                <div className="flex-1">
                  <p className={`text-sm font-medium leading-relaxed ${
                    task.completed
                      ? 'text-slate-500 line-through dark:text-slate-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {task.description}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${COMPLEXITY_STYLES[task.complexity]}`}
                  aria-label={`Task complexity: ${COMPLEXITY_LABEL[task.complexity]}`}
                >
                  {COMPLEXITY_LABEL[task.complexity]}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#dbe9ff] bg-[#f6fbff] px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            <p className="font-medium text-slate-700 dark:text-slate-200">Start with one meaningful task.</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use Quick Add to drop tasks here.</p>
          </div>
        )}

        {completedFocusTasks.length > 0 && (
          <div className="mt-4 rounded-xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50/50 to-cyan-50/50 p-4 dark:border-emerald-800/30 dark:bg-gradient-to-r dark:from-emerald-900/20 dark:to-cyan-900/20">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                ✓ Completed Today
              </p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                {completedFocusTasks.length}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {completedFocusTasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => onToggleFocusTask(task.id)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 line-through transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-slate-700 dark:border-emerald-800/50 dark:bg-slate-900/40 dark:text-slate-400 dark:hover:border-emerald-700 dark:hover:bg-emerald-900/30"
                >
                  {task.description}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-5 border-t border-[#ebe2ff] dark:border-slate-800" />

      {/* Life Section */}
      <div>
        <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Sparkles className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
          <h2 className="text-base font-semibold">Life</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {lifeTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                task.completed
                  ? 'border-transparent bg-gradient-to-r from-[#c9ffe6] to-[#dfffea] text-emerald-700 shadow-[0_5px_15px_rgba(90,199,170,0.35)] dark:border-emerald-800 dark:bg-none dark:bg-emerald-900/30 dark:text-emerald-200'
                  : 'border-[#dfe6ff] bg-white/80 text-slate-600 hover:border-[#b7d4ff] dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-emerald-700'
              }`}
            >
              <button
                type="button"
                onClick={() => onToggleLifeTask(task.id)}
                className="flex flex-1 items-center gap-2 bg-transparent text-left"
              >
                <span className="text-base leading-none">
                  {task.completed ? '☑' : '☐'}
                </span>
                <span className="truncate">{task.description}</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteLifeTask(task.id)}
                className="rounded-full p-1 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                aria-label="Remove life task"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

        </div>

        {!lifeTasks.length && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Use Quick Add to add life tasks.
          </p>
        )}
      </div>
    </section>
  );
}
