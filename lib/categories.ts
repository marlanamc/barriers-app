export interface CategoryOption {
  label: string;
  emoji: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'Admin', emoji: '📋' },
  { label: 'Community', emoji: '🤝' },
  { label: 'Creative', emoji: '🎨' },
  { label: 'Errands', emoji: '🛍️' },
  { label: 'Finances', emoji: '💰' },
  { label: 'Fun', emoji: '🎉' },
  { label: 'Health', emoji: '💪' },
  { label: 'Home', emoji: '🏡' },
  { label: 'Learning', emoji: '📚' },
  { label: 'Relationships', emoji: '❤️' },
  { label: 'Rest', emoji: '😴' },
  { label: 'Work', emoji: '💼' },
];

const emojiMap: Record<string, string> = CATEGORY_OPTIONS.reduce((acc, option) => {
  acc[option.label] = option.emoji;
  return acc;
}, {} as Record<string, string>);

export function getCategoryEmoji(category: string | null | undefined) {
  if (!category) return '';
  return emojiMap[category] ?? '';
}
