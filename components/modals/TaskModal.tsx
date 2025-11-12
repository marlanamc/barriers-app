'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { TaskComplexity, TaskType } from '@/lib/capacity';

interface TaskModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  taskType: TaskType;
  initialData?: {
    id?: string;
    description: string;
    complexity: TaskComplexity;
    anchorTime?: string;
    barrier?: {
      type: string;
      custom?: string;
    };
  };
  onClose: () => void;
  onSave: (task: {
    id?: string;
    description: string;
    complexity: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
    barrier?: {
      type: string;
      custom?: string;
    };
  }) => void;
}

const COMPLEXITY_OPTIONS: Array<{
  value: TaskComplexity;
  label: string;
  description: string;
  points: string;
  color: string;
}> = [
  {
    value: 'quick',
    label: 'Quick',
    description: 'Small task, 15-30 minutes',
    points: '0.5 pts',
    color: 'border-green-400 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30',
  },
  {
    value: 'medium',
    label: 'Medium',
    description: 'Normal task, 30-60 minutes',
    points: '1.0 pts',
    color: 'border-blue-400 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30',
  },
  {
    value: 'deep',
    label: 'Deep',
    description: 'Big task, 1-2 hours',
    points: '1.5 pts',
    color: 'border-purple-400 bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30',
  },
];

export function TaskModal({ isOpen, mode, taskType, initialData, onClose, onSave }: TaskModalProps) {
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState<TaskComplexity>('medium');
  const [anchorTime, setAnchorTime] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setComplexity(initialData.complexity);
      setAnchorTime(initialData.anchorTime || '');
    } else {
      setDescription('');
      setComplexity('medium');
      setAnchorTime('');
    }
    setError('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError('Please enter a task description');
      return;
    }

    onSave({
      id: initialData?.id,
      description: trimmedDescription,
      complexity,
      taskType,
      anchorTime: anchorTime.trim() || undefined,
    });

    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const isFocusTask = taskType === 'focus';
  const title = mode === 'add'
    ? (isFocusTask ? 'Add Focus Item' : 'Add Life Task')
    : (isFocusTask ? 'Edit Focus Item' : 'Edit Life Task');

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
        <div
          className="relative mt-10 mb-10 w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6 p-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-200">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Description Input */}
            <div className="space-y-2">
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                What's the task?
              </label>
              <textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isFocusTask ? "e.g., Apply to 3 jobs" : "e.g., Take morning meds"}
                rows={3}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                autoFocus
              />
            </div>

            {/* Complexity Picker (only for focus tasks) */}
            {isFocusTask && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  How hard is this task?
                </label>
                <div className="space-y-2">
                  {COMPLEXITY_OPTIONS.map((option) => {
                    const isSelected = complexity === option.value;

                    return (
                      <button
                        key={option.value}
                        onClick={() => setComplexity(option.value)}
                        className={`flex w-full items-center justify-between rounded-lg border-2 p-3 text-left transition ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                            : option.color
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {option.label}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {option.points}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                            {option.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-600 dark:bg-cyan-500">
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
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Anchor Time (optional) */}
            <div className="space-y-2">
              <label
                htmlFor="anchor-time"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                When? (optional)
              </label>
              <input
                type="text"
                id="anchor-time"
                value={anchorTime}
                onChange={(e) => setAnchorTime(e.target.value)}
                placeholder="e.g., 10am, after lunch, while drinking coffee"
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Time anchors help prevent time blindness
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              {mode === 'add' ? 'Add Task' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
