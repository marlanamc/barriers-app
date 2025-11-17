'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import type { EnergyLevel } from '@/lib/capacity';

type EnergyBlock = {
  start: string; // "08:00"
  end: string;   // "18:00"
  level: EnergyLevel;
};

type Mode = 'day' | 'evening' | 'night';

interface EnergyTimelineProps {
  mode?: Mode;
  energySchedule?: EnergyBlock[];
  workStartTime: string;
  hardStopTime: string;
  bedtime?: string | null;
  nextWakeTime?: string | null;
  currentTime: Date;
  currentEnergyLevel: EnergyLevel | null;
  timeRemainingMinutes?: number | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const ENERGY_CLASSES: Record<EnergyLevel, string> = {
  sparky: 'bg-[#F9C74F]',
  steady: 'bg-[#43AA8B]',
  flowing: 'bg-[#577590]',
  foggy: 'bg-[#9B8AFB]',
  resting: 'bg-[#3D405B]',
};

const ENERGY_GRADIENTS: Record<EnergyLevel, string> = {
  sparky: 'from-amber-400 to-yellow-500',
  steady: 'from-emerald-500 to-teal-600',
  flowing: 'from-blue-600 to-slate-600',
  foggy: 'from-blue-400 to-cyan-500 dark:from-blue-500 dark:to-cyan-600',
  resting: 'from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700',
};

const EVENING_REST = 'from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700';
const NIGHT_SLEEP = 'from-indigo-800 to-violet-800';

const ENERGY_LABELS: Record<EnergyLevel, string> = {
  sparky: 'Sparky',
  steady: 'Steady',
  flowing: 'Flowing',
  foggy: 'Foggy',
  resting: 'Resting',
};

function parseHM(value: string): number {
  const [h, m] = value.split(':').map(Number);
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

function formatRemaining(minutes?: number | null) {
  if (minutes == null) return '';
  if (minutes <= 0) return 'Past stop';
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h} ${h === 1 ? 'hr' : 'hrs'} left` : `${h}h ${m}m left`;
  }
  return `${Math.max(minutes, 1)} min left`;
}

function formatUntilBedtime(minutes?: number | null) {
  if (minutes == null) return '';
  if (minutes <= 0) return 'Bedtime reached';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m until bedtime`;
  return `${h}h ${m}m until bedtime`;
}

function formatUntilWake(minutes?: number | null) {
  if (minutes == null) return '';
  if (minutes <= 0) return 'Wake time reached';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m until wake`;
  return `${h}h ${m}m until wake`;
}

function buildDayBlocks(schedule: EnergyBlock[] | undefined, start: string, end: string, fallbackLevel: EnergyLevel): { start: number; end: number; level: EnergyLevel }[] {
  const startMin = parseHM(start);
  const endMin = parseHM(end);
  const total = minutesDiff(startMin, endMin);
  const blocks = (schedule && schedule.length ? schedule : [{ start, end, level: fallbackLevel }]).map((block) => {
    const bStart = parseHM(block.start);
    const bEnd = parseHM(block.end);
    const relStart = minutesDiff(startMin, bStart);
    const relEnd = minutesDiff(startMin, bEnd);
    return { start: relStart, end: relEnd <= relStart ? total : relEnd, level: block.level };
  });
  return blocks.map((b) => ({
    start: Math.max(0, Math.min(b.start, total)),
    end: Math.max(Math.min(b.end, total), Math.min(b.start + 5, total)), // enforce minimal width
    level: b.level,
  }));
}

function buildEveningBlocks(hardStop: string, bedtime: string, energySchedule?: EnergyBlock[]) {
  const startMin = parseHM(hardStop);
  const bedtimeMin = parseHM(bedtime);
  const total = minutesDiff(startMin, bedtimeMin);
  
  console.log('buildEveningBlocks called:', { hardStop, bedtime, startMin, bedtimeMin, total, energySchedule });

  // If we have energy schedule data, use it
  if (energySchedule && energySchedule.length > 0) {
    const segments: { start: number; end: number; color: string; label: string }[] = [];
    
    // Find the last block that might extend into evening
    let lastBlockBeforeEvening: EnergyBlock | null = null;
    
    energySchedule.forEach((block) => {
      const blockStart = parseHM(block.start);
      const blockEnd = parseHM(block.end);
      
      // Track the last block that ends at or after hardStop
      if (blockEnd >= startMin && (lastBlockBeforeEvening === null || blockEnd > parseHM(lastBlockBeforeEvening.end))) {
        lastBlockBeforeEvening = block;
      }
      
      // Calculate overlap with evening period (hardStop to bedtime)
      // Handle cases where block starts before hardStop or ends after bedtime
      let segStart: number;
      let segEnd: number;
      
      // Check if block overlaps with evening period at all
      // Block overlaps if: (blockStart < bedtimeMin && blockEnd > startMin)
      if (blockStart >= bedtimeMin || blockEnd <= startMin) {
        // Block doesn't overlap with evening period at all
        return;
      }
      
      // Block overlaps with evening period - calculate segment boundaries
      if (blockStart < startMin) {
        // Block starts before evening period - segment starts at 0
        segStart = 0;
      } else {
        // Block starts within evening period
        segStart = blockStart - startMin;
      }
      
      if (blockEnd >= bedtimeMin) {
        // Block ends at or after bedtime - segment ends at total
        segEnd = total;
      } else {
        // Block ends within evening period
        segEnd = blockEnd - startMin;
      }
      
      // Only add if segment is valid
      if (segEnd > segStart && segStart < total) {
        const segment = {
          start: Math.max(0, segStart),
          end: Math.min(total, segEnd),
          color: ENERGY_GRADIENTS[block.level],
        label: ENERGY_LABELS[block.level],
      };
        console.log('Evening segment:', segment, 'from block:', block.start, '-', block.end, block.level);
        segments.push(segment);
      }
    });

    // Filter out invalid segments and sort by start time
    let validSegments = segments
      .filter(seg => seg.end > seg.start)
      .sort((a, b) => a.start - b.start);
    
    console.log('Evening validSegments:', validSegments, 'total:', total, 'hardStop:', hardStop, 'bedtime:', bedtime);

    // Fill gaps between segments with resting blocks
    if (validSegments.length > 0) {
      const filledSegments: { start: number; end: number; color: string; label: string }[] = [];
      
      // Add resting block from start to first segment if needed
      if (validSegments[0].start > 0) {
        filledSegments.push({
          start: 0,
          end: validSegments[0].start,
          color: EVENING_REST,
          label: 'Resting',
        });
      }
      
      // Add all valid segments and fill gaps between them
      for (let i = 0; i < validSegments.length; i++) {
        filledSegments.push(validSegments[i]);
        
        // Check for gap before next segment
        if (i < validSegments.length - 1) {
          const currentEnd = validSegments[i].end;
          const nextStart = validSegments[i + 1].start;
          
          if (nextStart > currentEnd) {
            // Fill gap with resting
            filledSegments.push({
              start: currentEnd,
              end: nextStart,
              color: EVENING_REST,
              label: 'Resting',
            });
          }
        }
      }
      
      // Add resting block from last segment to end if needed
      const lastSegment = validSegments[validSegments.length - 1];
      if (lastSegment.end < total) {
        filledSegments.push({
          start: lastSegment.end,
          end: total,
          color: EVENING_REST,
          label: 'Resting',
        });
      }
      
      console.log('Evening filledSegments:', filledSegments);
      return { total, bedtimeMin, segments: filledSegments };
    }

    // If no segments found but we have a block that extends into evening, use its energy level
    if (lastBlockBeforeEvening !== null) {
      const lastBlock: EnergyBlock = lastBlockBeforeEvening;
      if (parseHM(lastBlock.end) >= startMin) {
        const lastBlockEnd = parseHM(lastBlock.end) - startMin;
        const segments: { start: number; end: number; color: string; label: string }[] = [];
        
        // Add the last block's energy level from start
        segments.push({
          start: 0,
          end: Math.min(total, lastBlockEnd),
          color: ENERGY_GRADIENTS[lastBlock.level],
          label: ENERGY_LABELS[lastBlock.level],
        });
        
        // Fill remaining with resting if needed
        if (lastBlockEnd < total) {
          segments.push({
            start: lastBlockEnd,
            end: total,
            color: EVENING_REST,
            label: 'Resting',
          });
        }
        
        return { total, bedtimeMin, segments };
      }
    }
  }

  // Fallback to single resting block
  return {
    total,
    bedtimeMin,
    segments: [
      { start: 0, end: total, color: EVENING_REST, label: 'Resting' },
    ],
  };
}

function buildNightBlocks(bedtime: string, nextWake: string) {
  const bedtimeMin = parseHM(bedtime);
  const wakeMin = parseHM(nextWake);
  const total = minutesDiff(bedtimeMin, wakeMin);

  return {
    total,
    segments: [
      { start: 0, end: total, color: NIGHT_SLEEP, label: 'Sleeping' },
    ],
  };
}

export function EnergyTimeline({
  mode: explicitMode,
  energySchedule,
  workStartTime,
  hardStopTime,
  bedtime,
  nextWakeTime,
  currentTime,
  currentEnergyLevel,
  timeRemainingMinutes,
  collapsed,
  onToggleCollapsed,
}: EnergyTimelineProps) {
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const wakeMin = parseHM(workStartTime);
  const hardStopMin = parseHM(hardStopTime);
  const bedtimeMin = parseHM(bedtime || '22:00'); // Default to 10pm
  const nextWakeMin = parseHM(nextWakeTime || workStartTime); // fallback

  // Determine mode based on current time
  const isDayDefault = nowMinutes >= wakeMin && nowMinutes < hardStopMin;
  const isEveningDefault = !isDayDefault && nowMinutes >= hardStopMin && nowMinutes < bedtimeMin;
  const mode: Mode = explicitMode ?? (isDayDefault ? 'day' : isEveningDefault ? 'evening' : 'night');

  // Day mode data
  const dayBlocks = useMemo(
    () => buildDayBlocks(energySchedule, workStartTime, hardStopTime, currentEnergyLevel ?? 'steady'),
    [energySchedule, workStartTime, hardStopTime, currentEnergyLevel]
  );
  const dayTotal = minutesDiff(parseHM(workStartTime), parseHM(hardStopTime));

  // Evening mode data
  const evening = useMemo(() => {
    const base = buildEveningBlocks(hardStopTime, bedtime || '22:00', energySchedule);
    return { ...base, total: base.total || 1 };
  }, [hardStopTime, bedtime, energySchedule]);

  // Night mode data
  const night = useMemo(() => {
    const base = buildNightBlocks(bedtime || '22:00', nextWakeTime || workStartTime);
    return { ...base, total: base.total || 1 };
  }, [bedtime, nextWakeTime, workStartTime]);

  // Calculate current position, clamping to prevent marker from being cut off
  // Marker is 20px (h-5 w-5) wide, so we need to account for half-width (10px)
  // Container has inset-x-3 (12px padding), so we clamp to ~95% to keep marker visible
  const rawCurrentPos =
    mode === 'day'
      ? toPercent(minutesDiff(parseHM(workStartTime), nowMinutes), dayTotal)
      : mode === 'evening'
        ? toPercent(minutesDiff(parseHM(hardStopTime), nowMinutes), evening.total || 1)
        : toPercent(minutesDiff(bedtimeMin, nowMinutes), night.total || 1);
  
  // Clamp position to prevent marker from being cut off at edges
  const currentPos = Math.max(2, Math.min(98, rawCurrentPos));

  const currentLabel =
    mode === 'day'
      ? `⚡ ${currentEnergyLevel ? ENERGY_LABELS[currentEnergyLevel] : 'Energy'}`
      : mode === 'evening'
        ? '🌙 Resting'
        : '💤 Sleeping';

  const remainingText =
    mode === 'day'
      ? formatRemaining(timeRemainingMinutes)
      : mode === 'evening'
        ? formatUntilBedtime(minutesDiff(nowMinutes, bedtimeMin))
        : formatUntilWake(minutesDiff(nowMinutes, nextWakeMin));

  return (
    <div className="w-full">
      {/* Collapsed header */}
      <div className="flex min-h-[44px] items-center justify-between gap-3 px-4 py-2">
        <div className="min-w-0 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <span>
            {mode === 'day' ? '☀️ Daytime flow' : mode === 'evening' ? '🌙 Evening flow' : '💤 Deep sleep flow'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-200">
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
            {currentLabel}
          </span>
          {remainingText && <span className="text-xs opacity-70">{remainingText}</span>}
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
            aria-label={collapsed ? 'Expand timeline' : 'Collapse timeline'}
          >
            <ChevronDown className={`h-4 w-4 transition ${collapsed ? '-rotate-90' : 'rotate-90'}`} />
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-[max-height,padding,opacity] duration-300 ${
          collapsed ? 'max-h-0 opacity-0' : 'max-h-[460px] opacity-100'
        }`}
      >
        {!collapsed && (
          <div className="mt-3 space-y-3 pb-4">
            {/* Bar */}
            <div className="relative h-14 rounded-full bg-slate-100/90 ring-1 ring-white/50 dark:bg-slate-800/80 dark:ring-slate-700/80">
              <div className={`absolute inset-x-3 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80 ${
                mode === 'evening' ? '' : 'flex'
              }`}>
                {mode === 'day' &&
                  dayBlocks.map((block, index) => {
                    const segmentMinutes = Math.max(block.end - block.start, 0);
                    const widthPercent = toPercent(segmentMinutes, dayTotal);
                    const nowRel = minutesDiff(parseHM(workStartTime), nowMinutes);
                    const isCurrent = nowRel >= block.start && nowRel < block.end;
                    const roundedClasses =
                      index === 0
                        ? 'rounded-l-full'
                        : index === dayBlocks.length - 1
                        ? 'rounded-r-full'
                        : '';
                    return widthPercent <= 0 ? null : (
                      <div
                        key={`${block.start}-${index}`}
                        className={`h-full ${ENERGY_CLASSES[block.level]} ${roundedClasses} ${
                          isCurrent ? 'opacity-100 shadow-[0_0_10px_rgba(0,0,0,0.15)]' : 'opacity-40'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    );
                  })}

                {mode === 'evening' &&
                  (() => {
                    console.log('Rendering evening segments:', evening.segments, 'total:', evening.total);
                    return evening.segments.map((seg, index) => {
                    const segMinutes = seg.end - seg.start;
                    const widthPercent = toPercent(segMinutes, evening.total);
                      const leftPercent = toPercent(seg.start, evening.total);
                      console.log(`Segment ${index}:`, { seg, widthPercent, leftPercent, color: seg.color });
                      if (widthPercent <= 0) return null;
                    const roundedClasses =
                      index === 0 && seg.start === 0
                        ? 'rounded-l-full'
                        : index === evening.segments.length - 1 && seg.end >= evening.total
                        ? 'rounded-r-full'
                        : '';
                    return (
                      <div
                        key={`${seg.start}-${seg.end}-${index}`}
                        className={`absolute top-0 h-full bg-gradient-to-r ${seg.color} ${roundedClasses} opacity-70`}
                        style={{ 
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%` 
                        }}
                      />
                    );
                  })})()}

                {mode === 'night' &&
                  night.segments.map((seg, index) => {
                    const segMinutes = seg.end - seg.start;
                    const widthPercent = toPercent(segMinutes, night.total);
                    return (
                      <div
                        key={index}
                        className={`h-full bg-gradient-to-r ${seg.color} rounded-full opacity-90`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    );
                  })}
              </div>

              {/* Current marker */}
              <div
                className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900 shadow-lg dark:border-slate-200 dark:bg-white"
                style={{ left: `${currentPos}%` }}
              />
            </div>

            {/* Ticks */}
            <div className="relative mt-3 h-5 overflow-visible px-3 text-[11px] font-medium text-slate-500 dark:text-slate-100">
              {mode === 'day' && (
                <>
                  <span className="absolute left-0 text-left">
                    {formatHMLabel(workStartTime)}
                  </span>
                  <span className="absolute -translate-x-1/2" style={{ left: `${toPercent(dayTotal / 2, dayTotal)}%` }}>
                    {formatHMLabel(
                      (() => {
                        const mid = parseHM(workStartTime) + Math.floor(dayTotal / 2);
                        const hh = Math.floor((mid % (24 * 60)) / 60)
                          .toString()
                          .padStart(2, '0');
                        const mm = ((mid % 60)).toString().padStart(2, '0');
                        return `${hh}:${mm}`;
                      })()
                    )}
                  </span>
                  <span className="absolute right-0 translate-x-0 text-right">
                    {formatHMLabel(hardStopTime)}
                  </span>
                </>
              )}
              {mode === 'evening' && (
                <>
                  <span className="absolute left-0 text-left">
                    {formatHMLabel(hardStopTime)}
                  </span>
                  <span className="absolute right-0 translate-x-0 text-right">
                    {formatHMLabel(bedtime || '22:00')}
                  </span>
                </>
              )}
              {mode === 'night' && (
                <>
                  <span className="absolute left-0 text-left">
                    {formatHMLabel(bedtime || '22:00')}
                  </span>
                  <span className="absolute right-0 translate-x-0 text-right">
                    {formatHMLabel(nextWakeTime || workStartTime)}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
