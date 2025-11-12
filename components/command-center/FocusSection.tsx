'use client';

import { Plus, Target, AlertCircle } from 'lucide-react';
import { TaskComplexity, MAX_FOCUS_ITEMS } from '@/lib/capacity';

interface FocusTask {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
  anchorTime?: string;
  barrier?: {
    type: string;
    custom?: string;
  };
}

interface FocusSectionProps {
  tasks: FocusTask[];
  canAddMore: boolean;
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onTaskClick: (taskId: string) => void;
}

const COMPLEXITY_BADGES: Record<TaskComplexity, { label: string; color: string }> = {
  quick: { label: 'Quick', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  deep: { label: 'Deep', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

export function FocusSection({
  tasks,
  canAddMore,
  onAddTask,
  onToggleTask,
  onTaskClick,
}: FocusSectionProps) {
  const incompleteTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const taskCount = incompleteTasks.length;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Focus
          </h2>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            ({taskCount}/{MAX_FOCUS_ITEMS})
          </span>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {/* Incomplete Tasks */}
        {incompleteTasks.map((task) => {
          const complexityBadge = COMPLEXITY_BADGES[task.complexity];

          return (
            <button
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              className="group w-full rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-cyan-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleTask(task.id);
                  }}
                  className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 border-slate-300 transition hover:border-cyan-500 dark:border-slate-600"
                  aria-label="Mark as complete"
                >
                  {task.completed && (
                    <svg
                      className="h-4 w-4 text-cyan-600 dark:text-cyan-400"
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

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {task.description}
                    </p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${complexityBadge.color}`}>
                      {complexityBadge.label}
                    </span>
                  </div>

                  {/* Metadata */}
                  {(task.barrier || task.anchorTime) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                      {task.barrier && (
                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-300">
                          <AlertCircle className="h-3 w-3" />
                          {task.barrier.custom || task.barrier.type}
                        </span>
                      )}
                      {task.anchorTime && (
                        <span className="text-slate-600 dark:text-slate-400">
                          🕐 {task.anchorTime}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-2">
            {completedTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/50 dark:bg-green-900/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-green-600 dark:bg-green-500">
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
                  </div>
                  <span className="flex-1 text-sm font-medium text-green-900 line-through dark:text-green-100">
                    {task.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-600 dark:bg-slate-900/50">
            <Target className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 font-medium text-slate-700 dark:text-slate-300">
              No focus items yet
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Add your first meaningful task for today
            </p>
          </div>
        )}
      </div>

      {/* Add Button */}
      {canAddMore ? (
        <button
          onClick={onAddTask}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cyan-300 bg-cyan-50 py-3 font-semibold text-cyan-700 transition hover:border-cyan-500 hover:bg-cyan-100 dark:border-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-300 dark:hover:bg-cyan-900/30"
        >
          <Plus className="h-5 w-5" />
          Add Focus Item
        </button>
      ) : (
        <div className="rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
          You've reached your capacity limit. Focus on completing what you have!
        </div>
      )}
    </div>
  );
}
