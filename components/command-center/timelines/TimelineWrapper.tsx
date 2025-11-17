'use client';

import { DayTimeline } from './DayTimeline';
import { EveningTimeline } from './EveningTimeline';
import { SleepTimeline } from './SleepTimeline';
import { getTimelineMode } from './TimeUtils';
import type { EnergyLevel } from '@/lib/capacity';

type EnergyBlock = { start: string; end: string; level: EnergyLevel };

export interface TimelineWrapperProps {
  currentTime: Date;
  wakeTime: string;
  hardStopTime: string;
  bedTime: string;
  nextWakeTime: string;
  energySchedule: EnergyBlock[];
  currentEnergyLevel: EnergyLevel;
  timeRemaining: string;
  timeRemainingToBed?: string;
  timeRemainingToWake?: string;
}

export function TimelineWrapper({
  currentTime,
  wakeTime,
  hardStopTime,
  bedTime,
  nextWakeTime,
  energySchedule,
  currentEnergyLevel,
  timeRemaining,
  timeRemainingToBed,
  timeRemainingToWake,
}: TimelineWrapperProps) {
  const mode = getTimelineMode(currentTime, wakeTime, hardStopTime, bedTime);

  if (mode === 'day') {
    return (
      <DayTimeline
        currentTime={currentTime}
        wakeTime={wakeTime}
        hardStopTime={hardStopTime}
        energySchedule={energySchedule}
        currentEnergyLevel={currentEnergyLevel}
        timeRemaining={timeRemaining}
      />
    );
  }

  if (mode === 'evening') {
    return (
      <EveningTimeline
        currentTime={currentTime}
        hardStopTime={hardStopTime}
        bedTime={bedTime}
        timeRemaining={timeRemainingToBed || timeRemaining}
      />
    );
  }

  return (
    <SleepTimeline
      currentTime={currentTime}
      bedTime={bedTime}
      nextWakeTime={nextWakeTime}
      timeRemaining={timeRemainingToWake || timeRemaining}
    />
  );
}
