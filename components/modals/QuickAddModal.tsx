'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Heart, Target, Tag, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { parseTaskInput, suggestComplexity } from '@/lib/natural-language';
import { TaskType, TaskComplexity } from '@/lib/capacity';
import { getTodayLocalDateString } from '@/lib/date-utils';
import { getCategoryOptions, getCategoryEmoji, type CategoryOption } from '@/lib/categories';
import { getBarrierTypes, type BarrierType } from '@/lib/supabase';
import { type TaskAnchorType, type TaskAnchor } from '@/lib/checkin-context';
import { cleanAnchorInput, anchorLabel, getMergedAnchorSuggestions, defaultAnchorSuggestionMap } from '@/lib/anchors';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

interface QuickAddModalProps {
  isOpen: boolean;
  defaultType?: TaskType;
  defaultInbox?: boolean;
  onClose: () => void;
  onSave: (task: {
    description: string;
    complexity?: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
    anchors?: TaskAnchor[];
    categories?: string[];
    barrier?: {
      barrierTypeSlug?: string;
      barrierTypeId?: string | null;
      custom?: string;
    };
    inInbox?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    focusDate?: string;
  }) => void;
}

const COMPLEXITY_OPTIONS: Array<{
  value: TaskComplexity;
  label: string;
  description: string;
  points: string;
}> = [
  { value: 'quick', label: 'Quick', description: '15-30 min', points: '0.5 pts' },
  { value: 'medium', label: 'Medium', description: '30-60 min', points: '1.0 pts' },
  { value: 'deep', label: 'Deep', description: '1-2 hours', points: '1.5 pts' },
];

const anchorOptions: Array<{ type: TaskAnchorType; label: string }> = [
  { type: "at", label: "At…" },
  { type: "while", label: "While…" },
  { type: "before", label: "Before…" },
  { type: "after", label: "After…" },
];

const anchorPlaceholders: Record<Exclude<TaskAnchorType, "at">, string> = {
  while: "listening to music...",
  before: "the kids wake up...",
  after: "dinner cleanup...",
};

