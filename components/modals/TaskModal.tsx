'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { TaskComplexity, TaskType } from '@/lib/capacity';
import { getBarrierTypes, type BarrierType } from '@/lib/supabase';
import { type TaskAnchorType, type TaskAnchor } from '@/lib/checkin-context';
import { cleanAnchorInput, anchorLabel, getMergedAnchorSuggestions, defaultAnchorSuggestionMap } from '@/lib/anchors';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

interface TaskModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  taskType: TaskType;
  initialData?: {
    id?: string;
    description: string;
    complexity: TaskComplexity;
    anchors?: TaskAnchor[];
    barrier?: {
      barrierTypeSlug?: string;
      barrierTypeId?: string | null;
      custom?: string;
    };
  };
  onClose: () => void;
  onSave: (task: {
    id?: string;
    description: string;
    complexity: TaskComplexity;
    taskType: TaskType;
    anchors?: TaskAnchor[];
    barrier?: {
      barrierTypeSlug?: string;
      barrierTypeId?: string | null;
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

const anchorOptions: Array<{ type: TaskAnchorType; label: string }> = [
  { type: "at", label: "At…" },
  { type: "while", label: "While…" },
  { type: "before", label: "Before…" },
  { type: "after", label: "After…" },
];

const anchorTextLabels: Record<Exclude<TaskAnchorType, "at">, string> = {
  while: "Pair it with",
  before: "Before what?",
  after: "After what?",
};

const anchorPlaceholders: Record<Exclude<TaskAnchorType, "at">, string> = {
  while: "listening to music...",
  before: "the kids wake up...",
  after: "dinner cleanup...",
};

export function TaskModal({ isOpen, mode, taskType, initialData, onClose, onSave }: TaskModalProps) {
  const { user } = useSupabaseUser();
  const [description, setDescription] = useState('');
  const [complexity, setComplexity] = useState<TaskComplexity>('medium');
  const [error, setError] = useState('');

  // Barrier state
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [selectedBarrierSlug, setSelectedBarrierSlug] = useState('');
  const [barrierCustom, setBarrierCustom] = useState('');
  const [showBarriers, setShowBarriers] = useState(false);

  // Anchor state
  const [anchors, setAnchors] = useState<TaskAnchor[]>([]);
  const [showAnchors, setShowAnchors] = useState(false);
  const [addingAnchor, setAddingAnchor] = useState(false);
  const [newAnchorType, setNewAnchorType] = useState<TaskAnchorType | null>(null);
  const [newAnchorValue, setNewAnchorValue] = useState('');
  const [mergedAnchorSuggestions, setMergedAnchorSuggestions] = useState<Partial<Record<TaskAnchorType, string[]>>>({
    while: defaultAnchorSuggestionMap.while || [],
    before: defaultAnchorSuggestionMap.before || [],
    after: defaultAnchorSuggestionMap.after || [],
  });

  // Load barrier types
  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

  // Load user anchor presets
  useEffect(() => {
    if (!user?.id) return;

    const loadMergedSuggestions = async () => {
      try {
        const [whileMerged, beforeMerged, afterMerged] = await Promise.all([
          getMergedAnchorSuggestions('while', user.id),
          getMergedAnchorSuggestions('before', user.id),
          getMergedAnchorSuggestions('after', user.id),
        ]);
        setMergedAnchorSuggestions({
          while: whileMerged,
          before: beforeMerged,
          after: afterMerged,
        });
      } catch (error) {
        console.error('Error loading merged anchor suggestions:', error);
      }
    };

    loadMergedSuggestions();
  }, [user?.id]);

  // Initialize form when modal opens
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description);
      setComplexity(initialData.complexity);
      setAnchors(initialData.anchors || []);
      setSelectedBarrierSlug(initialData.barrier?.barrierTypeSlug || '');
      setBarrierCustom(initialData.barrier?.custom || '');
      setShowBarriers(Boolean(initialData.barrier?.barrierTypeSlug || initialData.barrier?.custom));
      setShowAnchors(Boolean(initialData.anchors && initialData.anchors.length > 0));
    } else {
      setDescription('');
      setComplexity('medium');
      setAnchors([]);
      setSelectedBarrierSlug('');
      setBarrierCustom('');
      setShowBarriers(false);
      setShowAnchors(false);
    }
    setError('');
    setAddingAnchor(false);
    setNewAnchorType(null);
    setNewAnchorValue('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setError('Please enter a task description');
      return;
    }

    // Find the barrier type ID from slug
    const selectedBarrier = barrierTypes.find(b => b.slug === selectedBarrierSlug);

    onSave({
      id: initialData?.id,
      description: trimmedDescription,
      complexity,
      taskType,
      anchors: anchors.length > 0 ? anchors : undefined,
      barrier: (selectedBarrierSlug || barrierCustom.trim()) ? {
        barrierTypeSlug: selectedBarrierSlug || undefined,
        barrierTypeId: selectedBarrier?.id || null,
        custom: barrierCustom.trim(),
      } : undefined,
    });

    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target instanceof HTMLTextAreaElement) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleAddAnchor = () => {
    if (newAnchorType && newAnchorValue.trim()) {
      setAnchors([...anchors, { type: newAnchorType, value: newAnchorValue.trim() }]);
      setAddingAnchor(false);
      setNewAnchorType(null);
      setNewAnchorValue('');
    }
  };

  const handleRemoveAnchor = (index: number) => {
    setAnchors(anchors.filter((_, i) => i !== index));
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
          <div className="space-y-5 p-6">
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

            {/* Barriers Section (only for focus tasks) */}
            {isFocusTask && (
              <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
                <button
                  type="button"
                  onClick={() => setShowBarriers(!showBarriers)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {selectedBarrierSlug || barrierCustom.trim()
                        ? `Barrier: ${barrierTypes.find(b => b.slug === selectedBarrierSlug)?.label || barrierCustom}`
                        : "What feels hard? (optional)"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Identify barriers to get targeted support
                    </p>
                  </div>
                  {showBarriers ? (
                    <ChevronUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  )}
                </button>

                {showBarriers && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/50 dark:border-amber-700/30">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Pick a barrier
                      </label>
                      <select
                        value={selectedBarrierSlug}
                        onChange={(e) => setSelectedBarrierSlug(e.target.value)}
                        className="mt-1.5 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-amber-700/50 dark:bg-slate-700 dark:text-slate-100"
                      >
                        <option value="">Choose one...</option>
                        {barrierTypes.map((barrier) => (
                          <option key={barrier.id} value={barrier.slug}>
                            {barrier.icon ? `${barrier.icon} ` : ""}{barrier.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                        Or describe what's in the way
                      </label>
                      <textarea
                        rows={2}
                        value={barrierCustom}
                        onChange={(e) => setBarrierCustom(e.target.value)}
                        placeholder="Overwhelmed, low energy, waiting on a reply..."
                        className="mt-1.5 w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-amber-700/50 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Anchors Section (optional) */}
            <div className="space-y-3 rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4 dark:border-cyan-800/40 dark:bg-cyan-900/20">
              <button
                type="button"
                onClick={() => setShowAnchors(!showAnchors)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {anchors.length > 0
                      ? `Anchors: ${anchors.map(a => anchorLabel(a.type, a.value)).join(', ')}`
                      : "Link to time or rhythm? (optional)"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    at, while, before, after
                  </p>
                </div>
                {showAnchors ? (
                  <ChevronUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                )}
              </button>

              {showAnchors && (
                <div className="space-y-3 pt-2 border-t border-cyan-200/50 dark:border-cyan-700/30">
                  {/* Display existing anchors */}
                  {anchors.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {anchors.map((anchor, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 rounded-full bg-cyan-600 px-3 py-1.5 text-sm font-semibold text-white dark:bg-cyan-500"
                        >
                          <span>{anchorLabel(anchor.type, anchor.value)}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAnchor(index)}
                            className="rounded-full hover:bg-cyan-700 dark:hover:bg-cyan-600 p-0.5"
                            aria-label="Remove anchor"
                          >
                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new anchor */}
                  {!addingAnchor ? (
                    <button
                      type="button"
                      onClick={() => setAddingAnchor(true)}
                      className="w-full rounded-lg border border-dashed border-cyan-300 bg-white/50 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-white dark:border-cyan-600/50 dark:bg-slate-800/40 dark:text-cyan-400 dark:hover:bg-slate-800/60"
                    >
                      + Add {anchors.length > 0 ? "Another" : "an"} Anchor
                    </button>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-cyan-300 bg-white p-3 dark:border-cyan-700/50 dark:bg-slate-800/60">
                      <div className="flex flex-wrap gap-2 text-sm">
                        {anchorOptions.map(({ type, label }) => {
                          const active = newAnchorType === type;
                          return (
                            <button
                              type="button"
                              key={type}
                              onClick={() => {
                                setNewAnchorType(type);
                                setNewAnchorValue(type === "at" ? new Date().toTimeString().slice(0, 5) : "");
                              }}
                              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                                active
                                  ? "bg-cyan-600 text-white shadow dark:bg-cyan-500"
                                  : "bg-slate-100 text-slate-600 hover:bg-cyan-100 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>

                      {newAnchorType === "at" && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Pick a time
                          </label>
                          <input
                            type="time"
                            value={newAnchorValue}
                            onChange={(e) => setNewAnchorValue(e.target.value)}
                            className="w-full rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-cyan-600/50 dark:bg-slate-700 dark:text-slate-100"
                          />
                        </div>
                      )}

                      {newAnchorType && newAnchorType !== "at" && (
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {anchorTextLabels[newAnchorType as Exclude<TaskAnchorType, "at">]}
                          </label>
                          <input
                            type="text"
                            value={newAnchorValue}
                            onChange={(e) => setNewAnchorValue(cleanAnchorInput(newAnchorType, e.target.value))}
                            placeholder={anchorPlaceholders[newAnchorType as Exclude<TaskAnchorType, "at">]}
                            className="w-full rounded-lg border border-cyan-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-cyan-600/50 dark:bg-slate-700 dark:text-slate-100"
                          />
                          {newAnchorType && mergedAnchorSuggestions[newAnchorType as Exclude<TaskAnchorType, "at">] && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {(mergedAnchorSuggestions[newAnchorType as Exclude<TaskAnchorType, "at">] || []).slice(0, 4).map((suggestion) => (
                                <button
                                  type="button"
                                  key={suggestion}
                                  onClick={() => setNewAnchorValue(suggestion)}
                                  className="rounded-full border border-cyan-300 bg-white px-2 py-1 text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-cyan-700/50 dark:bg-slate-700 dark:text-slate-200"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleAddAnchor}
                          disabled={!newAnchorType || !newAnchorValue}
                          className="flex-1 rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-cyan-500 dark:hover:bg-cyan-600"
                        >
                          Add Anchor
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingAnchor(false);
                            setNewAnchorType(null);
                            setNewAnchorValue('');
                          }}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Clear all anchors */}
                  {anchors.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAnchors([])}
                      className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                      Clear all anchors
                    </button>
                  )}
                </div>
              )}
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
