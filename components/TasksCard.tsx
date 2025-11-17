'use client';

import { useState, type KeyboardEvent, useRef } from 'react';
import { Target, Heart, X, Tag, Trash2, Calendar, ChevronLeft } from 'lucide-react';
import type { TaskComplexity } from '@/lib/capacity';
import { getCategoryEmoji } from '@/lib/categories';
import { anchorLabel } from '@/lib/anchors';

interface TaskAnchor {
  type: 'at' | 'while' | 'before' | 'after';
  value: string;
}

interface FocusTask {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
  anchors?: TaskAnchor[];
  categories?: string[];
  barrier?: {
    type: string;
    icon?: string;
    custom?: string;
  };
}

interface LifeTask {
  id: string;
  description: string;
  completed: boolean;
  anchorTime?: string;
}

interface TasksCardProps {
  focusTasks: FocusTask[];
  lifeTasks: LifeTask[];
  canAddMoreFocus: boolean;
  focusCapacityTarget?: number;
  onAddFocusTask: () => void;
  onToggleFocusTask: (taskId: string) => void;
  onFocusTaskClick: (taskId: string) => void;
  onDeleteFocusTask: (taskId: string) => void;
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

function SwipeableFocusTask({
  task,
  onToggle,
  onClick,
  onDelete,
  onReschedule
}: {
  task: FocusTask;
  onToggle: () => void;
  onClick: () => void;
  onDelete: () => void;
  onReschedule: () => void;
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Only allow left swipe (negative offset)
    if (diff < 0) {
      setSwipeOffset(Math.max(diff, -140)); // Max swipe distance
    }
  };

  const handleTouchEnd = () => {
    setIsSwiping(false);

    // Snap to position
    if (swipeOffset < -40) {
      setSwipeOffset(-140); // Show actions
    } else {
      setSwipeOffset(0); // Hide actions
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // If swiped open, close it on first click
    if (swipeOffset !== 0) {
      e.preventDefault();
      e.stopPropagation();
      setSwipeOffset(0);
      return;
    }
    // Otherwise, proceed with normal click
    onClick();
  };

  const handleKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div className="relative">
      {/* Action buttons (behind the card, revealed on swipe) */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3 z-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onReschedule();
            setSwipeOffset(0);
          }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg transition hover:bg-blue-600"
          aria-label="Reschedule task"
        >
          <Calendar className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            setSwipeOffset(0);
          }}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500 text-white shadow-lg transition hover:bg-red-600"
          aria-label="Delete task"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      {/* Task card */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKey}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
        }}
        className="relative z-10 group flex items-center gap-3.5 rounded-2xl border border-transparent bg-white px-4 py-3.5 text-left shadow-[0_8px_20px_rgba(173,191,255,0.15)] ring-1 ring-[#e3e0ff] transition hover:shadow-[0_12px_28px_rgba(153,178,255,0.25)] hover:ring-[#c7d6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-cyan-400/50"
        aria-label={`Edit focus task: ${task.description}`}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle();
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

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-medium leading-relaxed ${
              task.completed
                ? 'text-slate-500 line-through dark:text-slate-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}>
              {task.description}
            </p>

            {/* Time anchors inline with title */}
            {task.anchors?.filter(a => a.type === 'at').map((anchor, idx) => (
              <span
                key={idx}
                className="text-sm font-medium text-cyan-600 dark:text-cyan-400 whitespace-nowrap"
              >
                {anchorLabel(anchor.type, anchor.value)}
              </span>
            ))}
          </div>

          {/* Show non-time anchors, categories, and barriers */}
          {(task.anchors?.filter(a => a.type !== 'at').length || task.categories?.length || task.barrier) && (
            <div className="mt-2 flex flex-wrap gap-2">
              {/* Categories */}
              {task.categories?.map((category) => (
                <span
                  key={category}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-800"
                >
                  {getCategoryEmoji(category)} {category}
                </span>
              ))}

              {/* Complexity */}
              <span
                className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:ring-purple-800"
              >
                {COMPLEXITY_LABEL[task.complexity]}
              </span>

              {/* Barrier */}
              {task.barrier && (task.barrier.custom || task.barrier.type) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-800">
                  {task.barrier.icon && <span>{task.barrier.icon}</span>}
                  {task.barrier.custom || task.barrier.type}
                </span>
              )}

              {/* Non-time anchors (while, before, after) */}
              {task.anchors?.filter(a => a.type !== 'at').map((anchor, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 ring-1 ring-cyan-200 dark:bg-cyan-900/40 dark:text-cyan-300 dark:ring-cyan-800"
                >
                  {anchorLabel(anchor.type, anchor.value)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Swipe indicator - subtle hint */}
        <div className="flex-shrink-0 flex items-center opacity-30 group-hover:opacity-50 transition-opacity">
          <ChevronLeft className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <ChevronLeft className="h-4 w-4 text-slate-400 dark:text-slate-500 -ml-2" />
        </div>
      </div>
    </div>
  );
}

export function TasksCard({
  focusTasks,
  lifeTasks,
  canAddMoreFocus,
  focusCapacityTarget,
  onAddFocusTask: _onAddFocusTask,
  onToggleFocusTask,
  onFocusTaskClick,
  onDeleteFocusTask,
  onAddLifeTask: _onAddLifeTask,
  onToggleLifeTask,
  onDeleteLifeTask,
}: TasksCardProps) {
  const activeFocusTasks = focusTasks.filter((task) => !task.completed);
  const completedFocusTasks = focusTasks.filter((task) => task.completed);

  const handleRescheduleFocusTask = (taskId: string) => {
    // TODO: Implement reschedule modal
    console.log('Reschedule task:', taskId);
  };

  return (
    <section className="space-y-4">
      {/* Focus Section */}
      <div className="rounded-3xl bg-gradient-to-br from-cyan-100/80 via-blue-100/70 to-cyan-50/60 p-6 shadow-[0_20px_45px_rgba(6,182,212,0.25)] ring-2 ring-cyan-300/60 backdrop-blur-sm dark:from-cyan-900/40 dark:via-blue-900/30 dark:to-cyan-900/20 dark:ring-cyan-700/60">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
            <Target className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-lg font-bold">Focus</h2>
            <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200">
              {activeFocusTasks.length}/{Math.max(focusCapacityTarget ?? activeFocusTasks.length || 1, 1)}
            </span>
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
              <SwipeableFocusTask
                key={task.id}
                task={task}
                onToggle={() => onToggleFocusTask(task.id)}
                onClick={() => onFocusTaskClick(task.id)}
                onDelete={() => onDeleteFocusTask(task.id)}
                onReschedule={() => handleRescheduleFocusTask(task.id)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#dbe9ff] bg-[#f6fbff] px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            <p className="font-medium text-slate-700 dark:text-slate-200">Start with one meaningful task.</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use Add Item to drop tasks here.</p>
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

      {/* Maintenance Section */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-50/50 via-orange-50/40 to-amber-50/30 p-4 shadow-[0_8px_20px_rgba(245,158,11,0.12)] ring-1 ring-amber-200/40 backdrop-blur-sm dark:from-amber-900/20 dark:via-orange-900/15 dark:to-amber-900/10 dark:ring-amber-800/40">
        <div className="mb-3 flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Heart className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-base font-semibold">Maintenance</h2>
        </div>

        <div className="flex flex-wrap gap-2">
          {lifeTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                task.completed
                  ? 'border-transparent bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 shadow-[0_5px_15px_rgba(245,158,11,0.25)] dark:border-amber-800 dark:bg-none dark:bg-amber-900/30 dark:text-amber-200'
                  : 'border-amber-200 bg-white/80 text-slate-600 hover:border-amber-300 dark:border-amber-800/50 dark:bg-slate-900/40 dark:text-slate-200 dark:hover:border-amber-700'
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
                <span className="truncate">
                  {task.description}
                  {task.anchorTime && (() => {
                    // Parse time from anchorTime format: "on YYYY-MM-DD at HH:MM" or "on YYYY-MM-DD"
                    const timeMatch = task.anchorTime.match(/at\s+(\d{2}:\d{2})/);
                    if (timeMatch) {
                      const timeStr = timeMatch[1];
                      const [hours, minutes] = timeStr.split(':');
                      const hour = parseInt(hours, 10);
                      const ampm = hour >= 12 ? 'PM' : 'AM';
                      const displayHour = hour % 12 || 12;
                      const formattedTime = `${displayHour}:${minutes} ${ampm}`;
                      return (
                        <span className="ml-1.5 text-amber-600 dark:text-amber-400">
                          {formattedTime}
                        </span>
                      );
                    }
                    return null;
                  })()}
                </span>
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
            Use Add Item to add maintenance tasks.
          </p>
        )}
      </div>
    </section>
  );
}
