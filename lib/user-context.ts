/**
 * User Context System for ADHD App
 *
 * Learns about user's life context to provide personalized, relevant guidance
 * Adapts language and expectations based on their situation
 */

export type UserContext =
  | 'working_professional'
  | 'student'
  | 'parent_caregiver'
  | 'unemployed_transitioning'
  | 'other';

export interface UserContextData {
  context: UserContext;
  contextDetails?: string; // e.g., "software developer", "college student", "stay-at-home parent"
  energyPatterns?: {
    typicalHighEnergyTimes?: string[];
    typicalLowEnergyTimes?: string[];
    commonChallenges?: string[];
  };
  languagePreferences?: {
    avoidWords?: string[]; // Words they don't resonate with
    preferredTerms?: Record<string, string>; // e.g., {"task": "project", "work": "activities"}
  };
}

export type FocusLevel = 'focused' | 'scattered' | 'unfocused';

export interface FocusGuidance {
  label: string;
  description: string;
  capacity: {
    high: string;
    medium: string;
    low: string;
  };
  encouragement: string;
  harmReduction?: {
    validation: string;
    realityCheck: string;
    survivalStrategy: string;
    recoveryPlanning: string;
  };
}

/**
 * Context-specific focus guidance with harm reduction
 */
export const CONTEXT_FOCUS_GUIDANCE: Record<UserContext, Record<FocusLevel, FocusGuidance>> = {
  working_professional: {
    focused: {
      label: "Focused & Ready",
      description: "Your mind is clear and you're ready to tackle important work",
      capacity: {
        high: "You can handle 2-3 work projects or complex tasks",
        medium: "Focus on 1-2 important work items",
        low: "Handle essential work tasks only"
      },
      encouragement: "Great job protecting your focus time - this is when you get your best work done"
    },
    scattered: {
      label: "Steady but Managing",
      description: "You're functional but might need to pace yourself",
      capacity: {
        high: "You can tackle routine work tasks and 1 complex item",
        medium: "Focus on routine tasks, emails, and meetings",
        low: "Keep it light - just essential communications"
      },
      encouragement: "Even steady days are productive days. You're showing up for what matters"
    },
    unfocused: {
      label: "Brain Not Cooperating",
      description: "Focus is shot today - that's completely valid, but deadlines exist",
      capacity: {
        high: "Handle 1-2 absolutely essential work tasks",
        medium: "Focus on critical deadlines and communications",
        low: "Protect your energy - only emergency work items"
      },
      encouragement: "ADHD focus challenges are real. Let's survive this strategically",
      harmReduction: {
        validation: "I hear your brain isn't cooperating today - that's so real with ADHD",
        realityCheck: "But those deadlines and projects won't disappear on their own",
        survivalStrategy: "What's the absolute minimum you need to do today? Can you break it into 15-minute chunks with breaks?",
        recoveryPlanning: "After this crunch, let's build better ADHD-friendly work systems"
      }
    }
  },

  student: {
    focused: {
      label: "Motivated to Learn",
      description: "Your brain is engaged and ready for academic work",
      capacity: {
        high: "You can study for 1-2 focused hours, maybe write a paper section",
        medium: "Focus on 45-60 minutes of reading or note-taking",
        low: "Do 20-30 minutes of lighter review work"
      },
      encouragement: "Academic focus is so valuable - you're building important skills"
    },
    scattered: {
      label: "Managing Study Load",
      description: "You're keeping up but academic overwhelm is real",
      capacity: {
        high: "Handle 30-45 minutes of focused study or assignment work",
        medium: "Work on lighter tasks like reading or organizing notes",
        low: "Just review your schedule or do quick planning"
      },
      encouragement: "Even small study sessions add up. You're making progress despite ADHD challenges"
    },
    unfocused: {
      label: "Overwhelmed by School",
      description: "Academic pressure feels heavy today - that's so real",
      capacity: {
        high: "Try 15-20 minutes of something manageable",
        medium: "Just check in with your assignments or planner",
        low: "No pressure today - rest is productive too"
      },
      encouragement: "Academic overwhelm + ADHD is a lot. You're exactly where you need to be",
      harmReduction: {
        validation: "I hear academic overwhelm + ADHD is a brutal combination",
        realityCheck: "But those assignments and deadlines don't disappear",
        survivalStrategy: "What's the one assignment that matters most today? Can you break it into 20-minute study sessions?",
        recoveryPlanning: "After this busy period, let's build better study systems for your ADHD brain"
      }
    }
  },

  parent_caregiver: {
    focused: {
      label: "Managing Well",
      description: "You have some energy for family responsibilities",
      capacity: {
        high: "You can handle 1-2 important family tasks or appointments",
        medium: "Focus on daily essentials and one priority",
        low: "Keep it to basic care and safety needs"
      },
      encouragement: "Caring for others is meaningful work. You're doing important things"
    },
    scattered: {
      label: "Getting Through",
      description: "Parenting demands are high but you're managing",
      capacity: {
        high: "Handle routine care plus one additional family task",
        medium: "Focus on daily care routines and essentials",
        low: "Prioritize safety and basic needs only"
      },
      encouragement: "Parenting with ADHD is challenging. Every day you get through is a win"
    },
    unfocused: {
      label: "Exhausted from Caregiving",
      description: "Caregiving demands have drained your energy - that's valid",
      capacity: {
        high: "Handle just the most essential care tasks",
        medium: "Focus only on immediate safety and basic needs",
        low: "This is survival mode - protect yourself first"
      },
      encouragement: "Caregiving + ADHD + exhaustion is overwhelming. You're stronger than you know",
      harmReduction: {
        validation: "I hear parenting demands + ADHD brain fog is absolutely exhausting",
        realityCheck: "But family care and safety responsibilities don't stop",
        survivalStrategy: "What's the absolute minimum care needed today? Can you delegate anything safe to delegate?",
        recoveryPlanning: "After this intense period, let's build more ADHD-friendly family routines"
      }
    }
  },

  unemployed_transitioning: {
    focused: {
      label: "Ready to Take Action",
      description: "You have energy for moving forward",
      capacity: {
        high: "You can work on 2-3 personal projects or job search tasks",
        medium: "Focus on 1-2 important steps toward your goals",
        low: "Handle one small but meaningful task"
      },
      encouragement: "Taking action during transitions is brave. Every step counts"
    },
    scattered: {
      label: "Managing Uncertainty",
      description: "Unstructured time can feel overwhelming",
      capacity: {
        high: "Work on planning or one small goal-oriented task",
        medium: "Focus on self-care or light organization",
        low: "Just maintain your daily routine"
      },
      encouragement: "Transitions are hard, especially with ADHD. You're navigating this well"
    },
    unfocused: {
      label: "Feeling Aimless",
      description: "Unstructured time + low energy = tough combination",
      capacity: {
        high: "Try one small, low-pressure activity",
        medium: "Focus on basic self-care and rest",
        low: "No expectations today - rest is productive"
      },
      encouragement: "Feeling aimless during transitions is completely normal. Be patient with yourself",
      harmReduction: {
        validation: "I hear transitions + ADHD brain fog create such uncertainty",
        realityCheck: "But some responsibilities (like applications or deadlines) don't disappear",
        survivalStrategy: "What's one small step you can take today? Even 15 minutes of progress counts",
        recoveryPlanning: "After this transition period, let's build more predictable routines for your ADHD brain"
      }
    }
  },

  other: {
    focused: {
      label: "Feeling Capable",
      description: "You have energy for what matters to you",
      capacity: {
        high: "You can handle 2-3 important things",
        medium: "Focus on 1-2 meaningful activities",
        low: "Do what you can with your available energy"
      },
      encouragement: "Using your energy well is a skill. You're doing great"
    },
    scattered: {
      label: "Managing Okay",
      description: "You're getting through your day",
      capacity: {
        high: "Handle routine tasks plus one important thing",
        medium: "Focus on essentials and steady progress",
        low: "Keep it simple and manageable"
      },
      encouragement: "Every day you manage is a accomplishment. Be proud of yourself"
    },
    unfocused: {
      label: "Focus is Low",
      description: "That's completely valid. Let's prioritize regulation.",
      capacity: {
        high: "Regulation is your fuel. Try 1 small task after regulating",
        medium: "Regulate first, then pick 1 absolute must-do",
        low: "Rest and recharge - no pressure"
      },
      encouragement: "Low focus days are part of life. You're exactly where you need to be",
      harmReduction: {
        validation: "Low focus days are tough when things need to get done",
        realityCheck: "But pushing through without fuel usually leads to a crash",
        survivalStrategy: "Can you do 10 minutes of regulation (water, movement) before starting?",
        recoveryPlanning: "Let's just survive today, then plan better for tomorrow"
      }
    }
  }
};

