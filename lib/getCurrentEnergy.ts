/**
 * Get current energy level based on time and user's energy schedule
 * Supports day-specific schedules (M/T/W/Th/F/Sa/Su) - no weekday/weekend assumptions
 */

import type { EnergyLevel } from './capacity';
import type { EnergySchedule } from './supabase';

type DayType = 'all' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Get day name from Date object
 */
function getDayName(date: Date): DayType {
  const dayIndex = date.getDay(); // 0 = Sunday, 6 = Saturday
  const dayNames: DayType[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return dayNames[dayIndex];
}

/**
 * Filter schedules by day - matches specific day or 'all'
 * No weekday/weekend grouping - users define their own patterns
 */
function filterSchedulesByDay(schedules: EnergySchedule[], date: Date): EnergySchedule[] {
  const dayName = getDayName(date);

  return schedules.filter(schedule => {
    const dayType = ((schedule as any).day_type || 'all') as DayType;

    // Match specific day or 'all'
    return dayType === dayName || dayType === 'all';
  });
}

/**
 * Get the current energy level based on the time of day and energy schedule
 */
export function getCurrentEnergyLevel(
  schedules: EnergySchedule[],
  currentTime: Date = new Date()
): EnergyLevel {
  // Filter schedules for current day
  const todaySchedules = filterSchedulesByDay(schedules, currentTime);

  if (todaySchedules.length === 0) {
    return 'steady'; // Default fallback
  }

  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Sort schedules by time
  const sorted = [...todaySchedules].sort((a, b) => a.start_time_minutes - b.start_time_minutes);

  // Find the current schedule block
  // A block is active if: nowMinutes >= block.start_time_minutes AND nowMinutes < next_block.start_time_minutes
  let currentEnergy: EnergyLevel = sorted[0].energy_key as EnergyLevel; // Default to first block

  for (let i = 0; i < sorted.length; i++) {
    const schedule = sorted[i];
    const nextSchedule = sorted[i + 1];
    
    if (nowMinutes >= schedule.start_time_minutes) {
      // Check if we're still within this block's time range
      if (!nextSchedule || nowMinutes < nextSchedule.start_time_minutes) {
        // We're in this block's time range
        currentEnergy = schedule.energy_key as EnergyLevel;
        break;
      }
      // Otherwise, continue to check next block
    } else {
      // We're before this block, so use the previous block (or default to first)
      break;
    }
  }

  return currentEnergy;
}
