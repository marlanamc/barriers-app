/**
 * Validate if a date string is in YYYY-MM-DD format
 * @param dateStr - Date string to validate
 * @returns true if valid, false otherwise
 */
export function isValidDateString(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') return false;
  
  // Check format YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateStr + 'T00:00:00');
  if (isNaN(date.getTime())) return false;
  
  // Check if the parsed date matches the input (prevents invalid dates like 2024-02-30)
  const [year, month, day] = dateStr.split('-').map(Number);
  return date.getFullYear() === year && 
         date.getMonth() + 1 === month && 
         date.getDate() === day;
}

/**
 * Parse a date string safely
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Date object or null if invalid
 */
export function parseDateString(dateStr: string): Date | null {
  if (!isValidDateString(dateStr)) return null;
  const date = new Date(dateStr + 'T00:00:00');
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Get today's date as a YYYY-MM-DD string in local timezone
 * This ensures the date matches the user's local date, not UTC
 */
export function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a Date object to YYYY-MM-DD string in local timezone
 * @param date - Date object to format
 * @returns YYYY-MM-DD string or empty string if invalid
 */
export function formatDateToLocalString(date: Date): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date passed to formatDateToLocalString');
    return '';
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