export interface PersonalizedGuidance extends FocusGuidance {
  recommendedCapacity: string;
  includeHarmReduction?: boolean;
}

/**
 * Get personalized guidance based on user context and focus level
 */
export function getPersonalizedGuidance(
  context: UserContext,
  focusLevel: FocusLevel,
  capacityPreference: 'high' | 'medium' | 'low' = 'medium',
  hasDeadlines: boolean = false
): PersonalizedGuidance {
  const guidance = CONTEXT_FOCUS_GUIDANCE[context]?.[focusLevel];

  if (!guidance) {
    // Fallback to generic guidance
    const fallback = CONTEXT_FOCUS_GUIDANCE.other[focusLevel];
    return {
      ...fallback,
      recommendedCapacity: fallback.capacity[capacityPreference]
    };
  }

  // If unfocused but has deadlines, include harm reduction
  if (focusLevel === 'unfocused' && hasDeadlines && guidance.harmReduction) {
    return {
      ...guidance,
      recommendedCapacity: guidance.capacity[capacityPreference],
      includeHarmReduction: true
    };
  }

  return {
    ...guidance,
    recommendedCapacity: guidance.capacity[capacityPreference]
  };
}

/**
 * Detect user context from their task language and patterns
 */
export function detectUserContextFromTasks(tasks: string[]): UserContext {
  const taskText = tasks.join(' ').toLowerCase();

  // Parent/caregiver indicators
  if (taskText.includes('kid') || taskText.includes('child') ||
    taskText.includes('parent') || taskText.includes('family') ||
    taskText.includes('care') || taskText.includes('school pickup')) {
    return 'parent_caregiver';
  }

  // Student indicators
  if (taskText.includes('study') || taskText.includes('class') ||
    taskText.includes('assignment') || taskText.includes('exam') ||
    taskText.includes('lecture') || taskText.includes('homework')) {
    return 'student';
  }

  // Work indicators
  if (taskText.includes('meeting') || taskText.includes('email') ||
    taskText.includes('project') || taskText.includes('deadline') ||
    taskText.includes('work') || taskText.includes('job')) {
    return 'working_professional';
  }

  // Unemployed/transitioning indicators
  if (taskText.includes('job search') || taskText.includes('resume') ||
    taskText.includes('interview') || taskText.includes('application')) {
    return 'unemployed_transitioning';
  }

  return 'other';
}

/**
 * Adaptive questions based on detected context
 */
export function getContextualOnboardingQuestions(context: UserContext) {
  switch (context) {
    case 'working_professional':
      return [
        "What does a good work day look like for you?",
        "When do you typically have the most focus?",
        "What work tasks drain your energy the most?"
      ];

    case 'student':
      return [
        "What's your biggest academic challenge right now?",
        "When do you study most effectively?",
        "How do you usually feel about your assignments?"
      ];

    case 'parent_caregiver':
      return [
        "What's most challenging about your caregiving responsibilities?",
        "When do you have the most energy for family tasks?",
        "What does self-care look like in your life?"
      ];

    case 'unemployed_transitioning':
      return [
        "What's one small step you'd like to take?",
        "How does unstructured time affect you?",
        "What are you hoping to work toward?"
      ];

    default:
      return [
        "What's most important to you right now?",
        "When do you typically feel most capable?",
        "What's one thing you'd like to focus on?"
      ];
  }
}
