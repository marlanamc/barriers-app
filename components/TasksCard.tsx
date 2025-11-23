'use client';

import { useState, type KeyboardEvent, useRef } from 'react';
import { Target, Heart, X, Tag, Trash2, Calendar, ChevronLeft, HelpCircle } from 'lucide-react';
import type { TaskComplexity } from '@/lib/capacity';
import { getCategoryEmoji } from '@/lib/categories';
import { buildMultipleAnchorsPhrase } from '@/lib/anchors';
import type { BarrierType } from '@/lib/barriers';
import { BARRIERS } from '@/lib/barriers';

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
  onRescheduleFocusTask: (taskId: string) => void;
  onAddBarrier: (taskId: string) => void;
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

function getBarrierLabel(barrierType: string): string {
  const barrier = BARRIERS[barrierType as BarrierType];
  return barrier?.label || barrierType;
}

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
  onAddBarrier: () => void;
}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX.current - startX.current;
    const diffY = currentY - startY.current;
    const absDiffX = Math.abs(diffX);
    const absDiffY = Math.abs(diffY);

    // Determine if this is a horizontal swipe
    if (!isSwiping && absDiffX > 10) {
      if (absDiffX > absDiffY) {
        // More horizontal than vertical - it's a swipe
        setIsSwiping(true);
      }
    }

    // Only allow left swipe (negative offset)
    if (isSwiping && diffX < 0) {
      e.preventDefault();
      setSwipeOffset(Math.max(diffX, -140)); // Max swipe distance
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
      <div
        className="absolute right-0 top-0 bottom-0 flex items-center gap-2 pr-3 z-0"
        aria-hidden={swipeOffset === 0}
      >
        <button
          type="button"
          tabIndex={swipeOffset === 0 ? -1 : 0}
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
          tabIndex={swipeOffset === 0 ? -1 : 0}
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
          touchAction: 'pan-y',
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
          className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 ${task.completed
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
            <p className={`text-sm font-medium leading-relaxed ${task.completed
              ? 'text-slate-500 line-through dark:text-slate-400'
              : 'text-slate-900 dark:text-slate-100'
              }`}>
              {task.description}
            </p>

            {/* Anchors inline with title */}
            {task.anchors && task.anchors.length > 0 && (
              <span className="text-sm font-medium text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                {buildMultipleAnchorsPhrase(task.anchors)}
              </span>
            )}
          </div>

          {/* Show categories, complexity, and barriers */}
          {(task.categories?.length || task.barrier) && (
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
                  {task.barrier.custom || getBarrierLabel(task.barrier.type)}
                </span>
              )}
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
  onAddFocusTask,
  onToggleFocusTask,
  onFocusTaskClick,
  onDeleteFocusTask,
  onRescheduleFocusTask,
  onAddBarrier,
  onAddLifeTask,
  onToggleLifeTask,
  onDeleteLifeTask,
}: TasksCardProps) {
  const activeFocusTasks = focusTasks.filter((task) => !task.completed);
  const completedFocusTasks = focusTasks.filter((task) => task.completed);

  const handleRescheduleFocusTask = (taskId: string) => {
    onRescheduleFocusTask(taskId);
  };

  return (
    <section className="space-y-6">
      {/* Focus Tasks Section */}
      <div>
        {/* Only show label when there are tasks */}
        {activeFocusTasks.length > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Compass
            </h3>
          </div>
        )}

        {activeFocusTasks.length > 0 && (
          <div className="space-y-3">
            {activeFocusTasks.map((task) => (
              <SwipeableFocusTask
                key={task.id}
                task={task}
                onToggle={() => onToggleFocusTask(task.id)}
                onClick={() => onFocusTaskClick(task.id)}
                onDelete={() => onDeleteFocusTask(task.id)}
                onReschedule={() => handleRescheduleFocusTask(task.id)}
                onAddBarrier={() => onAddBarrier(task.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Maintenance Tasks Section - only show if there are tasks */}
      {lifeTasks.length > 0 && (
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Heart className="h-4 w-4 text-amber-500" />
            <h3 className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Drift Prevention
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {lifeTasks.map((task) => (
              <div
                key={task.id}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${task.completed
                  ? 'border-transparent bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleLifeTask(task.id)}
                  className="flex items-center gap-2"
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${task.completed
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800'
                    }`}>
                    {task.completed && <span className="text-xs">✓</span>}
                  </span>
                  <span className={task.completed ? 'line-through opacity-70' : ''}>
                    {task.description}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteLifeTask(task.id)}
                  className="ml-1 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-700"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Focus Tasks (Collapsed/Bottom) */}
      {completedFocusTasks.length > 0 && (
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="mb-3 text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Completed ({completedFocusTasks.length})
          </p>
          <div className="space-y-2 opacity-50 hover:opacity-80 transition-opacity">
            {completedFocusTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3">
                <button
                  onClick={() => onToggleFocusTask(task.id)}
                  className="flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500 bg-emerald-500 text-white text-xs"
                >
                  ✓
                </button>
                <span className="text-sm text-slate-400 line-through dark:text-slate-500">
                  {task.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
