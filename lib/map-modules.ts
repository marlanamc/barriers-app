// Map module definitions with prompts, descriptions, and metadata
// Used by the Map page and individual module editors

// Icon names from Lucide - these map to lucide-react components
export type LucideIconName =
  | 'Heart'
  | 'Fuel'
  | 'Star'
  | 'Target'
  | 'Home'
  | 'Anchor'
  | 'Compass'
  | 'Wind'
  | 'CloudLightning'
  | 'AlertTriangle'
  | 'LifeBuoy'
  | 'Bell'
  | 'Users'
  | 'BookOpen'
  | 'Sparkles';

export interface ModuleDefinition {
  key: string;
  iconName: LucideIconName;
  iconColor: string; // Tailwind color classes for icon
  title: string;
  shortDescription: string;
  fullDescription: string;
  promptQuestion: string;
  suggestions: string[];
  editorType: 'text' | 'list' | 'special';
  href: string;
}

export interface SectionDefinition {
  id: string;
  title: string;
  modules: string[];
}

// All 13 modules organized by their keys
export const MAP_MODULES: Record<string, ModuleDefinition> = {
  // Dockside Prep
  life_vest: {
    key: 'life_vest',
    iconName: 'Heart',
    iconColor: 'text-rose-500 dark:text-rose-400',
    title: 'Life Vest',
    shortDescription: 'Self-compassion tools',
    fullDescription: 'What grounds you when things feel overwhelming? These are your go-to tools for staying afloat.',
    promptQuestion: 'What helps you feel calmer or more grounded?',
    suggestions: [
      'deep breathing',
      'stepping outside',
      'cold water on face',
      'favorite music',
      'texting someone',
      'weighted blanket',
      'stretching',
      'petting an animal',
    ],
    editorType: 'special',
    href: '/map/life-vest',
  },

  fuel_habits: {
    key: 'fuel_habits',
    iconName: 'Fuel',
    iconColor: 'text-amber-500 dark:text-amber-400',
    title: 'Fuel Up',
    shortDescription: 'Regulation habits',
    fullDescription: 'What helps you stay regulated throughout the day? These are the basic needs that keep your brain running smoothly.',
    promptQuestion: 'What do you need to check in on regularly?',
    suggestions: [
      'water',
      'food/snacks',
      'medication',
      'movement',
      'sleep quality',
      'caffeine timing',
      'fresh air',
      'social connection',
    ],
    editorType: 'list',
    href: '/map/fuel-habits',
  },

  north_star: {
    key: 'north_star',
    iconName: 'Star',
    iconColor: 'text-yellow-500 dark:text-yellow-400',
    title: 'North Star',
    shortDescription: 'Core values',
    fullDescription: 'Your North Star is your "why" - the deeper reason behind what you do. It helps you make choices that feel right.',
    promptQuestion: 'Why does any of this matter to you?',
    suggestions: [
      'family',
      'creativity',
      'independence',
      'helping others',
      'growth',
      'peace',
      'adventure',
      'connection',
    ],
    editorType: 'text',
    href: '/map/north-star',
  },

  // Destination
  destination: {
    key: 'destination',
    iconName: 'Target',
    iconColor: 'text-red-500 dark:text-red-400',
    title: 'Destination',
    shortDescription: 'Main goal',
    fullDescription: 'What are you working toward right now? This is your current focus - not forever, just for this chapter.',
    promptQuestion: 'What\'s the main thing you\'re trying to accomplish?',
    suggestions: [
      'launch a project',
      'build a habit',
      'finish a course',
      'find a job',
      'move somewhere',
      'improve health',
      'learn a skill',
      'save money',
    ],
    editorType: 'text',
    href: '/map/destination',
  },

  lighthouse: {
    key: 'lighthouse',
    iconName: 'Home',
    iconColor: 'text-sky-500 dark:text-sky-400',
    title: 'Lighthouse',
    shortDescription: 'Long-term vision',
    fullDescription: 'Your Lighthouse is where you\'re heading in the bigger picture - the life you\'re building toward.',
    promptQuestion: 'What does your ideal life look like in 6 months to a year?',
    suggestions: [
      'more stability',
      'creative freedom',
      'stronger relationships',
      'better health',
      'financial security',
      'meaningful work',
      'more time for hobbies',
      'feeling proud',
    ],
    editorType: 'text',
    href: '/map/lighthouse',
  },

  // Anchor
  anchor: {
    key: 'anchor',
    iconName: 'Anchor',
    iconColor: 'text-slate-600 dark:text-slate-400',
    title: 'Anchor',
    shortDescription: 'Grounding question',
    fullDescription: 'Your Anchor is a question you ask yourself each week to stay connected to what matters.',
    promptQuestion: 'What question keeps you grounded?',
    suggestions: [
      'What would future me thank me for?',
      'What can I let go of this week?',
      'What\'s one thing I can do for myself?',
      'How do I want to feel by Sunday?',
      'What needs my attention first?',
      'What would make this week feel successful?',
    ],
    editorType: 'text',
    href: '/map/anchor',
  },

  // Navigation Tools
  compass_setup: {
    key: 'compass_setup',
    iconName: 'Compass',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
    title: 'Compass',
    shortDescription: 'Weekly priorities framework',
    fullDescription: 'How do you think about your weekly priorities? This is your framework for choosing what to focus on.',
    promptQuestion: 'How do you decide what\'s most important each week?',
    suggestions: [
      'top 3 priorities',
      'energy-based planning',
      'time blocks',
      'theme days',
      'must/should/could',
      'one big thing per day',
    ],
    editorType: 'text',
    href: '/map/compass-setup',
  },

  energy_patterns: {
    key: 'energy_patterns',
    iconName: 'Wind',
    iconColor: 'text-teal-500 dark:text-teal-400',
    title: 'Sails & Oars',
    shortDescription: 'Energy patterns',
    fullDescription: 'When do you have the most energy? When do you crash? Understanding your rhythm helps you work with it.',
    promptQuestion: 'What have you noticed about your energy patterns?',
    suggestions: [
      'best focus time',
      'afternoon slump',
      'second wind timing',
      'post-meal dip',
      'exercise effects',
      'caffeine timing',
    ],
    editorType: 'text',
    href: '/map/energy-patterns',
  },

  // Hazards at Sea
  storms: {
    key: 'storms',
    iconName: 'CloudLightning',
    iconColor: 'text-purple-500 dark:text-purple-400',
    title: 'Storms',
    shortDescription: 'Big challenges',
    fullDescription: 'What are the big repeating challenges you face? Naming them helps you prepare for them.',
    promptQuestion: 'What keeps getting in your way?',
    suggestions: [
      'anxiety',
      'burnout',
      'rejection sensitivity',
      'time blindness',
      'perfectionism',
      'decision paralysis',
      'shame spirals',
      'overwhelm',
    ],
    editorType: 'list',
    href: '/map/storms',
  },

  drift_sirens: {
    key: 'drift_sirens',
    iconName: 'AlertTriangle',
    iconColor: 'text-orange-500 dark:text-orange-400',
    title: 'Drift & Sirens',
    shortDescription: 'Sneaky distractions',
    fullDescription: 'What pulls you off course? These are the distractions that feel urgent or irresistible but aren\'t aligned with your goals.',
    promptQuestion: 'What tends to pull your attention away?',
    suggestions: [
      'phone scrolling',
      'hyperfocus rabbit holes',
      'saying yes to everything',
      'research spirals',
      'email/notifications',
      'cleaning instead of working',
      'helping others first',
      'buying things',
    ],
    editorType: 'list',
    href: '/map/drift-sirens',
  },

  // Lifeboat
  lifeboat: {
    key: 'lifeboat',
    iconName: 'LifeBuoy',
    iconColor: 'text-red-500 dark:text-red-400',
    title: 'Lifeboat',
    shortDescription: 'Clarity tools',
    fullDescription: 'What external supports help you think clearly? These are systems, tools, or people that help when you\'re stuck.',
    promptQuestion: 'What helps you get unstuck or think more clearly?',
    suggestions: [
      'body doubling',
      'timer/pomodoro',
      'accountability partner',
      'physical to-do list',
      'change of scenery',
      'talking it out',
      'breaking it smaller',
      'asking for help',
    ],
    editorType: 'list',
    href: '/map/lifeboat',
  },

  // Support Systems
  buoy: {
    key: 'buoy',
    iconName: 'Bell',
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    title: 'Buoy',
    shortDescription: 'Reflection cue',
    fullDescription: 'What question or prompt helps you check in with yourself? This is your reflection trigger.',
    promptQuestion: 'What question helps you pause and check in?',
    suggestions: [
      'How am I really doing right now?',
      'What do I need in this moment?',
      'Am I working on what matters?',
      'What would feel like enough today?',
      'What am I avoiding?',
      'What would help me right now?',
    ],
    editorType: 'text',
    href: '/map/buoy',
  },

  crew: {
    key: 'crew',
    iconName: 'Users',
    iconColor: 'text-blue-500 dark:text-blue-400',
    title: 'Crew',
    shortDescription: 'Support network',
    fullDescription: 'Who supports you? Your crew are the people you can lean on for different kinds of help.',
    promptQuestion: 'Who can you reach out to when you need support?',
    suggestions: [
      'accountability buddy',
      'cheerleader',
      'mentor',
      'body double partner',
      'venting friend',
      'practical helper',
      'therapist/coach',
      'family member',
    ],
    editorType: 'special',
    href: '/map/crew',
  },

  // Reflection & Recognition
  logbook_style: {
    key: 'logbook_style',
    iconName: 'BookOpen',
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    title: 'Logbook',
    shortDescription: 'Reflection style',
    fullDescription: 'How do you like to reflect? Some people journal, some talk, some use prompts. Find what works for you.',
    promptQuestion: 'What kind of reflection feels doable for you?',
    suggestions: [
      'voice memos',
      'bullet journal',
      'photo log',
      '1-word check-in',
      'end-of-day prompt',
      'weekly review',
      'talking to someone',
      'rating scales',
    ],
    editorType: 'text',
    href: '/map/logbook-style',
  },

  starlight: {
    key: 'starlight',
    iconName: 'Sparkles',
    iconColor: 'text-amber-400 dark:text-amber-300',
    title: 'Starlight',
    shortDescription: 'Wins & gratitude',
    fullDescription: 'Your wins, progress, and gratitude. Even tiny wins count - this is evidence of what\'s working.',
    promptQuestion: 'What went well? What are you grateful for?',
    suggestions: [
      'completed task',
      'small win',
      'kind moment',
      'something learned',
      'progress made',
      'boundary held',
      'help received',
      'joy noticed',
    ],
    editorType: 'special',
    href: '/map/starlight',
  },
};

