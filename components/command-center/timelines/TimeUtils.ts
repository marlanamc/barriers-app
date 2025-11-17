'use client';

export type TimelineMode = 'day' | 'evening' | 'sleep';

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  return (h * 60 + m + 24 * 60) % (24 * 60);
}

export function isBetween(
  nowMinutes: number,
  startMinutes: number,
  endMinutes: number,
  allowWrap = true
): boolean {
  if (startMinutes === endMinutes) return true;
  if (endMinutes > startMinutes) {
    return nowMinutes >= startMinutes && nowMinutes < endMinutes;
  }
  // wrap across midnight
  return allowWrap ? nowMinutes >= startMinutes || nowMinutes < endMinutes : false;
}

export function getTimelineMode(
  now: Date,
  wakeTime: string,
  hardStopTime: string,
  bedTime: string
): TimelineMode {
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const wake = timeToMinutes(wakeTime);
  const stop = timeToMinutes(hardStopTime);
  const bed = timeToMinutes(bedTime);

  if (isBetween(nowMinutes, wake, stop, true)) return 'day';
  if (isBetween(nowMinutes, stop, bed, true)) return 'evening';
  return 'sleep';
}
