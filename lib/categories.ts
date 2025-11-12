export interface CategoryOption {
  label: string;
  emoji: string;
}

export const DEFAULT_CATEGORY_OPTIONS: CategoryOption[] = [
  { label: 'Health', emoji: '💪' },
  { label: 'Errands', emoji: '🛍️' },
  { label: 'Home', emoji: '🏡' },
  { label: 'Work', emoji: '💼' },
  { label: 'School', emoji: '📚' },
];

const emojiMap: Record<string, string> = DEFAULT_CATEGORY_OPTIONS.reduce((acc, option) => {
  acc[option.label] = option.emoji;
  return acc;
}, {} as Record<string, string>);

export function getCategoryEmoji(category: string | null | undefined) {
  if (!category) return '';
  // Return emoji for default categories, empty string for custom tags
  return emojiMap[category] ?? '';
}

export function isDefaultCategory(category: string): boolean {
  return DEFAULT_CATEGORY_OPTIONS.some(opt => opt.label === category);
}

/**
 * Get all category options including custom tags
 * This should be used in components that need to display categories
 */
export async function getCategoryOptions(userId?: string): Promise<CategoryOption[]> {
  const defaultOptions = [...DEFAULT_CATEGORY_OPTIONS];
  
  if (!userId) {
    return defaultOptions;
  }

  try {
    const { getCustomTags } = await import('./supabase');
    const customTags = await getCustomTags(userId);
    
    // Add custom tags without emojis
    const customOptions: CategoryOption[] = customTags.map(tag => ({
      label: tag,
      emoji: '',
    }));
    
    return [...defaultOptions, ...customOptions];
  } catch (error) {
    console.error('Error loading custom tags:', error);
    return defaultOptions;
  }
}

// For backward compatibility
export const CATEGORY_OPTIONS = DEFAULT_CATEGORY_OPTIONS;