// Sections for the Map page layout
export const MAP_SECTIONS: SectionDefinition[] = [
  {
    id: 'dockside-prep',
    title: 'Dockside Prep',
    modules: ['life_vest', 'fuel_habits', 'north_star'],
  },
  {
    id: 'destination',
    title: 'Destination',
    modules: ['destination', 'lighthouse'],
  },
  {
    id: 'anchor',
    title: 'Anchor',
    modules: ['anchor'],
  },
  {
    id: 'navigation',
    title: 'Navigation Tools',
    modules: ['compass_setup', 'energy_patterns'],
  },
  {
    id: 'hazards',
    title: 'Hazards at Sea',
    modules: ['storms', 'drift_sirens'],
  },
  {
    id: 'lifeboat',
    title: 'Lifeboat',
    modules: ['lifeboat'],
  },
  {
    id: 'support',
    title: 'Support Systems',
    modules: ['buoy', 'crew'],
  },
  {
    id: 'reflection',
    title: 'Reflection',
    modules: ['logbook_style', 'starlight'],
  },
];

// Helper to get module by key
export function getModuleDefinition(key: string): ModuleDefinition | undefined {
  return MAP_MODULES[key];
}

// Helper to get all modules in order
export function getAllModulesInOrder(): ModuleDefinition[] {
  const modules: ModuleDefinition[] = [];
  for (const section of MAP_SECTIONS) {
    for (const moduleKey of section.modules) {
      const module = MAP_MODULES[moduleKey];
      if (module) {
        modules.push(module);
      }
    }
  }
  return modules;
}
