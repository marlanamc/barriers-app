'use client';

import { useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import type { EnergyLevel } from '@/lib/capacity';

type EnergyBlock = {
  start: string; // "08:00"
  end: string;   // "18:00"
  level: EnergyLevel;
};

type Mode = 'morning' | 'day' | 'evening' | 'night';

interface EnergyTimelineProps {
  mode?: Mode;
  energySchedule?: EnergyBlock[];
  wakeTime: string;
  workStartTime: string;
  hardStopTime: string;
  bedtime?: string | null;
  currentTime: Date;
  currentEnergyLevel: EnergyLevel | null;
  timeRemainingMinutes?: number | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const ENERGY_CLASSES: Record<EnergyLevel, string> = {
  sparky: 'bg-gradient-to-r from-pink-200 via-rose-200 to-pink-300',
  steady: 'bg-gradient-to-r from-emerald-200 via-teal-200 to-emerald-300',
  flowing: 'bg-gradient-to-r from-sky-200 via-blue-200 to-sky-300',
  foggy: 'bg-gradient-to-r from-purple-200 via-violet-200 to-purple-300',
  resting: 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400',
};

const ENERGY_GRADIENTS: Record<EnergyLevel, string> = {
  sparky: 'from-pink-200 via-rose-200 to-pink-300',
  steady: 'from-emerald-200 via-teal-200 to-emerald-300',
  flowing: 'from-sky-200 via-blue-200 to-sky-300',
  foggy: 'from-purple-200 via-violet-200 to-purple-300',
  resting: 'from-slate-200 via-slate-300 to-slate-400 dark:from-slate-300 dark:via-slate-400 dark:to-slate-500',
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
    
    // Handle blocks that start before workStartTime or end after hardStopTime
    // If block starts before workStartTime, clamp to 0 (start of day period)
    // If block ends after hardStopTime, clamp to total (end of day period)
    let relStart: number;
    let relEnd: number;
    
    if (bStart < startMin) {
      // Block starts before workStartTime - it should start at 0 (beginning of day period)
      relStart = 0;
    } else {
      // Block starts within or after workStartTime
      relStart = bStart - startMin;
    }
    
    if (bEnd > endMin) {
      // Block ends after hardStopTime - it should end at total (end of day period)
      relEnd = total;
    } else {
      // Block ends within or before hardStopTime
      relEnd = bEnd - startMin;
    }
    
    // Only include blocks that actually overlap with the day period
    if (bEnd <= startMin || bStart >= endMin) {
      return null; // Block doesn't overlap with day period
    }
    
    return { 
      start: Math.max(0, relStart), 
      end: Math.min(total, Math.max(relStart, relEnd)), 
      level: block.level 
    };
  }).filter(Boolean) as { start: number; end: number; level: EnergyLevel }[];
  
  return blocks.map((b) => ({
    start: Math.max(0, Math.min(b.start, total)),
    end: Math.max(Math.min(b.end, total), Math.min(b.start + 5, total)), // enforce minimal width
    level: b.level,
  }));
}

