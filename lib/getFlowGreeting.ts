import { getMinutesFromDate, MINUTES_IN_DAY, parseTimeStringToMinutes } from './timeUtils';

export interface FlowGreetingResult {
  flow: string;
  emoji: string;
}

interface UserSettings {
  workStart?: string | null;
  workEnd?: string | null;
}

const FLOW_MAP = {
  morning: { flow: 'Morning flow', emoji: '🌅' },
  afternoon: { flow: 'Afternoon flow', emoji: '☀️' },
  focus: { flow: 'Focus flow', emoji: '🎯' },
  evening: { flow: 'Evening flow', emoji: '🌙' },
  winddown: { flow: 'Wind-down flow', emoji: '✨' },
} as const;

const DEFAULT_SETTINGS: Required<UserSettings> = {
  workStart: '08:00',
  workEnd: '18:00',
};

const DEFAULT_FALLBACK_RULES = [
  { start: 5 * 60, end: 11 * 60, flow: FLOW_MAP.morning },
  { start: 11 * 60, end: 14 * 60, flow: FLOW_MAP.focus },
  { start: 14 * 60, end: 16 * 60, flow: FLOW_MAP.afternoon },
  { start: 16 * 60, end: 20 * 60, flow: FLOW_MAP.evening },
] as const;

function getFallbackFlow(currentMinutes: number): FlowGreetingResult {
  for (const rule of DEFAULT_FALLBACK_RULES) {
    if (currentMinutes >= rule.start && currentMinutes < rule.end) {
      return rule.flow;
    }
  }
  return FLOW_MAP.winddown;
}

export function getFlowGreeting(
  currentTime: Date,
  userSettings: UserSettings = {}
): FlowGreetingResult {
  const workStart = userSettings.workStart ?? DEFAULT_SETTINGS.workStart;
  const workEnd = userSettings.workEnd ?? DEFAULT_SETTINGS.workEnd;

  const startMinutes = parseTimeStringToMinutes(workStart);
  const endMinutes = parseTimeStringToMinutes(workEnd);

  const currentMinutesRaw = getMinutesFromDate(currentTime);

  if (startMinutes === null || endMinutes === null) {
    return getFallbackFlow(currentMinutesRaw);
  }

  let adjustedEnd = endMinutes;
  if (endMinutes <= startMinutes) {
    adjustedEnd += MINUTES_IN_DAY;
  }

  const workWindow = adjustedEnd - startMinutes;

  let adjustedNow = currentMinutesRaw;
  if (adjustedEnd > MINUTES_IN_DAY && currentMinutesRaw < startMinutes) {
    adjustedNow += MINUTES_IN_DAY;
  }

  if (adjustedNow >= adjustedEnd || adjustedNow < startMinutes) {
    return FLOW_MAP.winddown;
  }

  const relativeMinutes = adjustedNow - startMinutes;

  if (workWindow < 240) {
    const third = workWindow / 3;
    if (relativeMinutes < third) return FLOW_MAP.morning;
    if (relativeMinutes < third * 2) return FLOW_MAP.focus;
    return FLOW_MAP.evening;
  }

  const focusStart = startMinutes + workWindow * 0.35;
  const focusEnd = startMinutes + workWindow * 0.65;
  if (adjustedNow >= focusStart && adjustedNow < focusEnd) {
    return FLOW_MAP.focus;
  }

  const midpoint = startMinutes + workWindow / 2;
  const eveningStart = Math.max(startMinutes, adjustedEnd - 120);

  if (adjustedNow < midpoint) {
    return FLOW_MAP.morning;
  }

  if (adjustedNow < eveningStart) {
    return FLOW_MAP.afternoon;
  }

  return FLOW_MAP.evening;
}
