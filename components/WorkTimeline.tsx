'use client';

import { useMemo } from 'react';
import { ChevronDown, Clock, Target, CheckSquare, Moon } from 'lucide-react';
import type { WorkWindow } from '@/lib/capacity';
import { getSleepNotification } from '@/lib/sleep-notifications';

export interface WorkBlock {
  start: string; // "08:00"
  end: string;   // "18:00"
  window: WorkWindow;
  label?: string;
}

interface WorkTimelineProps {
  workBlocks: WorkBlock[];
  currentTime: Date;
  completedTasks: number;
  totalCapacity: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  wakeTime?: string; // For sleep notification integration
  focusLevel?: string; // e.g., "focused", "scattered", "foggy"
}

const WINDOW_CONFIG: Record<WorkWindow, {
  color: string;
  bgGradient: string;
  borderColor: string;
  label: string;
  Icon: typeof Target;
}> = {
  deep: {
    color: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    bgGradient: 'bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40',
    borderColor: 'border-blue-300 dark:border-blue-700',
    label: 'Deep Work',
    Icon: Target,
  },
  light: {
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    bgGradient: 'bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
    label: 'Light Tasks',
    Icon: CheckSquare,
  },
  rest: {
    color: 'bg-gradient-to-br from-purple-500 to-pink-600',
    bgGradient: 'bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40',
    borderColor: 'border-purple-300 dark:border-purple-700',
    label: 'Rest',
    Icon: Moon,
  },
};

function parseHM(value?: string | null, fallback: string = '00:00'): number {
  const safe = value && value.includes(':') ? value : fallback;
  const [h, m] = safe.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return h * 60 + m;
}