function buildEveningBlocks(hardStop: string, bedtime: string, energySchedule?: EnergyBlock[]) {
  const startMin = parseHM(hardStop, bedtime);
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
      let blockEnd = parseHM(block.end);

      // Handle midnight wrap-around: if blockEnd is 0 (00:00), treat it as end of day (1440 minutes)
      if (blockEnd === 0 && blockStart > 0) {
        blockEnd = 1440;
      }

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

function buildMorningBlocks(wakeTime: string, workStart: string, energySchedule?: EnergyBlock[]) {
  const wakeMin = parseHM(wakeTime);
  const workStartMin = parseHM(workStart);
  const total = minutesDiff(wakeMin, workStartMin);

  console.log('buildMorningBlocks called:', { wakeTime, workStart, wakeMin, workStartMin, total, energySchedule });

  // If we have energy schedule data, use it
  if (energySchedule && energySchedule.length > 0) {
    const segments: { start: number; end: number; color: string; label: string }[] = [];

    energySchedule.forEach((block) => {
      const blockStart = parseHM(block.start);
      let blockEnd = parseHM(block.end);

      // Handle midnight wrap-around: if blockEnd is 0 (00:00), treat it as end of day (1440 minutes)
      if (blockEnd === 0 && blockStart > 0) {
        blockEnd = 1440;
      }

      // Check if block overlaps with morning period (wakeTime to workStart)
      if (blockStart >= workStartMin || blockEnd <= wakeMin) {
        // Block doesn't overlap with morning period at all
        return;
      }

      // Block overlaps with morning period - calculate segment boundaries
      let segStart: number;
      let segEnd: number;

      if (blockStart < wakeMin) {
        // Block starts before morning period - segment starts at 0
        segStart = 0;
      } else {
        // Block starts within morning period
        segStart = blockStart - wakeMin;
      }

      if (blockEnd >= workStartMin) {
        // Block ends at or after work start - segment ends at total
        segEnd = total;
      } else {
        // Block ends within morning period
        segEnd = blockEnd - wakeMin;
      }

      // Only add if segment is valid
      if (segEnd > segStart && segStart < total) {
        const segment = {
          start: Math.max(0, segStart),
          end: Math.min(total, segEnd),
          color: ENERGY_GRADIENTS[block.level],
          label: ENERGY_LABELS[block.level],
        };
        console.log('Morning segment:', segment, 'from block:', block.start, '-', block.end, block.level);
        segments.push(segment);
      }
    });

    // Filter and sort segments
    let validSegments = segments
      .filter(seg => seg.end > seg.start)
      .sort((a, b) => a.start - b.start);

    console.log('Morning validSegments:', validSegments, 'total:', total);

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

      // Add all valid segments and fill gaps
      for (let i = 0; i < validSegments.length; i++) {
        filledSegments.push(validSegments[i]);

        if (i < validSegments.length - 1) {
          const currentEnd = validSegments[i].end;
          const nextStart = validSegments[i + 1].start;

          if (nextStart > currentEnd) {
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

      console.log('Morning filledSegments:', filledSegments);
      return { total, segments: filledSegments };
    }
  }

  // Fallback to single resting block (morning routine)
  return {
    total,
    segments: [
      { start: 0, end: total, color: EVENING_REST, label: 'Morning routine' },
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
  wakeTime,
  workStartTime,
  hardStopTime,
  bedtime,
  currentTime,
  currentEnergyLevel,
  timeRemainingMinutes,
  collapsed,
  onToggleCollapsed,
}: EnergyTimelineProps) {
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const wakeMin = parseHM(wakeTime);
  const workStartMin = parseHM(workStartTime);
  const hardStopMin = parseHM(hardStopTime);
  const bedtimeMin = parseHM(bedtime || '22:00'); // Default to 10pm

  // Determine mode based on current time (4 flows)
  const isMorningDefault = nowMinutes >= wakeMin && nowMinutes < workStartMin;
  const isDayDefault = nowMinutes >= workStartMin && nowMinutes < hardStopMin;
  const isEveningDefault = nowMinutes >= hardStopMin && nowMinutes < bedtimeMin;
  const mode: Mode = explicitMode ?? (
    isMorningDefault ? 'morning' :
    isDayDefault ? 'day' :
    isEveningDefault ? 'evening' :
    'night'
  );

  // Morning mode data
  const morning = useMemo(() => {
    const base = buildMorningBlocks(wakeTime, workStartTime, energySchedule);
    return { ...base, total: base.total || 1 };
  }, [wakeTime, workStartTime, energySchedule]);

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
    const base = buildNightBlocks(bedtime || '22:00', wakeTime);
    return { ...base, total: base.total || 1 };
  }, [bedtime, wakeTime]);

  // Get unique energy types in order for current mode
  const energyTypesInOrder = useMemo((): EnergyLevel[] => {
    if (mode === 'day') {
      // Extract unique energy types from dayBlocks in order
      const seen = new Set<EnergyLevel>();
      const ordered: EnergyLevel[] = [];
      dayBlocks.forEach((block) => {
        if (!seen.has(block.level)) {
          seen.add(block.level);
          ordered.push(block.level);
        }
      });
      return ordered;
    } else if (mode === 'morning' || mode === 'evening') {
      // For morning/evening, extract from energySchedule blocks that overlap with the period
      const startTime = mode === 'morning' ? wakeTime : hardStopTime;
      const endTime = mode === 'morning' ? workStartTime : (bedtime || '22:00');
      const startMin = parseHM(startTime);
      const endMin = parseHM(endTime);
      
      // Get energy types from schedule blocks that overlap
      const seen = new Set<EnergyLevel>();
      const ordered: EnergyLevel[] = [];
      
      if (energySchedule && energySchedule.length > 0) {
        energySchedule
          .filter((block) => {
            const bStart = parseHM(block.start);
            let bEnd = parseHM(block.end);
            if (bEnd === 0 && bStart > 0) bEnd = 1440;
            return bStart < endMin && bEnd > startMin;
          })
          .sort((a, b) => parseHM(a.start) - parseHM(b.start))
          .forEach((block) => {
            if (!seen.has(block.level)) {
              seen.add(block.level);
              ordered.push(block.level);
            }
          });
      }
      
      // If no schedule blocks, check segments for resting (which uses EVENING_REST)
      const segments = mode === 'morning' ? morning.segments : evening.segments;
      if (ordered.length === 0 && segments.length > 0) {
        // Check if segments have resting color
        const hasResting = segments.some(seg => seg.color.includes('indigo') || seg.color.includes('purple'));
        if (hasResting) {
          ordered.push('resting');
        }
      }
      
      return ordered;
    }
    // Night mode - no energy types
    return [];
  }, [mode, dayBlocks, morning.segments, evening.segments, energySchedule, wakeTime, workStartTime, hardStopTime, bedtime]);

  // Calculate current position, clamping to prevent marker from being cut off
  // Marker is 20px (h-5 w-5) wide, so we need to account for half-width (10px)
  // Container has inset-x-3 (12px padding), so we clamp to ~95% to keep marker visible
  const rawCurrentPos =
    mode === 'morning'
      ? toPercent(minutesDiff(parseHM(wakeTime), nowMinutes), morning.total || 1)
      : mode === 'day'
      ? toPercent(minutesDiff(parseHM(workStartTime), nowMinutes), dayTotal)
      : mode === 'evening'
        ? toPercent(minutesDiff(parseHM(hardStopTime), nowMinutes), evening.total || 1)
        : toPercent(minutesDiff(bedtimeMin, nowMinutes), night.total || 1);

  // Clamp position to prevent marker from being cut off at edges
  const currentPos = Math.max(2, Math.min(98, rawCurrentPos));

  const currentLabel =
    mode === 'morning'
      ? '🌅 Morning routine'
      : mode === 'day'
      ? '☀️ Daytime flow'
      : mode === 'evening'
        ? '🌙 Resting'
        : '💤 Sleeping';
  
  // Energy chip styling for day mode
  const ENERGY_CHIP_STYLES: Record<EnergyLevel, { emoji: string; bg: string; text: string }> = {
    sparky: {
      emoji: '⚡',
      bg: 'from-pink-200 via-rose-200 to-pink-300 dark:from-pink-800/40 dark:via-rose-800/40 dark:to-pink-800/40',
      text: 'text-pink-900 dark:text-pink-100',
    },
    steady: {
      emoji: '☀️',
      bg: 'from-emerald-200 via-teal-200 to-emerald-300 dark:from-emerald-800/40 dark:via-teal-800/40 dark:to-emerald-800/40',
      text: 'text-emerald-900 dark:text-emerald-100',
    },
    flowing: {
      emoji: '🌊',
      bg: 'from-sky-200 via-blue-200 to-sky-300 dark:from-sky-800/40 dark:via-blue-800/40 dark:to-sky-800/40',
      text: 'text-sky-900 dark:text-sky-100',
    },
    foggy: {
      emoji: '🌫️',
      bg: 'from-purple-200 via-violet-200 to-purple-300 dark:from-purple-800/40 dark:via-violet-800/40 dark:to-purple-800/40',
      text: 'text-purple-900 dark:text-purple-100',
    },
    resting: {
      emoji: '🌙',
      bg: 'from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700/40 dark:via-slate-600/40 dark:to-slate-700/40',
      text: 'text-slate-900 dark:text-slate-100',
    },
  };

  // Calculate time remaining in current energy level (for day mode)
  const timeRemainingInCurrentEnergy = useMemo(() => {
    if (mode !== 'day' || !currentEnergyLevel) return null;
    
    const nowRel = minutesDiff(parseHM(workStartTime), nowMinutes);
    
    // Find the current block
    const currentBlock = dayBlocks.find(block => {
      return nowRel >= block.start && nowRel < block.end;
    });
    
    if (!currentBlock) return null;
    
    // Calculate minutes remaining in current block
    const blockEndRel = currentBlock.end;
    const remaining = blockEndRel - nowRel;
    
    return remaining > 0 ? remaining : 0;
  }, [mode, dayBlocks, workStartTime, nowMinutes, currentEnergyLevel]);

  // Calculate time remaining until hard stop (or bedtime)
  const timeRemainingUntilStop = useMemo(() => {
    if (mode === 'day') {
      return minutesDiff(nowMinutes, hardStopMin);
    } else if (mode === 'evening') {
      return minutesDiff(nowMinutes, bedtimeMin);
    }
    return null;
  }, [mode, nowMinutes, hardStopMin, bedtimeMin]);

  const remainingText =
    mode === 'morning'
      ? formatUntilWorkStart(minutesDiff(nowMinutes, workStartMin))
      : mode === 'day'
      ? (() => {
          const energyText = timeRemainingInCurrentEnergy != null && timeRemainingInCurrentEnergy > 0
            ? formatRemaining(timeRemainingInCurrentEnergy)
            : '';
          const stopText = timeRemainingUntilStop != null && timeRemainingUntilStop > 0
            ? formatRemaining(timeRemainingUntilStop)
            : '';
          
          if (energyText && stopText) {
            return `${energyText} in ${currentEnergyLevel ? ENERGY_LABELS[currentEnergyLevel] : 'current energy'} • ${stopText} until hard stop`;
          } else if (stopText) {
            return `${stopText} until hard stop`;
          } else if (energyText) {
            return `${energyText} in ${currentEnergyLevel ? ENERGY_LABELS[currentEnergyLevel] : 'current energy'}`;
          }
          return timeRemainingUntilStop != null && timeRemainingUntilStop <= 0 
            ? 'Past hard stop' 
            : '';
        })()
      : mode === 'evening'
        ? (() => {
            const bedtimeText = formatUntilBedtime(timeRemainingUntilStop);
            return bedtimeText;
          })()
        : formatUntilWake(minutesDiff(nowMinutes, wakeMin));

  function formatUntilWorkStart(minutes?: number | null) {
    if (minutes == null) return '';
    if (minutes <= 0) return 'Work time!';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}m until work`;
    return `${h}h ${m}m until work`;
  }

  return (
    <div className="w-full">
      {/* Collapsed header */}
      <div className="flex min-h-[40px] items-center justify-between gap-3 px-3 py-1.5">
        <div className="min-w-0 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <span>
            {mode === 'morning' ? '🌅 Morning flow' : mode === 'day' ? '☀️ Daytime flow' : mode === 'evening' ? '🌙 Evening flow' : '💤 Deep sleep flow'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-200">
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
        className={`overflow-y-visible overflow-x-hidden transition-[max-height,padding,opacity] duration-300 ${
          collapsed ? 'max-h-0 opacity-0' : 'max-h-[460px] opacity-100'
        }`}
      >
        {!collapsed && (
          <div className="mt-2 space-y-2 pb-3">
            {/* Bar */}
            <div className="relative h-12 overflow-visible rounded-full bg-slate-100/90 ring-1 ring-white/50 dark:bg-slate-800/80 dark:ring-slate-700/80">
              <div className="absolute inset-x-3 top-1/2 h-3 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-700/80">
                {mode === 'morning' &&
                  (() => {
                    console.log('Rendering morning segments:', morning.segments, 'total:', morning.total);
                    return morning.segments.map((seg, index) => {
                      const segMinutes = seg.end - seg.start;
                      const widthPercent = toPercent(segMinutes, morning.total);
                      const leftPercent = toPercent(seg.start, morning.total);
                      console.log(`Morning segment ${index}:`, { seg, widthPercent, leftPercent, color: seg.color });
                      if (widthPercent <= 0) return null;
                      const roundedClasses =
                        index === 0 && seg.start === 0
                          ? 'rounded-l-full'
                          : index === morning.segments.length - 1 && seg.end >= morning.total
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
                    });
                  })()}

                {mode === 'day' &&
                  dayBlocks.map((block, index) => {
                    const segmentMinutes = Math.max(block.end - block.start, 0);
                    const widthPercent = toPercent(segmentMinutes, dayTotal);
                    const leftPercent = toPercent(block.start, dayTotal);
                    const nowRel = minutesDiff(parseHM(workStartTime), nowMinutes);
                    const isCurrent = nowRel >= block.start && nowRel < block.end;
                    const roundedClasses =
                      index === 0 && block.start === 0
                        ? 'rounded-l-full'
                        : index === dayBlocks.length - 1 && block.end >= dayTotal
                        ? 'rounded-r-full'
                        : '';
                    return widthPercent <= 0 ? null : (
                      <div
                        key={`${block.start}-${index}`}
                        className={`absolute top-0 h-full ${ENERGY_CLASSES[block.level]} ${roundedClasses} ${
                          isCurrent ? 'opacity-100 shadow-[0_0_10px_rgba(0,0,0,0.15)]' : 'opacity-40'
                        }`}
                        style={{
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`
                        }}
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
            <div className="relative mt-2 h-4 overflow-visible px-3 text-[10px] font-medium text-slate-500 dark:text-slate-100">
              {mode === 'morning' && (
                <>
                  <span className="absolute left-0 text-left">
                    {formatHMLabel(wakeTime)}
                  </span>
                  <span className="absolute right-0 translate-x-0 text-right">
                    {formatHMLabel(workStartTime)}
                  </span>
                </>
              )}
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
                    {formatHMLabel(wakeTime)}
                  </span>
                </>
              )}
            </div>

            {/* Energy type legend - only show types present in current timeline */}
            {energyTypesInOrder.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] font-medium text-slate-600 dark:text-slate-400">
                {energyTypesInOrder.map((energyType) => {
                  const gradient = ENERGY_GRADIENTS[energyType];
                  return (
                    <div key={energyType} className="flex items-center gap-1.5">
                      <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${gradient}`} />
                      <span>{ENERGY_LABELS[energyType]}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Time remaining below timeline */}
            {mode === 'day' && (timeRemainingInCurrentEnergy != null || timeRemainingUntilStop != null) ? (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {timeRemainingInCurrentEnergy != null && timeRemainingInCurrentEnergy > 0 && currentEnergyLevel && (() => {
                  const timeText = formatRemaining(timeRemainingInCurrentEnergy);
                  const timeMatch = timeText.match(/^(.+?)\s+(left|min left|hrs? left)$/);
                  const timeOnly = timeMatch ? timeMatch[1] : timeText;
                  const suffix = timeMatch ? ` ${timeMatch[2]}` : '';
                  return (
                    <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-gradient-to-r ${ENERGY_CHIP_STYLES[currentEnergyLevel].bg} shadow-sm`}>
                      <span className="text-sm" aria-hidden="true">{ENERGY_CHIP_STYLES[currentEnergyLevel].emoji}</span>
                      <span className="text-xs font-semibold">
                        <span className="font-bold text-black dark:text-white">{timeOnly}</span>
                        <span className={`${ENERGY_CHIP_STYLES[currentEnergyLevel].text}`}>{suffix} in {ENERGY_LABELS[currentEnergyLevel]}</span>
                      </span>
                    </div>
                  );
                })()}
                {timeRemainingUntilStop != null && (
                  <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ${
                    timeRemainingUntilStop > 0
                      ? 'bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 dark:from-amber-900/40 dark:via-orange-900/40 dark:to-amber-900/40'
                      : 'bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 dark:from-slate-700/40 dark:via-slate-600/40 dark:to-slate-700/40'
                  } shadow-sm`}>
                    <span className="text-sm" aria-hidden="true">{timeRemainingUntilStop > 0 ? '⏰' : '🌙'}</span>
                    <span className="text-xs font-semibold">
                      {timeRemainingUntilStop > 0 ? (() => {
                        const timeText = formatRemaining(timeRemainingUntilStop);
                        const timeMatch = timeText.match(/^(.+?)\s+(left|min left|hrs? left)$/);
                        const timeOnly = timeMatch ? timeMatch[1] : timeText;
                        const suffix = timeMatch ? ` ${timeMatch[2]}` : '';
                        return (
                          <>
                            <span className="font-bold text-black dark:text-white">{timeOnly}</span>
                            <span className="text-amber-900 dark:text-amber-100">{suffix} until hard stop</span>
                          </>
                        );
                      })() : (
                        <span className="text-slate-900 dark:text-slate-100">Past hard stop</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            ) : remainingText ? (
              <div className="mt-1.5 flex justify-center">
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">{remainingText}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
