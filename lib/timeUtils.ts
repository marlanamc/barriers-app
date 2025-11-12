const MINUTES_IN_DAY = 24 * 60;

export function parseTimeStringToMinutes(time: string | null | undefined): number | null {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export function getMinutesFromDate(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export { MINUTES_IN_DAY };
