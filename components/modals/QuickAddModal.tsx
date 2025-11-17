'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Target } from 'lucide-react';
import { parseTaskInput, suggestComplexity } from '@/lib/natural-language';
import { TaskType, TaskComplexity } from '@/lib/capacity';

interface QuickAddModalProps {
  isOpen: boolean;
  defaultType?: TaskType;
  defaultInbox?: boolean;
  onClose: () => void;
  onSave: (task: {
    description: string;
    complexity: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
    inInbox?: boolean;
  }) => void;
}

export function QuickAddModal({ isOpen, defaultType = 'focus', defaultInbox = false, onClose, onSave }: QuickAddModalProps) {
  const [input, setInput] = useState('');
  const [taskType, setTaskType] = useState<TaskType>(defaultType);
  const [saveToInbox, setSaveToInbox] = useState(defaultInbox);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setTaskType(defaultType);
      setSaveToInbox(defaultInbox);
      // Focus input after modal renders
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultType, defaultInbox]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!input.trim()) return;

    const parsed = parseTaskInput(input);
    const complexity = suggestComplexity(parsed.description);

    // Convert anchor to legacy format for now
    const anchorTime = parsed.anchorType && parsed.anchorValue
      ? `${parsed.anchorType} ${parsed.anchorValue}`
      : undefined;

    onSave({
      description: parsed.description,
      complexity,
      taskType,
      anchorTime,
      inInbox: saveToInbox,
    });

    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
        <div
          className="relative mt-32 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Quick Add
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
          <div className="space-y-4 p-6">
            {/* Task Type Toggle */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTaskType('focus')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 font-medium transition ${
                  taskType === 'focus'
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Target className="h-4 w-4" />
                Focus
              </button>
              <button
                type="button"
                onClick={() => setTaskType('life')}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-2.5 font-medium transition ${
                  taskType === 'life'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                Life
              </button>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  taskType === 'focus'
                    ? 'e.g., call doctor at 2pm'
                    : 'e.g., take morning meds'
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try: "at 2pm", "before dinner", "while coffee brewing"
              </p>
            </div>

            {/* Save location toggle */}
            {taskType === 'focus' && (
              <div className="flex items-center gap-3">
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                  <input
                    type="checkbox"
                    checked={saveToInbox}
                    onChange={(e) => setSaveToInbox(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Save to Inbox (for later)
                  </span>
                </label>
              </div>
            )}

            {/* Smart preview */}
            {input.trim() && (
              <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-3 dark:border-cyan-800/40 dark:bg-cyan-900/20">
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Will save {saveToInbox ? 'to Inbox' : 'to Today'}:
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {parseTaskInput(input).description}
                </p>
                {parseTaskInput(input).anchorType && !saveToInbox && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                    {parseTaskInput(input).anchorType} {parseTaskInput(input).anchorValue}
                  </p>
                )}
                <p className="mt-1 text-xs text-cyan-700 dark:text-cyan-300">
                  Complexity: {suggestComplexity(parseTaskInput(input).description)}
                </p>
              </div>
            )}
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
              disabled={!input.trim()}
              className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
