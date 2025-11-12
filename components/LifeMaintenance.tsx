'use client';

import { useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';

interface LifeTask {
  id: string;
  description: string;
  completed: boolean;
}

interface LifeMaintenanceProps {
  tasks: LifeTask[];
  onAddTask: (description: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function LifeMaintenance({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: LifeMaintenanceProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState('');

  const handleSubmit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onAddTask(trimmed);
    setDraft('');
    setIsAdding(false);
  };

  return (
    <section className="rounded-3xl bg-gradient-to-br from-white/95 via-[#fff7fd]/90 to-[#f0fff8]/90 p-4 shadow-[0_20px_45px_rgba(163,210,190,0.25)] ring-1 ring-[#f2e3ff] backdrop-blur-sm dark:bg-none dark:bg-slate-900/50 dark:ring-slate-800">
      <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
        <Sparkles className="h-4 w-4 text-emerald-500 dark:text-emerald-300" />
        <h2 className="text-base font-semibold">Life</h2>
      </div>

      <div className="flex flex-wrap gap-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition ${
              task.completed
                ? 'border-transparent bg-gradient-to-r from-[#c9ffe6] to-[#dfffea] text-emerald-700 shadow-[0_5px_15px_rgba(90,199,170,0.35)] dark:border-emerald-800 dark:bg-none dark:bg-emerald-900/30 dark:text-emerald-200'
                : 'border-[#dfe6ff] bg-white/80 text-slate-600 hover:border-[#b7d4ff] dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-emerald-700'
            }`}
          >
            <button
              type="button"
              onClick={() => onToggleTask(task.id)}
              className="flex flex-1 items-center gap-2 bg-transparent text-left"
            >
              <span className="text-base leading-none">
                {task.completed ? '☑' : '☐'}
              </span>
              <span className="truncate">{task.description}</span>
            </button>
            <button
              type="button"
              onClick={() => onDeleteTask(task.id)}
              className="rounded-full p-1 text-slate-400 transition hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              aria-label="Remove life task"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1 rounded-full border border-dashed border-[#bedff5] bg-transparent px-3 py-1 text-sm font-medium text-[#5a7b94] transition hover:border-[#91c4ea] hover:text-[#2e5e7b] dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {isAdding && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            autoFocus
            placeholder="e.g., Refill water"
            className="flex-1 rounded-xl border border-[#dfe4ff] bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#a7d9ff] focus:outline-none focus:ring-2 focus:ring-[#d7f4ff] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-500/30"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!draft.trim()}
            className="rounded-xl bg-gradient-to-r from-[#9beedb] to-[#b8f7e7] px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:brightness-105 disabled:opacity-50 dark:bg-none dark:bg-emerald-400 dark:hover:bg-emerald-300 dark:text-slate-900"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdding(false);
              setDraft('');
            }}
            className="rounded-xl border border-[#dfe4ff] px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-[#f5f7ff] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      )}

      {!tasks.length && !isAdding && (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
          Keep tiny rituals visible so they get done.
        </p>
      )}
    </section>
  );
}