function formatHMLabel(value: string): string {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return value;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function minutesDiff(start: number, end: number): number {
  return end >= start ? end - start : end + 24 * 60 - start;
}

function toPercent(pos: number, total: number) {
  return total === 0 ? 0 : Math.max(0, Math.min(100, (pos / total) * 100));
}

function formatRemaining(minutes?: number | null, isPast = false) {
  if (minutes == null) return '';
  if (isPast) return 'Window ended';
  if (minutes <= 0) return 'Now';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} ${h === 1 ? 'hr' : 'hrs'}` : `${h}h ${m}m`;
  }
  return `${Math.max(minutes, 1)} min`;
}

// Map focus levels to friendly labels
const FOCUS_LABELS: Record<string, string> = {
  focused: 'Clear Skies',
  scattered: 'Choppy Waters',
  foggy: 'Navigating Fog',
};

export function WorkTimeline({
  workBlocks,
  currentTime,
  completedTasks,
  totalCapacity,
  collapsed,
  onToggleCollapsed,
  wakeTime = '06:00',
  focusLevel,
}: WorkTimelineProps) {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentHour = currentTime.getHours();

  // Get sleep notification (only show in evening)
  const sleepNotification = currentHour >= 18 ? getSleepNotification(wakeTime) : null;

  // Get friendly focus label
  const focusLabel = focusLevel ? FOCUS_LABELS[focusLevel] || focusLevel : null;

  // Calculate timeline metrics
  const timelineMetrics = useMemo(() => {
    if (workBlocks.length === 0) return null;

    const sortedBlocks = [...workBlocks].sort((a, b) =>
      parseHM(a.start) - parseHM(b.start)
    );

    // Find current window and time until next
    let currentWindow: WorkWindow | null = null;
    let timeUntilNext = 0;
    let nextWindowLabel = '';

    for (let i = 0; i < sortedBlocks.length; i++) {
      const block = sortedBlocks[i];
      const startMin = parseHM(block.start);
      const endMin = parseHM(block.end);

      if (currentMinutes >= startMin && currentMinutes < endMin) {
        currentWindow = block.window;
        // Time until this window ends
        timeUntilNext = endMin - currentMinutes;
        if (i < sortedBlocks.length - 1) {
          nextWindowLabel = WINDOW_CONFIG[sortedBlocks[i + 1].window].label;
        }
        break;
      } else if (currentMinutes < startMin) {
        // Next window hasn't started yet
        timeUntilNext = startMin - currentMinutes;
        nextWindowLabel = WINDOW_CONFIG[block.window].label;
        break;
      }
    }

    return {
      currentWindow,
      currentBlockLabel: currentWindow ? sortedBlocks.find(b => b.window === currentWindow && parseHM(b.start) <= currentMinutes && parseHM(b.end) > currentMinutes)?.label : null,
      timeUntilNext,
      nextWindowLabel,
      progressPercent: totalCapacity > 0 ? (completedTasks / totalCapacity) * 100 : 0,
    };
  }, [workBlocks, currentMinutes, completedTasks, totalCapacity]);

  if (collapsed) {
    // Collapsed view - show current status + focus level + sleep time if evening
    return (
      <button
        onClick={onToggleCollapsed}
        className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-3 shadow-sm border border-slate-200/60 dark:border-slate-700 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-400" />
            <div className="flex flex-col items-start">
              {/* Focus level on top */}
              {focusLabel && (
                <span className="text-xs font-medium text-sky-600 dark:text-cyan-400">
                  {focusLabel}
                </span>
              )}
              {/* Timeline info */}
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                {timelineMetrics?.currentWindow
                  ? `${timelineMetrics.currentBlockLabel || WINDOW_CONFIG[timelineMetrics.currentWindow].label} • ${formatRemaining(timelineMetrics.timeUntilNext)} left`
                  : 'Timeline'
                }
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Show bedtime hint in collapsed view during evening */}
            {sleepNotification && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Bed {formatHMLabel(sleepNotification.bedtime)}
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Your Day
        </h3>
        <button
          onClick={onToggleCollapsed}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Current Status */}
      {timelineMetrics?.currentWindow && (() => {
        const config = WINDOW_CONFIG[timelineMetrics.currentWindow];
        const IconComponent = config.Icon;

        return (
          <div className={`mb-6 p-5 ${config.bgGradient} rounded-2xl border-2 ${config.borderColor} shadow-lg`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center shadow-md`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100">
                  {timelineMetrics.currentBlockLabel || config.label}
                </h4>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {formatRemaining(timelineMetrics.timeUntilNext)} remaining
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Timeline Visualization */}
      <div className="relative">
        {/* Enhanced timeline bar with segments */}
        <div className="relative h-3 bg-slate-200 dark:bg-slate-700 rounded-full mb-6 overflow-hidden">
          {workBlocks.map((block, index) => {
            const config = WINDOW_CONFIG[block.window];
            const startMin = parseHM(block.start);
            const endMin = parseHM(block.end);
            const totalDayMinutes = 24 * 60;
            const blockWidth = ((endMin - startMin) / totalDayMinutes) * 100;
            const blockLeft = (startMin / totalDayMinutes) * 100;
            const isPast = currentMinutes > endMin;
            const isCurrent = currentMinutes >= startMin && currentMinutes < endMin;

            return (
              <div
                key={index}
                className={`absolute top-0 h-full ${config.color} transition-all duration-300 ${isCurrent ? 'ring-2 ring-white dark:ring-slate-900 ring-offset-2' : ''} ${isPast ? 'opacity-40' : 'opacity-100'}`}
                style={{
                  left: `${blockLeft}%`,
                  width: `${blockWidth}%`,
                }}
              />
            );
          })}
          {/* Current time indicator */}
          <div
            className="absolute top-0 w-1 h-full bg-white shadow-lg z-10"
            style={{
              left: `${(currentMinutes / (24 * 60)) * 100}%`,
            }}
          />
        </div>

        {/* Time labels and icons */}
        <div className="flex items-start justify-between px-2">
          {workBlocks.map((block, index) => {
            const config = WINDOW_CONFIG[block.window];
            const startTime = formatHMLabel(block.start);
            const endTime = formatHMLabel(block.end);
            const IconComponent = config.Icon;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center mb-2 ring-2 ring-white dark:ring-slate-900 shadow-lg z-10`}>
                  <IconComponent className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 text-center mb-1">
                  {block.label || config.label}
                </span>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {startTime}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sleep reminder - integrated, subtle */}
      {sleepNotification && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Moon className="w-4 h-4" />
            <span>Aim for bed by <span className="font-medium text-slate-700 dark:text-slate-300">{formatHMLabel(sleepNotification.bedtime)}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
