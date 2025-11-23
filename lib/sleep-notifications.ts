/**
 * Sleep Notification System for ADHD
 *
 * Calculates realistic bedtime based on wake-up time, accounting for
 * the 9 hours ADHDers typically need to wind down and sleep.
 *
 * ADHD Research: Many ADHDers need extended wind-down time due to
 * hyperactive minds and medication effects.
 */

import { parseTimeStringToMinutes } from './timeUtils';

export interface SleepNotification {
  message: string;
  bedtime: string;
  wakeTime: string;
  windDownHours: number;
  tips: string[];
  urgency: 'relaxed' | 'getting_late' | 'urgent';
}

/**
 * Calculate bedtime based on desired wake-up time
 * ADHDers need ~9 hours for wind-down + sleep
 */
export function getSleepNotification(wakeTime: string): SleepNotification | null {
  const wakeMinutes = parseTimeStringToMinutes(wakeTime);
  if (!wakeMinutes) return null;

  // ADHDers need 9 hours total (wind-down + sleep)
  const WIND_DOWN_HOURS = 9;
  const bedMinutes = wakeMinutes - (WIND_DOWN_HOURS * 60);

  // Handle overnight (bedtime before midnight)
  const adjustedBedMinutes = bedMinutes < 0 ? bedMinutes + 24 * 60 : bedMinutes;

  // Format bedtime as HH:MM
  const bedHours = Math.floor(adjustedBedMinutes / 60);
  const bedMins = adjustedBedMinutes % 60;
  const bedtime = `${bedHours.toString().padStart(2, '0')}:${bedMins.toString().padStart(2, '0')}`;

  // Calculate urgency based on current time
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const timeUntilBed = adjustedBedMinutes - currentMinutes;

  let urgency: SleepNotification['urgency'] = 'relaxed';
  if (timeUntilBed < 60) urgency = 'urgent'; // Less than 1 hour
  else if (timeUntilBed < 180) urgency = 'getting_late'; // Less than 3 hours

  return {
    message: `To wake up by ${wakeTime} tomorrow, be in bed by ${bedtime} tonight`,
    bedtime,
    wakeTime,
    windDownHours: WIND_DOWN_HOURS,
    tips: [
      "Put phone away 1 hour before bed (no blue light)",
      "Dim lights and do calming activity (reading, music)",
      "Avoid screens - they keep your ADHD brain alert",
      "Try a warm shower or light stretching to wind down"
    ],
    urgency
  };
}

/**
 * Get multiple sleep notifications for different scenarios
 */
export function getSleepScenarios(wakeTime: string) {
  const base = getSleepNotification(wakeTime);
  if (!base) return [];

  return [
    {
      ...base,
      title: "Ideal Sleep Schedule",
      description: "Follow this for best ADHD focus tomorrow"
    },
    {
      title: "Realistic Backup",
      message: `If you can't make ${base.bedtime}, aim for ${addHours(base.bedtime, 1)} at latest`,
      bedtime: addHours(base.bedtime, 1),
      windDownHours: base.windDownHours - 1,
      tips: base.tips,
      urgency: 'getting_late' as const
    }
  ];
}

/**
 * Helper to add hours to a time string
 */
function addHours(timeStr: string, hours: number): string {
  const minutes = parseTimeStringToMinutes(timeStr);
  if (!minutes) return timeStr;

  const newMinutes = (minutes + hours * 60) % (24 * 60);
  const newHours = Math.floor(newMinutes / 60);
  const newMins = newMinutes % 60;

  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
}

/**
 * Check if it's currently a good time to show sleep reminders
 */
export function shouldShowSleepReminder(): boolean {
  const now = new Date();
  const hour = now.getHours();

  // Show reminders in evening hours (6 PM - 11 PM)
  return hour >= 18 && hour <= 23;
}

