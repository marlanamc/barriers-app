/**
 * Time formatting utilities
 * Default to 12-hour format (ADHD-friendly, easier to read)
 */

/**
 * Convert 24-hour time string (HH:MM) to 12-hour format
 * @param time24 - Time in 24-hour format like "14:30"
 * @param use24Hour - Whether to use 24-hour format (default: false)
 * @returns Formatted time like "2:30 PM" or "14:30"
 */
export function formatTime(time24: string, use24Hour: boolean = false): string {
  if (use24Hour) return time24;

  const [hours, minutes] = time24.split(':').map(Number);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Convert minutes since midnight to formatted time
 * @param minutes - Minutes since midnight (0-1439)
 * @param use24Hour - Whether to use 24-hour format (default: false)
 * @returns Formatted time
 */
export function formatMinutesToTime(minutes: number, use24Hour: boolean = false): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const time24 = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

  return formatTime(time24, use24Hour);
}

/**
 * Get user's time format preference from localStorage
 * Defaults to 12-hour format
 */
export function getTimeFormatPreference(): boolean {
  if (typeof window === 'undefined') return false;

  const saved = localStorage.getItem('timeFormat');
  return saved === '24hour';
}

/**
 * Save user's time format preference
 */
export function setTimeFormatPreference(use24Hour: boolean): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem('timeFormat', use24Hour ? '24hour' : '12hour');
}
