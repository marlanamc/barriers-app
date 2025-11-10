/**
 * Recurrence utility functions for planned items
 * Determines if a recurring item applies to a given date
 */

export type RecurrenceType = 'once' | 'daily' | 'weekly' | 'monthly';

export interface PlannedItemRecurrence {
  recurrenceType: RecurrenceType;
  startDate: string; // ISO date string YYYY-MM-DD
  endDate?: string | null; // ISO date string or null for no end
  recurrenceDays?: number[] | null; // For weekly: [0=Sun, 1=Mon, ..., 6=Sat]
}

/**
 * Check if a planned item applies to a specific date
 * @param date - Target date to check (ISO string YYYY-MM-DD)
 * @param recurrence - Recurrence settings
 * @returns true if the item should appear on this date
 */
export function appliesToDate(
  date: string,
  recurrence: PlannedItemRecurrence
): boolean {
  const targetDate = new Date(date + 'T00:00:00'); // Parse as local date
  const start = new Date(recurrence.startDate + 'T00:00:00');
  const end = recurrence.endDate ? new Date(recurrence.endDate + 'T00:00:00') : null;

  // Check if date is within range
  if (targetDate < start) return false;
  if (end && targetDate > end) return false;

  // Handle different recurrence types
  switch (recurrence.recurrenceType) {
    case 'once':
      return date === recurrence.startDate;

    case 'daily':
      return true; // Already checked date range above

    case 'weekly':
      if (!recurrence.recurrenceDays || recurrence.recurrenceDays.length === 0) {
        return false;
      }
      const dayOfWeek = targetDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
      return recurrence.recurrenceDays.includes(dayOfWeek);

    case 'monthly':
      // Occurs on the same day of month
      return targetDate.getDate() === start.getDate();

    default:
      return false;
  }
}

/**
 * Get all dates a recurring item applies to within a range
 * @param recurrence - Recurrence settings
 * @param rangeStart - Start of date range (ISO string)
 * @param rangeEnd - End of date range (ISO string)
 * @param maxResults - Maximum number of dates to return (default 100)
 * @returns Array of ISO date strings
 */
export function getApplicableDates(
  recurrence: PlannedItemRecurrence,
  rangeStart: string,
  rangeEnd: string,
  maxResults = 100
): string[] {
  const dates: string[] = [];
  const start = new Date(Math.max(
    new Date(rangeStart + 'T00:00:00').getTime(),
    new Date(recurrence.startDate + 'T00:00:00').getTime()
  ));
  const end = new Date(rangeEnd + 'T00:00:00');

  if (recurrence.endDate) {
    const recurrenceEnd = new Date(recurrence.endDate + 'T00:00:00');
    if (recurrenceEnd < end) {
      end.setTime(recurrenceEnd.getTime());
    }
  }

  let current = new Date(start);
  let iterations = 0;

  while (current <= end && iterations < maxResults) {
    const dateStr = current.toISOString().split('T')[0];
    if (appliesToDate(dateStr, recurrence)) {
      dates.push(dateStr);
    }

    // Move to next day
    current.setDate(current.getDate() + 1);
    iterations++;
  }

  return dates;
}

/**
 * Get human-readable description of recurrence pattern
 */
export function getRecurrenceDescription(recurrence: PlannedItemRecurrence): string {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  switch (recurrence.recurrenceType) {
    case 'once':
      return `Once on ${formatDate(recurrence.startDate)}`;

    case 'daily':
      if (recurrence.endDate) {
        return `Daily until ${formatDate(recurrence.endDate)}`;
      }
      return 'Daily';

    case 'weekly':
      if (!recurrence.recurrenceDays || recurrence.recurrenceDays.length === 0) {
        return 'Weekly';
      }
      const days = recurrence.recurrenceDays
        .sort((a, b) => a - b)
        .map(d => dayNames[d])
        .join(', ');
      if (recurrence.endDate) {
        return `Every ${days} until ${formatDate(recurrence.endDate)}`;
      }
      return `Every ${days}`;

    case 'monthly':
      const start = new Date(recurrence.startDate + 'T00:00:00');
      const dayOfMonth = start.getDate();
      const suffix = getDayOrdinalSuffix(dayOfMonth);
      if (recurrence.endDate) {
        return `Monthly on the ${dayOfMonth}${suffix} until ${formatDate(recurrence.endDate)}`;
      }
      return `Monthly on the ${dayOfMonth}${suffix}`;

    default:
      return 'Unknown pattern';
  }
}

/**
 * Format ISO date string to readable format
 */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get ordinal suffix for day of month (1st, 2nd, 3rd, etc.)
 */
function getDayOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}