export function QuickAddModal({ isOpen, defaultType = 'focus', defaultInbox = false, onClose, onSave }: QuickAddModalProps) {
  const { user } = useSupabaseUser();
  const [input, setInput] = useState('');
  const [taskType, setTaskType] = useState<TaskType>(defaultType);
  const [saveToInbox, setSaveToInbox] = useState(defaultInbox);
  const [scheduledDate, setScheduledDate] = useState(getTodayLocalDateString());
  const [focusDate, setFocusDate] = useState(getTodayLocalDateString());
  const [scheduledTime, setScheduledTime] = useState('');
  const [complexity, setComplexity] = useState<TaskComplexity>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  // Categories/Tags state
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(false);

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

  // Load category options
  useEffect(() => {
    if (user?.id) {
      getCategoryOptions(user.id).then(setCategoryOptions);
    }
  }, [user?.id]);

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

  useEffect(() => {
    if (isOpen) {
      setInput('');
      setTaskType(defaultType);
      setSaveToInbox(defaultInbox);
      setScheduledDate(getTodayLocalDateString());
      setFocusDate(getTodayLocalDateString());
      setScheduledTime('');
      setComplexity('medium');
      setSelectedCategories([]);
      setSelectedBarrierSlug('');
      setBarrierCustom('');
      setAnchors([]);
      setShowCategories(false);
      setShowBarriers(false);
      setShowAnchors(false);
      setAddingAnchor(false);
      setNewAnchorType(null);
      setNewAnchorValue('');
      // Focus input after modal renders
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, defaultType, defaultInbox]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!input.trim()) return;

    const parsed = parseTaskInput(input);
    const selectedBarrier = barrierTypes.find(b => b.slug === selectedBarrierSlug);

    if (taskType === 'life') {
      onSave({
        description: parsed.description,
        taskType,
        scheduledDate: saveToInbox ? undefined : scheduledDate,
        scheduledTime: saveToInbox ? undefined : (scheduledTime || undefined),
        inInbox: saveToInbox,
      });
    } else {
      // For focus tasks, include all the options
      onSave({
        description: parsed.description,
        complexity,
        taskType,
        anchors: anchors.length > 0 ? anchors : undefined,
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        barrier: (selectedBarrierSlug || barrierCustom.trim()) ? {
          barrierTypeSlug: selectedBarrierSlug || undefined,
          barrierTypeId: selectedBarrier?.id || null,
          custom: barrierCustom.trim(),
        } : undefined,
        inInbox: saveToInbox,
        focusDate: saveToInbox ? undefined : focusDate,
      });
    }

    onClose();
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

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
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
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-12">
        <div
          className="relative w-full max-w-md max-h-[85vh] rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700 flex-shrink-0">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Add Item
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
          <div className="space-y-4 p-6 overflow-y-auto flex-1">
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
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Heart className="h-4 w-4" />
                Maintenance
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
                    ? 'e.g.,Write email to boss, Clean front closet'
                    : 'e.g., take morning meds, water plants'
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Categories/Tags Section (only for focus tasks) - Condensed */}
            {taskType === 'focus' && !saveToInbox && (
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/40">
                <button
                  type="button"
                  onClick={() => setShowCategories(!showCategories)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {selectedCategories.length > 0
                        ? `Tags: ${selectedCategories.map(c => getCategoryEmoji(c) + ' ' + c).join(', ')}`
                        : 'Tags (optional)'}
                    </span>
                  </div>
                  {showCategories ? (
                    <ChevronUp className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  )}
                </button>

                {showCategories && (
                  <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {categoryOptions.map((category) => {
                      const isSelected = selectedCategories.includes(category.label);
                      return (
                        <button
                          key={category.label}
                          type="button"
                          onClick={() => toggleCategory(category.label)}
                          className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-100 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-900/40 dark:text-cyan-200'
                              : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:border-slate-500'
                          }`}
                        >
                          {category.emoji && <span>{category.emoji}</span>}
                          <span>{category.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Complexity Picker (only for focus tasks) - Condensed */}
            {taskType === 'focus' && !saveToInbox && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    How long will this take?
                  </label>
                  <div className="group relative">
                    <HelpCircle className="h-4 w-4 text-slate-400 cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                        If unsure, over estimate instead of under
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {COMPLEXITY_OPTIONS.map((option) => {
                    const isSelected = complexity === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setComplexity(option.value)}
                        className={`rounded-lg border-2 p-2.5 text-center transition ${
                          isSelected
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/30'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                          {option.label}
                        </div>
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">
                          {option.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Barriers Section (only for focus tasks) - Condensed */}
            {taskType === 'focus' && !saveToInbox && (
              <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-800/40 dark:bg-amber-900/20">
                <button
                  type="button"
                  onClick={() => setShowBarriers(!showBarriers)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {selectedBarrierSlug || barrierCustom.trim()
                      ? `Barrier: ${barrierTypes.find(b => b.slug === selectedBarrierSlug)?.label || barrierCustom}`
                      : "Barrier (optional)"}
                  </span>
                  {showBarriers ? (
                    <ChevronUp className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  )}
                </button>

                {showBarriers && (
                  <div className="space-y-2 pt-2 border-t border-amber-200/50 dark:border-amber-700/30">
                    <select
                      value={selectedBarrierSlug}
                      onChange={(e) => setSelectedBarrierSlug(e.target.value)}
                      className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-amber-700/50 dark:bg-slate-700 dark:text-slate-100"
                    >
                      <option value="">Choose one...</option>
                      {barrierTypes.map((barrier) => (
                        <option key={barrier.id} value={barrier.slug}>
                          {barrier.icon ? `${barrier.icon} ` : ""}{barrier.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={barrierCustom}
                      onChange={(e) => setBarrierCustom(e.target.value)}
                      placeholder="Or describe what's in the way..."
                      className="w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-amber-700/50 dark:bg-slate-700 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Anchors Section (only for focus tasks) - Condensed */}
            {taskType === 'focus' && !saveToInbox && (
              <div className="space-y-2 rounded-xl border border-cyan-200 bg-cyan-50/50 p-3 dark:border-cyan-800/40 dark:bg-cyan-900/20">
                <button
                  type="button"
                  onClick={() => setShowAnchors(!showAnchors)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {anchors.length > 0
                      ? `Anchors: ${anchors.map(a => anchorLabel(a.type, a.value)).join(', ')}`
                      : "Time anchor (optional)"}
                  </span>
                  {showAnchors ? (
                    <ChevronUp className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                  )}
                </button>

                {showAnchors && (
                  <div className="space-y-2 pt-2 border-t border-cyan-200/50 dark:border-cyan-700/30">
                    {/* Display existing anchors */}
                    {anchors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {anchors.map((anchor, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1.5 rounded-full bg-cyan-600 px-2 py-1 text-xs font-semibold text-white dark:bg-cyan-500"
                          >
                            <span>{anchorLabel(anchor.type, anchor.value)}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveAnchor(index)}
                              className="rounded-full hover:bg-cyan-700 dark:hover:bg-cyan-600 p-0.5"
                              aria-label="Remove anchor"
                            >
                              <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        className="w-full rounded-lg border border-dashed border-cyan-300 bg-white/50 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 transition hover:bg-white dark:border-cyan-600/50 dark:bg-slate-800/40 dark:text-cyan-400 dark:hover:bg-slate-800/60"
                      >
                        + Add {anchors.length > 0 ? "Another" : "an"} Anchor
                      </button>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-cyan-300 bg-white p-2.5 dark:border-cyan-700/50 dark:bg-slate-800/60">
                        <div className="flex flex-wrap gap-1.5 text-xs">
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
                                className={`rounded-full px-2.5 py-1 font-semibold transition ${
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
                          <input
                            type="time"
                            value={newAnchorValue}
                            onChange={(e) => setNewAnchorValue(e.target.value)}
                            className="w-full rounded-lg border border-cyan-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-cyan-600/50 dark:bg-slate-700 dark:text-slate-100"
                          />
                        )}

                        {newAnchorType && newAnchorType !== "at" && (
                          <div className="space-y-1.5">
                            <input
                              type="text"
                              value={newAnchorValue}
                              onChange={(e) => setNewAnchorValue(cleanAnchorInput(newAnchorType, e.target.value))}
                              placeholder={anchorPlaceholders[newAnchorType as Exclude<TaskAnchorType, "at">]}
                              className="w-full rounded-lg border border-cyan-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-cyan-600/50 dark:bg-slate-700 dark:text-slate-100"
                            />
                            {newAnchorType && mergedAnchorSuggestions[newAnchorType as Exclude<TaskAnchorType, "at">] && (
                              <div className="flex flex-wrap gap-1.5 text-xs">
                                {(mergedAnchorSuggestions[newAnchorType as Exclude<TaskAnchorType, "at">] || []).slice(0, 4).map((suggestion) => (
                                  <button
                                    type="button"
                                    key={suggestion}
                                    onClick={() => setNewAnchorValue(suggestion)}
                                    className="rounded-full border border-cyan-300 bg-white px-2 py-0.5 text-slate-600 transition hover:border-cyan-400 hover:text-cyan-700 dark:border-cyan-700/50 dark:bg-slate-700 dark:text-slate-200"
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
                            className="flex-1 rounded-lg bg-cyan-600 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-cyan-500 dark:hover:bg-cyan-600"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingAnchor(false);
                              setNewAnchorType(null);
                              setNewAnchorValue('');
                            }}
                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Date input for Focus tasks */}
            {taskType === 'focus' && !saveToInbox && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Date
                </label>
                <input
                  type="date"
                  value={focusDate}
                  onChange={(e) => setFocusDate(e.target.value)}
                  min={getTodayLocalDateString()}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            )}

            {/* Save location toggle */}
            {taskType === 'focus' && (
              <div className="flex items-center gap-3">
                <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:bg-slate-700">
                  <input
                    type="checkbox"
                    checked={saveToInbox}
                    onChange={(e) => setSaveToInbox(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-cyan-600 focus:ring-2 focus:ring-cyan-500/20 checked:bg-cyan-600 checked:border-cyan-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Save to For Later
                  </span>
                </label>
              </div>
            )}

            {/* Date and Time inputs for Maintenance tasks */}
            {taskType === 'life' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={getTodayLocalDateString()}
                    disabled={saveToInbox}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Time (optional)
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    disabled={saveToInbox}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700">
                    <input
                      type="checkbox"
                      checked={saveToInbox}
                      onChange={(e) => setSaveToInbox(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 bg-slate-100 text-amber-600 focus:ring-2 focus:ring-amber-500/20 checked:bg-amber-600 checked:border-amber-600"
                    />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Save to For Later
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Smart preview */}
            {input.trim() && (
              <div className={`rounded-lg border p-3 ${
                taskType === 'focus'
                  ? 'border-cyan-200 bg-cyan-50/50 dark:border-cyan-800/40 dark:bg-cyan-900/20'
                  : 'border-amber-200 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-900/20'
              }`}>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {taskType === 'focus' 
                    ? `Will save ${saveToInbox ? 'to For Later' : 'to Today'}:`
                    : 'Will save:'
                  }
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {(() => {
                    const description = parseTaskInput(input).description;
                    const anchorText = anchors.length > 0 
                      ? anchors.map(a => anchorLabel(a.type, a.value)).join(', ')
                      : (parseTaskInput(input).anchorType && parseTaskInput(input).anchorValue
                        ? `${parseTaskInput(input).anchorType} ${parseTaskInput(input).anchorValue}`
                        : '');
                    
                    if (anchorText && taskType === 'focus' && !saveToInbox) {
                      return (
                        <>
                          {description}{' '}
                          <span className="text-cyan-600 dark:text-cyan-400">{anchorText}</span>
                        </>
                      );
                    }
                    return description;
                  })()}
                </p>
                {taskType === 'focus' && !saveToInbox && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedCategories.map((category) => (
                      <span
                        key={category}
                        className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:border-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300"
                      >
                        {getCategoryEmoji(category)} {category}
                      </span>
                    ))}
                    <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {complexity}
                    </span>
                    {(selectedBarrierSlug || barrierCustom.trim()) && (
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        {barrierTypes.find(b => b.slug === selectedBarrierSlug)?.label || barrierCustom}
                      </span>
                    )}
                  </div>
                )}
                {taskType === 'life' && (
                  <div className="mt-2 space-y-1">
                    {saveToInbox ? (
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Will be saved to For Later
                      </p>
                    ) : (
                      <>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Date: {(() => {
                            // Parse date string (YYYY-MM-DD) to avoid timezone issues
                            const [year, month, day] = scheduledDate.split('-').map(Number);
                            const date = new Date(year, month - 1, day);
                            return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                          })()}
                        </p>
                        {scheduledTime && (
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Time: {new Date(`2000-01-01T${scheduledTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-200 p-6 dark:border-slate-700 flex-shrink-0">
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
