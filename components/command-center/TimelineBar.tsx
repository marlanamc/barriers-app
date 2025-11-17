'use client';

import type { EnergyLevel } from '@/lib/capacity';

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  sparky: 'Sparky',
  steady: 'Steady',
  flowing: 'Flowing',
  foggy: 'Foggy',
  resting: 'Resting',
};

const ENERGY_BADGE_STYLES: Record<
  EnergyLevel,
  { bg: string; text: string; ring: string; icon: string }
> = {
  sparky: {
    bg: 'from-amber-50/90 to-yellow-100/90 dark:from-amber-900/30 dark:to-yellow-900/20',
    text: 'text-amber-900 dark:text-amber-100',
    ring: 'ring-amber-100 dark:ring-amber-800/60',
    icon: 'text-amber-600 dark:text-amber-300',
  },
  steady: {
    bg: 'from-orange-50/90 to-orange-100/90 dark:from-orange-900/30 dark:to-orange-900/20',
    text: 'text-orange-900 dark:text-orange-100',
    ring: 'ring-orange-100 dark:ring-orange-800/60',
    icon: 'text-orange-500 dark:text-orange-300',
  },
  flowing: {
    bg: 'from-sky-50/90 to-cyan-100/90 dark:from-sky-900/30 dark:to-cyan-900/20',
    text: 'text-sky-900 dark:text-cyan-100',
    ring: 'ring-sky-100 dark:ring-cyan-900/50',
    icon: 'text-sky-500 dark:text-cyan-300',
  },
  foggy: {
    bg: 'from-slate-50/95 to-slate-200/90 dark:from-slate-900/40 dark:to-slate-800/30',
    text: 'text-slate-900 dark:text-slate-100',
    ring: 'ring-slate-200 dark:ring-slate-700',
    icon: 'text-slate-600 dark:text-slate-200',
  },
  resting: {
    bg: 'from-indigo-50/90 to-violet-100/90 dark:from-indigo-900/30 dark:to-violet-900/20',
    text: 'text-indigo-900 dark:text-indigo-100',
    ring: 'ring-indigo-100 dark:ring-indigo-800/60',
    icon: 'text-indigo-600 dark:text-indigo-300',
  },
};

const TIME_BADGE_STYLE = {
  bg: 'from-[#fdefff] via-[#f7e7ff] to-[#f2e5ff] dark:from-violet-900/50 dark:via-purple-900/40 dark:to-fuchsia-900/40',
  text: 'text-purple-900 dark:text-violet-100',
  ring: 'ring-[#f3d8ff] dark:ring-violet-800/60',
  icon: 'text-[#b05cd6] dark:text-violet-300',
};

