/**
 * Energy Schedule Presets
 *
 * Based on real ADHD medication patterns and natural energy rhythms.
 * These provide smart defaults that users can customize.
 */

import type { EnergyLevel } from './capacity';

export interface EnergySchedulePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  schedule: Array<{
    time: string; // HH:MM format
    energyLevel: EnergyLevel;
    label?: string;
  }>;
}

export const ENERGY_PRESETS: EnergySchedulePreset[] = [
  {
    id: 'xr-classic',
    name: 'XR Meds: Classic 2-Phase',
    description: 'Extended release stimulant with typical 9am-1pm peak',
    icon: '💊',
    schedule: [
      { time: '07:00', energyLevel: 'foggy', label: 'Wake up' },
      { time: '08:00', energyLevel: 'flowing', label: 'Meds kicking in' },
      { time: '09:00', energyLevel: 'sparky', label: 'Peak - best deep work' },
      { time: '13:00', energyLevel: 'steady', label: 'Still functional' },
      { time: '15:00', energyLevel: 'flowing', label: 'Slow fade begins' },
      { time: '17:00', energyLevel: 'foggy', label: 'Crash - task paralysis' },
      { time: '19:00', energyLevel: 'resting', label: 'Evening shutdown' },
    ],
  },
  {
    id: 'xr-late',
    name: 'XR Meds: Late Onset',
    description: 'Slower meds response, 10am-2pm peak window',
    icon: '💊',
    schedule: [
      { time: '08:00', energyLevel: 'foggy', label: 'Long warm-up' },
      { time: '10:00', energyLevel: 'sparky', label: 'Peak (shorter window)' },
      { time: '14:00', energyLevel: 'steady', label: 'Fading' },
      { time: '16:00', energyLevel: 'foggy', label: 'Crash zone' },
      { time: '19:00', energyLevel: 'resting', label: 'Evening mode' },
    ],
  },
  {
    id: 'ir-twice',
    name: 'IR Meds: Twice Daily',
    description: 'Two IR doses with spikes (not smooth curves)',
    icon: '⚡',
    schedule: [
      { time: '08:00', energyLevel: 'foggy', label: 'Wake up' },
      { time: '09:00', energyLevel: 'sparky', label: '1st dose peak' },
      { time: '11:30', energyLevel: 'flowing', label: 'Fading' },
      { time: '12:00', energyLevel: 'foggy', label: 'Crash - need food' },
      { time: '13:00', energyLevel: 'flowing', label: '2nd dose kicking in' },
      { time: '14:00', energyLevel: 'sparky', label: '2nd peak window' },
      { time: '17:00', energyLevel: 'steady', label: 'Tapering off' },
      { time: '19:00', energyLevel: 'foggy', label: 'Crash - irritability' },
      { time: '21:00', energyLevel: 'resting', label: 'Evening shutdown' },
    ],
  },
  {
    id: 'ir-single',
    name: 'IR Meds: Single Dose',
    description: 'Short but strong morning peak, then crash',
    icon: '⚡',
    schedule: [
      { time: '08:00', energyLevel: 'foggy', label: 'Wake up' },
      { time: '09:00', energyLevel: 'sparky', label: 'Short peak' },
      { time: '11:00', energyLevel: 'flowing', label: 'Fading fast' },
      { time: '14:00', energyLevel: 'foggy', label: 'Crash' },
      { time: '18:00', energyLevel: 'resting', label: 'Evening mode' },
    ],
  },
  {
    id: 'unmed-afternoon',
    name: 'Unmedicated: Afternoon Peak',
    description: 'Natural ADHD - slow start, 1-4pm hyperfocus window',
    icon: '🧠',
    schedule: [
      { time: '09:00', energyLevel: 'foggy', label: 'Slow start' },
      { time: '11:00', energyLevel: 'flowing', label: 'Warming up' },
      { time: '13:00', energyLevel: 'sparky', label: 'Natural hyperfocus' },
      { time: '16:00', energyLevel: 'steady', label: 'Tapering' },
      { time: '18:00', energyLevel: 'foggy', label: 'Decision fatigue' },
      { time: '21:00', energyLevel: 'resting', label: 'Comfort zone' },
    ],
  },
  {
    id: 'unmed-night',
    name: 'Unmedicated: Night Burst',
    description: 'All-day fog + surprise 8-10pm hyperfocus',
    icon: '🧠',
    schedule: [
      { time: '10:00', energyLevel: 'foggy', label: 'Brain refuses to boot' },
      { time: '14:00', energyLevel: 'flowing', label: 'First functional window' },
      { time: '17:00', energyLevel: 'steady', label: 'Random competence spike' },
      { time: '20:00', energyLevel: 'sparky', label: 'Night hyperfocus!' },
      { time: '22:00', energyLevel: 'flowing', label: 'Hard to wind down' },
      { time: '01:00', energyLevel: 'resting', label: 'Finally tired' },
    ],
  },
  {
    id: 'night-owl',
    name: 'Night Owl: Extreme Evening',
    description: '4-8pm primary productivity window',
    icon: '🦉',
    schedule: [
      { time: '11:00', energyLevel: 'foggy', label: 'Barely human' },
      { time: '13:00', energyLevel: 'flowing', label: 'Warm-up period' },
      { time: '16:00', energyLevel: 'sparky', label: 'Primary work window' },
      { time: '20:00', energyLevel: 'steady', label: 'Still going' },
      { time: '22:00', energyLevel: 'flowing', label: 'Fading' },
      { time: '01:00', energyLevel: 'resting', label: 'Screen time trap' },
    ],
  },
  {
    id: 'night-owl-intense',
    name: 'Night Owl: Delayed Hyperfocus',
    description: '6-10pm intense creative peak',
    icon: '🦉',
    schedule: [
      { time: '12:00', energyLevel: 'foggy', label: 'Like anesthesia' },
      { time: '15:00', energyLevel: 'flowing', label: 'Slowly waking' },
      { time: '18:00', energyLevel: 'sparky', label: 'Best creative work' },
      { time: '22:00', energyLevel: 'steady', label: 'Still functional' },
      { time: '01:00', energyLevel: 'resting', label: "Brain won't shut off" },
    ],
  },
  {
    id: 'early-bird',
    name: 'Early Bird: Morning Peak',
    description: 'Rare unicorn - 6-11am best hours',
    icon: '🐦',
    schedule: [
      { time: '05:30', energyLevel: 'steady', label: 'Quiet house magic' },
      { time: '07:00', energyLevel: 'sparky', label: 'Best deep work' },
      { time: '11:00', energyLevel: 'steady', label: 'Still good' },
      { time: '14:00', energyLevel: 'flowing', label: 'Fading' },
      { time: '17:00', energyLevel: 'foggy', label: 'Slump hits HARD' },
      { time: '19:00', energyLevel: 'resting', label: 'Shutdown' },
    ],
  },
  {
    id: 'early-bird-split',
    name: 'Early Bird: Split Peak',
    description: 'Morning peak + weird afternoon second wind',
    icon: '🐦',
    schedule: [
      { time: '06:00', energyLevel: 'sparky', label: 'Morning peak' },
      { time: '09:00', energyLevel: 'steady', label: 'Cruising' },
      { time: '13:00', energyLevel: 'foggy', label: 'Crash' },
      { time: '15:00', energyLevel: 'flowing', label: 'Weird second wind' },
      { time: '17:00', energyLevel: 'resting', label: 'Evening shutdown' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom Schedule',
    description: 'Start from scratch and build your own',
    icon: '✨',
    schedule: [
      { time: '09:00', energyLevel: 'steady', label: '' },
      { time: '17:00', energyLevel: 'resting', label: '' },
    ],
  },
];

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): EnergySchedulePreset | null {
  return ENERGY_PRESETS.find(p => p.id === id) || null;
}

/**
 * Convert preset schedule to database format
 */
export function presetToDbSchedule(preset: EnergySchedulePreset, userId: string, dayType: string = 'all') {
  return preset.schedule.map((item, index) => {
    const [hours, minutes] = item.time.split(':').map(Number);
    const startTimeMinutes = hours * 60 + minutes;

    return {
      user_id: userId,
      start_time_minutes: startTimeMinutes,
      energy_key: item.energyLevel,
      label: item.label || null,
      day_type: dayType,
      notify_on_transition: false,
      is_active: true,
    };
  });
}
