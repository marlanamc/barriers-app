'use client';

import { useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';

interface LifeTask {
  id: string;
  description: string;
  completed: boolean;
}

interface LifeSectionProps {
  tasks: LifeTask[];
  onAddTask: (description: string) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function LifeSection({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}: LifeSectionProps) {
  const [showInput, setShowInput] = useState(false);
  const [newTask, setNewTask] = useState('');

  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);

  const handleAddTask = () => {
    if (newTask.trim()) {
      onAddTask(newTask.trim());
      setNewTask('');
      setShowInput(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask();
    } else if (e.key === 'Escape') {
      setNewTask('');
      setShowInput(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Life Maintenance
        </h2>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          ({tasks.length} {tasks.length === 1 ? 'task' : 'tasks'})
        </span>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {/* Incomplete Tasks */}
        {incompleteTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            {/* Checkbox */}
            <button
              onClick={() => onToggleTask(task.id)}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 border-slate-300 transition hover:border-emerald-500 dark:border-slate-600"
              aria-label="Mark as complete"
            >
              {task.completed && (
                <svg
                  className="h-3 w-3 text-emerald-600 dark:text-emerald-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Task Text */}
            <span className="flex-1 text-sm text-slate-700 dark:text-slate-300">
              {task.description}
            </span>

            {/* Delete Button */}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 transition hover:text-red-600 group-hover:opacity-100 dark:hover:text-red-400"
              aria-label="Delete task"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Completed Tasks */}
        {completedTasks.map((task) => (
          <div
            key={task.id}
            className="group flex items-center gap-3 rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20"
          >
            {/* Checkbox */}
            <button
              onClick={() => onToggleTask(task.id)}
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-emerald-600 dark:bg-emerald-500"
              aria-label="Mark as incomplete"
            >
              <svg
                className="h-3 w-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Task Text */}
            <span className="flex-1 text-sm text-emerald-900 line-through dark:text-emerald-100">
              {task.description}
            </span>

            {/* Delete Button */}
            <button
              onClick={() => onDeleteTask(task.id)}
              className="opacity-0 transition hover:text-red-600 group-hover:opacity-100 dark:hover:text-red-400"
              aria-label="Delete task"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center dark:border-slate-600 dark:bg-slate-900/50">
            <Sparkles className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Track daily essentials like meds, water, meals
            </p>
          </div>
        )}
      </div>

      {/* Quick Add Input */}
      {showInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="e.g., Take morning meds"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-600 dark:bg-slate-800"
            autoFocus
          />
          <button
            onClick={handleAddTask}
            disabled={!newTask.trim()}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
          >
            Add
          </button>
          <button
            onClick={() => {
              setNewTask('');
              setShowInput(false);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowInput(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
        >
          <Plus className="h-4 w-4" />
          Quick Add
        </button>
      )}
    </div>
  );
}
