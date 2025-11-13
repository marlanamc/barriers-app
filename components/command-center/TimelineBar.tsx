'use client';

interface TimelineBarProps {
  workStart?: string;
  hardStop?: string;
  fullStop?: string;
  currentTime: Date;
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

export function TimelineBar({ workStart = '08:00', hardStop = '18:00', fullStop = '22:30', currentTime }: TimelineBarProps) {
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

  return (
    <div className="space-y-2">
      {/* Current window indicator */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-2xl">{window.icon}</span>
        <span className={`text-sm font-semibold ${window.color}`}>{window.label}</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Time labels */}
        <div className="mb-1 flex justify-between text-[10px] font-medium text-slate-400 dark:text-slate-500">
          <span>{formatTimeLabel(workStart)}</span>
          <span>{formatTimeLabel(hardStop)}</span>
          <span>{formatTimeLabel(fullStop)}</span>
        </div>

        {/* Track */}
        <div className="relative h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
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

          {/* Current time indicator */}
          <div
            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-lg dark:border-slate-900 dark:bg-white"
            style={{ left: `${position}%` }}
          />
        </div>

        {/* Marker ticks */}
        <div className="relative mt-1 flex justify-between">
          <div className="h-2 w-0.5 bg-slate-300 dark:bg-slate-600" />
          <div className="h-2 w-0.5 bg-slate-300 dark:bg-slate-600" />
          <div className="h-2 w-0.5 bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>
    </div>
  );
}
