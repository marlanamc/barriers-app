import type { TaskAnchorType } from './checkin-context';

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
