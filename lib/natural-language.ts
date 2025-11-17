/**
 * Natural language parsing for task entry
 * Detects time mentions and extracts task description
 */

export interface ParsedTask {
  description: string;
  anchorType?: 'at' | 'while' | 'before' | 'after';
  anchorValue?: string;
}

/**
 * Parse natural language task input
 * Examples:
 * - "call doctor at 2pm" → description: "call doctor", anchor: at 14:00
 * - "buy groceries before dinner" → description: "buy groceries", anchor: before dinner
 * - "meditate while coffee brewing" → description: "meditate", anchor: while coffee brewing
 */
export function parseTaskInput(input: string): ParsedTask {
  const trimmed = input.trim();

  // Match "at [time]" pattern
  const atTimeMatch = trimmed.match(/(.+?)\s+at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)/i);
  if (atTimeMatch) {
    const description = atTimeMatch[1].trim();
    const timeStr = atTimeMatch[2].trim();
    const normalizedTime = normalizeTime(timeStr);

    if (normalizedTime) {
      return {
        description,
        anchorType: 'at',
        anchorValue: normalizedTime,
      };
    }
  }

  // Match "before [activity]" pattern
  const beforeMatch = trimmed.match(/(.+?)\s+before\s+(.+)/i);
  if (beforeMatch) {
    return {
      description: beforeMatch[1].trim(),
      anchorType: 'before',
      anchorValue: beforeMatch[2].trim(),
    };
  }

  // Match "after [activity]" pattern
  const afterMatch = trimmed.match(/(.+?)\s+after\s+(.+)/i);
  if (afterMatch) {
    return {
      description: afterMatch[1].trim(),
      anchorType: 'after',
      anchorValue: afterMatch[2].trim(),
    };
  }

  // Match "while [activity]" pattern
  const whileMatch = trimmed.match(/(.+?)\s+while\s+(.+)/i);
  if (whileMatch) {
    return {
      description: whileMatch[1].trim(),
      anchorType: 'while',
      anchorValue: whileMatch[2].trim(),
    };
  }

  // No pattern matched - return as-is
  return {
    description: trimmed,
  };
}

/**
 * Normalize various time formats to HH:MM (24-hour)
 * Examples:
 * - "2pm" → "14:00"
 * - "2:30pm" → "14:30"
 * - "14:30" → "14:30"
 * - "2" → "14:00" (assumes PM for single digits 1-11, AM for 12)
 */
function normalizeTime(timeStr: string): string | null {
  const cleaned = timeStr.toLowerCase().trim();

  // Match HH:MM am/pm
  const timeWithMinutes = cleaned.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
  if (timeWithMinutes) {
    let hours = parseInt(timeWithMinutes[1], 10);
    const minutes = parseInt(timeWithMinutes[2], 10);
    const meridiem = timeWithMinutes[3];

    if (meridiem === 'pm' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Match H am/pm or just H
  const hourOnly = cleaned.match(/(\d{1,2})\s*(am|pm)?/);
  if (hourOnly) {
    let hours = parseInt(hourOnly[1], 10);
    const meridiem = hourOnly[2];

    if (meridiem === 'pm' && hours < 12) {
      hours += 12;
    } else if (meridiem === 'am' && hours === 12) {
      hours = 0;
    } else if (!meridiem) {
      // Assume afternoon for 1-11, otherwise leave as-is
      if (hours >= 1 && hours < 12) {
        hours += 12;
      }
    }

    return `${hours.toString().padStart(2, '0')}:00`;
  }

  return null;
}

/**
 * Detect task complexity from keywords in description
 */
export function suggestComplexity(description: string): 'quick' | 'medium' | 'deep' {
  const lower = description.toLowerCase();

  // Quick task keywords
  const quickKeywords = ['call', 'email', 'text', 'message', 'pay', 'order', 'buy', 'check', 'respond', 'reply', 'quick', 'refill'];
  if (quickKeywords.some(keyword => lower.includes(keyword))) {
    return 'quick';
  }

  // Deep task keywords
  const deepKeywords = ['research', 'write', 'plan', 'design', 'implement', 'build', 'create', 'develop', 'analyze', 'study', 'learn', 'complete'];
  if (deepKeywords.some(keyword => lower.includes(keyword))) {
    return 'deep';
  }

  // Default to medium
  return 'medium';
}
