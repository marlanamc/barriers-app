import type { TaskAnchorType, TaskAnchor } from './checkin-context';
import { getAnchorPresets } from './supabase';

// Default anchor suggestions
export const defaultWhileSuggestions = [
  "while watching TV",
  "while listening to music",
  "while listening to a podcast",
  "while listening to an audiobook",
  "while waiting for laundry",
  "while talking to a friend",
];

export const defaultBeforeSuggestions = [
  "before opening email",
  "before the kids wake up",
  "before leaving for work",
  "before scrolling social media",
];

export const defaultAfterSuggestions = [
  "after lunch",
  "after a shower",
  "after walking the dog",
  "after dinner cleanup",
];

export const defaultAnchorSuggestionMap: Partial<Record<TaskAnchorType, string[]>> = {
  while: defaultWhileSuggestions,
  before: defaultBeforeSuggestions,
  after: defaultAfterSuggestions,
};

/**
 * Get merged anchor suggestions (defaults + user presets)
 * Returns defaults if userId is not provided or if there's an error
 */
export async function getMergedAnchorSuggestions(
  anchorType: Exclude<TaskAnchorType, 'at'>,
  userId?: string | null
): Promise<string[]> {
  const defaults = defaultAnchorSuggestionMap[anchorType] || [];
  
  if (!userId) {
    return defaults;
  }

  try {
    const userPresets = await getAnchorPresets(userId, anchorType);
    // Merge: user presets first, then defaults (avoiding duplicates)
    const merged = [...userPresets];
    defaults.forEach((defaultSuggestion) => {
      if (!merged.includes(defaultSuggestion)) {
        merged.push(defaultSuggestion);
      }
    });
    return merged;
  } catch (error) {
    console.error('Error loading user anchor presets:', error);
    return defaults;
  }
}

function formatTimeFromValue(value: string) {
  const trimmed = value.trim();
  const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?/.exec(trimmed);
  if (!match) {
    return trimmed;
  }

  const hours = Number(match[1]);
  const minutes = match[2];
  if (Number.isNaN(hours)) {
    return trimmed;
  }

  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = ((hours + 11) % 12) + 1;
  return `${normalizedHour}:${minutes} ${suffix}`;
}

function stripKeywordPrefix(value: string, keyword: string) {
  const regex = new RegExp(`^${keyword}\\s+`, 'i');
  return value.replace(regex, '').replace(/^\s+/, '');
}

export function cleanAnchorInput(anchorType: TaskAnchorType, value?: string | null) {
  if (!value) return '';
  const withoutLeadingSpaces = value.replace(/^\s+/, '');
  if (anchorType === 'at') {
    return withoutLeadingSpaces;
  }
  if (anchorType === 'while' || anchorType === 'before' || anchorType === 'after') {
    return stripKeywordPrefix(withoutLeadingSpaces, anchorType);
  }
  return withoutLeadingSpaces;
}

export function anchorValueForDisplay(
  anchorType?: TaskAnchorType | null,
  anchorValue?: string | null
) {
  if (!anchorType || !anchorValue) return '';
  const cleaned = cleanAnchorInput(anchorType, anchorValue).trim();
  if (!cleaned) return '';
  if (anchorType === 'at') {
    return formatTimeFromValue(cleaned);
  }
  return cleaned;
}

export function anchorLabel(anchorType?: TaskAnchorType | null, anchorValue?: string | null) {
  const formatted = anchorValueForDisplay(anchorType, anchorValue);
  if (!anchorType || !formatted) return '';
  return `${anchorType} ${formatted}`;
}

export function buildAnchorPhrase(
  title: string,
  anchorType?: TaskAnchorType | null,
  anchorValue?: string | null
) {
  const label = anchorLabel(anchorType, anchorValue);
  if (!label) return title;
  return `${title} ${label}`;
}

export function formatAnchorValue(anchorType?: TaskAnchorType | null, anchorValue?: string | null) {
  return anchorValueForDisplay(anchorType, anchorValue);
}

/**
 * Build a natural language phrase from multiple anchors
 * Examples:
 *  - [at 3pm] → "at 3:00 PM"
 *  - [at 3pm, while listening to music] → "at 3:00 PM while listening to music"
 *  - [after lunch, before opening email] → "after lunch and before opening email"
 */
export function buildMultipleAnchorsPhrase(anchors: TaskAnchor[]): string {
  if (!anchors || anchors.length === 0) return '';

  if (anchors.length === 1) {
    return anchorLabel(anchors[0].type, anchors[0].value);
  }

  const parts: string[] = [];

  for (let i = 0; i < anchors.length; i++) {
    const anchor = anchors[i];
    const label = anchorLabel(anchor.type, anchor.value);
    if (!label) continue;

    if (i === 0) {
      parts.push(label);
    } else if (i === anchors.length - 1) {
      // Last item - use "and" if same type, otherwise just append
      const prevType = anchors[i - 1].type;
      if (prevType === anchor.type) {
        parts.push(`and ${label}`);
      } else {
        parts.push(label);
      }
    } else {
      parts.push(label);
    }
  }

  return parts.join(' ');
}

/**
 * Build a complete phrase with title and multiple anchors
 * Example: "Take morning meds at 8:00 AM while making coffee"
 */
export function buildPhraseWithMultipleAnchors(title: string, anchors?: TaskAnchor[]): string {
  if (!anchors || anchors.length === 0) return title;
  const anchorPhrase = buildMultipleAnchorsPhrase(anchors);
  if (!anchorPhrase) return title;
  return `${title} ${anchorPhrase}`;
}
