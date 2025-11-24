/**
 * In-App Barrier Help System
 *
 * Provides immediate, contextual help for ADHD barriers without leaving the app.
 * Based on ADHD First Aid Kit content but optimized for in-app display.
 */

export interface BarrierHelp {
  slug: string;
  title: string;
  category: string;
  quickWhy: string; // 1-2 sentences explaining why this happens
  immediateTips: string[]; // 2-4 actionable tips (30 seconds to read)
  reminder: string; // Encouraging phrase
  fullArticleUrl?: string; // Optional link to full article
}

export const BARRIER_HELP_DATABASE: Record<string, BarrierHelp> = {
  // Getting Started Barriers
  'cant-start': {
    slug: 'cant-start',
    title: 'I Can\'t Start',
    category: 'Getting Started',
    quickWhy: 'Your ADHD brain gets overwhelmed by the thought of starting, creating a paralysis loop where nothing gets done.',
    immediateTips: [
      'Set a 5-minute timer and commit to working for just that long',
      'Break the task into the absolute smallest first step',
      'Tell yourself: "I don\'t have to finish, I just have to start"'
    ],
    reminder: 'Starting is the hardest part - you\'ve got this',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/cant-start'
  },

  'keep-avoiding': {
    slug: 'keep-avoiding',
    title: 'I Keep Avoiding It',
    category: 'Getting Started',
    quickWhy: 'Avoidance feels easier than the discomfort of starting a difficult task, but it creates more stress long-term.',
    immediateTips: [
      'Schedule the task for a specific time when you have more energy',
      'Pair it with something enjoyable (music, favorite drink)',
      'Use the "just 10 minutes" rule - you can stop after that'
    ],
    reminder: 'Avoidance steals your peace - face it and feel free',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/keep-avoiding'
  },

  'feel-frozen': {
    slug: 'feel-frozen',
    title: 'I Feel Frozen',
    category: 'Getting Started',
    quickWhy: 'Decision paralysis and overwhelm create a "frozen" state where you can\'t choose what to do next.',
    immediateTips: [
      'Pick the easiest thing on your list right now',
      'Set a 2-minute timer to make one small decision',
      'Ask yourself: "What\'s the smallest step I can take?"'
    ],
    reminder: 'Movement breaks the freeze - take one tiny step',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/feel-frozen'
  },

  // Decision & Planning Barriers
  'overwhelm': {
    slug: 'overwhelm',
    title: 'Overwhelm Barrier',
    category: 'Decision & Planning',
    quickWhy: 'Your ADHD brain sees all the steps at once instead of breaking them down, creating immediate overwhelm.',
    immediateTips: [
      'Write down just the first 3 steps',
      'Set a timer for 10 minutes of focused work',
      'Tell yourself: "I only need to do this for 10 minutes"'
    ],
    reminder: 'Break it down - you don\'t have to see the whole mountain',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/overwhelm'
  },

  'decision-paralysis': {
    slug: 'decision-paralysis',
    title: 'Decision Paralysis',
    category: 'Decision & Planning',
    quickWhy: 'Too many choices overwhelm your executive function, making it hard to pick what to do first.',
    immediateTips: [
      'Pick the first thing that comes to mind',
      'Use a coin flip for small decisions',
      'Set a 1-minute timer to make the choice'
    ],
    reminder: 'Done is better than perfect - make the call',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/decision-paralysis'
  },

  'time-blindness': {
    slug: 'time-blindness',
    title: 'Time Blindness',
    category: 'Memory & Time',
    quickWhy: 'ADHD affects your perception of time, making it hard to judge how long tasks take or when to start them.',
    immediateTips: [
      'Set phone reminders 15 minutes before you need to start',
      'Use a visible timer for each task segment',
      'Break tasks into 25-minute focused blocks'
    ],
    reminder: 'Time is your friend when you make it visible',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/time-blindness'
  },

  'forgetting': {
    slug: 'forgetting',
    title: 'Forgetting Things',
    category: 'Memory & Time',
    quickWhy: 'Working memory challenges make it easy to forget tasks, deadlines, or what you were doing.',
    immediateTips: [
      'Put reminders in visible places (phone, notes app)',
      'Use voice memos for quick task capture',
      'Create "if-then" plans: "If I finish this, then I\'ll reward myself"'
    ],
    reminder: 'Your memory isn\'t broken - it just needs better tools',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/forgetting'
  },

  // Energy & Focus Barriers
  'brain-fog': {
    slug: 'brain-fog',
    title: 'Brain Fog',
    category: 'Energy & Focus',
    quickWhy: 'Low energy states create mental fog where focus and decision-making become difficult.',
    immediateTips: [
      'Take a 5-minute walk to increase blood flow',
      'Drink water and have a small protein snack',
      'Do the easiest task on your list first'
    ],
    reminder: 'Fog lifts with movement and fuel',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/brain-fog'
  },

  'distraction': {
    slug: 'distraction',
    title: 'Easily Distracted',
    category: 'Energy & Focus',
    quickWhy: 'Your ADHD brain gets pulled toward novel stimuli, breaking focus on the current task.',
    immediateTips: [
      'Create a distraction-free environment (close extra tabs)',
      'Use noise-cancelling headphones with focus music',
      'Set a timer and commit to staying focused until it rings'
    ],
    reminder: 'Distraction is normal - bring yourself back gently',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/distraction'
  },

  // Emotional Blocks
  'self-doubt': {
    slug: 'self-doubt',
    title: 'Self-Doubt',
    category: 'Emotional Blocks',
    quickWhy: 'Past experiences with ADHD challenges create doubt about your ability to succeed.',
    immediateTips: [
      'List 3 things you\'ve successfully done recently',
      'Talk to yourself like you would a friend',
      'Focus on progress, not perfection'
    ],
    reminder: 'You are capable - doubt is just a feeling',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/self-doubt'
  },

  'frustration': {
    slug: 'frustration',
    title: 'Frustration Build-Up',
    category: 'Emotional Blocks',
    quickWhy: 'Repeated ADHD challenges can build frustration, making it harder to start new tasks.',
    immediateTips: [
      'Take 3 deep breaths before starting',
      'Write down what\'s frustrating you',
      'Break the task into smaller, winnable pieces'
    ],
    reminder: 'Frustration is valid - be kind to yourself',
    fullArticleUrl: 'https://adhd-first-aid.vercel.app/barriers/frustration'
  }
};

/**
 * Get barrier help by slug
 */
export function getBarrierHelp(slug: string): BarrierHelp | null {
  return BARRIER_HELP_DATABASE[slug] || null;
}

/**
 * Get all barriers in a category
 */
export function getBarriersByCategory(category: string): BarrierHelp[] {
  return Object.values(BARRIER_HELP_DATABASE).filter(
    barrier => barrier.category === category
  );
}

/**
 * Get all available barrier categories
 */
export function getBarrierCategories(): string[] {
  const categories = new Set(
    Object.values(BARRIER_HELP_DATABASE).map(b => b.category)
  );
  return Array.from(categories);
}

/**
 * Search barriers by title or description
 */
export function searchBarriers(query: string): BarrierHelp[] {
  const lowercaseQuery = query.toLowerCase();
  return Object.values(BARRIER_HELP_DATABASE).filter(barrier =>
    barrier.title.toLowerCase().includes(lowercaseQuery) ||
    barrier.quickWhy.toLowerCase().includes(lowercaseQuery) ||
    barrier.category.toLowerCase().includes(lowercaseQuery)
  );
}