interface TimelineBarProps {
  workStart?: string;
  hardStop?: string;
  fullStop?: string;
  currentTime: Date;
  energyLevel?: EnergyLevel | null;
  timeInfo?: {
    totalMinutes: number;
    isPastStop: boolean;
  } | null;
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function getTimePosition(currentMinutes: number, startMinutes: number, endMinutes: number): number {
  const range = endMinutes - startMinutes;
  const position = ((currentMinutes - startMinutes) / range) * 100;
  return Math.max(0, Math.min(100, position));
}

function formatTimeLeft(timeInfo?: TimelineBarProps['timeInfo']) {
  if (!timeInfo) {
    return 'Set hard stop';
  }
  if (timeInfo.isPastStop) {
    return 'Past stop';
  }
  if (timeInfo.totalMinutes >= 60) {
    const hours = Math.floor(timeInfo.totalMinutes / 60);
    const minutes = timeInfo.totalMinutes % 60;
    if (minutes === 0) {
      return `${hours} ${hours === 1 ? 'hr' : 'hrs'} left`;
    }
    return `${hours}h ${minutes}m left`;
  }
  const minutes = Math.max(timeInfo.totalMinutes, 1);
  return `${minutes} min left`;
}

export function TimelineBar({
  workStart = '08:00',
  hardStop = '18:00',
  fullStop = '22:30',
  currentTime,
  energyLevel,
  timeInfo,
}: TimelineBarProps) {
  const now = currentTime.getHours() * 60 + currentTime.getMinutes();
  const startMinutes = parseTime(workStart);
  const hardStopMinutes = parseTime(hardStop);
  const fullStopMinutes = parseTime(fullStop);

  // Calculate position (0-100%)
  const totalRange = fullStopMinutes - startMinutes;
  const position = getTimePosition(now, startMinutes, fullStopMinutes);

  // Determine current window
  const getCurrentWindow = () => {
    if (now < startMinutes) return { icon: '🌙', label: 'Pre-work', color: 'text-indigo-600 dark:text-indigo-400' };
    if (now < hardStopMinutes) return { icon: '⚡', label: 'Deep work', color: 'text-cyan-600 dark:text-cyan-400' };
    if (now < fullStopMinutes) return { icon: '🌙', label: 'Wind-down', color: 'text-indigo-600 dark:text-indigo-400' };
    return { icon: '😴', label: 'Rest', color: 'text-purple-600 dark:text-purple-400' };
  };

  const window = getCurrentWindow();

  // Format time labels
  const formatTimeLabel = (timeString: string) => {
    const [hours] = timeString.split(':').map(Number);
    if (hours === 0) return '12am';
    if (hours < 12) return `${hours}am`;
    if (hours === 12) return '12pm';
    return `${hours - 12}pm`;
  };

  const energyBadgeStyle = energyLevel ? ENERGY_BADGE_STYLES[energyLevel] : null;
  const energyLabel = energyLevel ? ENERGY_LABELS[energyLevel] : 'Set energy';
  const timeRemainingLabel = formatTimeLeft(timeInfo);

  const deepEndPercent = getTimePosition(hardStopMinutes, startMinutes, fullStopMinutes);
  const totalPercent = getTimePosition(fullStopMinutes, startMinutes, fullStopMinutes);
  const windWidth = Math.max(totalPercent - deepEndPercent, 0);
  const deepCenter = deepEndPercent / 2;
  const windCenter = deepEndPercent + windWidth / 2;
  const startPercent = 0;
  const endPercent = 100;

  const energyHighlightWidth = Math.min(14, deepEndPercent);
  const energyHighlightLeft = Math.max(0, deepCenter - energyHighlightWidth / 2);

  const timeHighlightWidth = Math.min(14, windWidth);
  const timeHighlightLeft = Math.max(deepEndPercent, windCenter - timeHighlightWidth / 2);

  const indicatorIcon = energyLevel ? '⚡' : window.icon;
  const indicatorLabel = energyLevel ? energyLabel : window.label;
  const indicatorColor = energyBadgeStyle?.text ?? window.color;

  return (
    <div className="space-y-2">
      {/* Timeline */}
      <div className="relative">
        {/* Time labels positioned by actual time offsets */}
        <div className="relative mb-1 h-4 text-[10px] font-medium text-slate-400 dark:text-slate-200">
          <span className="absolute -translate-x-1/2" style={{ left: `${startPercent}%` }}>
            {formatTimeLabel(workStart)}
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: `${deepEndPercent}%` }}>
            {formatTimeLabel(hardStop)}
          </span>
          <span className="absolute -translate-x-1/2" style={{ left: `${endPercent}%` }}>
            {formatTimeLabel(fullStop)}
          </span>
        </div>

        {/* Track */}
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-900">
          {energyBadgeStyle && energyHighlightWidth > 0 && (
            <div
              className={`absolute top-0 h-full bg-gradient-to-r opacity-80 ${energyBadgeStyle.bg}`}
              style={{
                left: `${energyHighlightLeft}%`,
                width: `${energyHighlightWidth}%`,
              }}
            />
          )}
          {/* Deep work zone */}
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-400 to-cyan-500 dark:from-cyan-600 dark:to-cyan-700"
            style={{
              width: `${getTimePosition(hardStopMinutes, startMinutes, fullStopMinutes)}%`,
            }}
          />
          {/* Wind-down zone */}
          <div
            className="absolute top-0 h-full bg-gradient-to-r from-indigo-400 to-indigo-500 dark:from-indigo-600 dark:to-indigo-700"
            style={{
              left: `${getTimePosition(hardStopMinutes, startMinutes, fullStopMinutes)}%`,
              width: `${getTimePosition(fullStopMinutes, startMinutes, fullStopMinutes) - getTimePosition(hardStopMinutes, startMinutes, fullStopMinutes)}%`,
            }}
          />
          {timeInfo && timeHighlightWidth > 0 && (
            <div
              className={`absolute top-0 h-full bg-gradient-to-r opacity-80 ${TIME_BADGE_STYLE.bg}`}
              style={{
                left: `${timeHighlightLeft}%`,
                width: `${timeHighlightWidth}%`,
              }}
            />
          )}

          {/* Current time indicator */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-lg dark:border-slate-900 dark:bg-white"
            style={{ left: `${position}%` }}
          />
        </div>

        {/* Marker ticks aligned to time positions */}
        <div className="relative mt-1 h-2">
          <div
            className="absolute h-2 w-0.5 -translate-x-1/2 bg-slate-300 dark:bg-slate-600"
            style={{ left: `${startPercent}%` }}
          />
          <div
            className="absolute h-2 w-0.5 -translate-x-1/2 bg-slate-300 dark:bg-slate-600"
            style={{ left: `${deepEndPercent}%` }}
          />
          <div
            className="absolute h-2 w-0.5 -translate-x-1/2 bg-slate-300 dark:bg-slate-600"
            style={{ left: `${endPercent}%` }}
          />
        </div>

        {/* Time remaining footer */}
        {timeInfo && (
          <div className="mt-2 flex justify-end text-xs font-semibold text-purple-900 dark:text-violet-100">
            {timeRemainingLabel}
          </div>
        )}
      </div>
    </div>
  );
}
