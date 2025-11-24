/**
 * Context Detection System
 *
 * Automatically detects user context based on their task language,
 * behavior patterns, and self-description to provide personalized guidance.
 */

import { UserContext } from './user-context';

export interface ContextClues {
  taskKeywords: string[];
  timePatterns?: string[];
  commonPhrases?: string[];
  avoidedTerms?: string[];
}

/**
 * Keywords and patterns that indicate different user contexts
 */
const CONTEXT_CLUES: Record<UserContext, ContextClues> = {
  working_professional: {
    taskKeywords: [
      'meeting', 'deadline', 'project', 'presentation', 'email', 'report',
      'client', 'colleague', 'manager', 'office', 'work', 'job', 'career',
      'conference', 'quarterly', 'annual', 'strategy', 'deliverable'
    ],
    timePatterns: ['9-5', 'business hours', 'workday', 'commute'],
    commonPhrases: ['work-life balance', 'burnout', 'productivity']
  },

  student: {
    taskKeywords: [
      'study', 'assignment', 'exam', 'test', 'lecture', 'homework', 'reading',
      'notes', 'class', 'course', 'semester', 'grade', 'professor', 'campus',
      'essay', 'research', 'thesis', 'quiz', 'deadline'
    ],
    timePatterns: ['semester', 'school year', 'study session'],
    commonPhrases: ['academic', 'learning', 'education']
  },

  parent_caregiver: {
    taskKeywords: [
      'kid', 'child', 'parent', 'family', 'school pickup', 'meal prep',
      'doctor appointment', 'playdate', 'homework help', 'bedtime routine',
      'diaper', 'nursing', 'parenting', 'caregiving', 'household'
    ],
    timePatterns: ['school hours', 'after school', 'weekends', 'evenings'],
    commonPhrases: ['family time', 'parenting', 'juggling everything']
  },

  unemployed_transitioning: {
    taskKeywords: [
      'job search', 'resume', 'interview', 'application', 'networking',
      'skill building', 'portfolio', 'cover letter', 'linkedin', 'career change',
      'transition', 'unemployed', 'job hunting', 'professional development'
    ],
    timePatterns: ['flexible', 'unstructured', 'open schedule'],
    commonPhrases: ['next chapter', 'career transition', 'between jobs']
  },

  other: {
    taskKeywords: [], // Fallback - no specific indicators
    avoidedTerms: ['work', 'study', 'parent', 'job'] // Avoid misclassification
  }
};

/**
 * Analyze task descriptions to detect user context
 */
export function detectContextFromTasks(tasks: string[]): UserContext {
  if (!tasks || tasks.length === 0) return 'other';

  const taskText = tasks.join(' ').toLowerCase();
  const scores: Record<UserContext, number> = {
    working_professional: 0,
    student: 0,
    parent_caregiver: 0,
    unemployed_transitioning: 0,
    other: 0
  };

  // Score each context based on keyword matches
  Object.entries(CONTEXT_CLUES).forEach(([context, clues]) => {
    const contextKey = context as UserContext;

    clues.taskKeywords?.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = taskText.match(regex);
      if (matches) {
        scores[contextKey] += matches.length;
      }
    });
  });

  // Find the context with the highest score
  let maxScore = 0;
  let detectedContext: UserContext = 'other';

  Object.entries(scores).forEach(([context, score]) => {
    if (score > maxScore) {
      maxScore = score;
      detectedContext = context as UserContext;
    }
  });

  // Only return detected context if we have meaningful signals
  return maxScore >= 2 ? detectedContext : 'other';
}

/**
 * Analyze user behavior patterns to refine context detection
 */
export function detectContextFromBehavior(
  taskCompletions: Array<{ task: string; completed: boolean; timeOfDay: string }>,
  barriersUsed: string[]
): UserContext {
  const tasks = taskCompletions.map(tc => tc.task);
  const baseContext = detectContextFromTasks(tasks);

  // If we have strong signals from tasks, trust that
  if (baseContext !== 'other') return baseContext;

  // Otherwise, look at patterns
  const completionTimes = taskCompletions
    .filter(tc => tc.completed)
    .map(tc => tc.timeOfDay);

  // Business hours completions suggest working professional
  const businessHoursTasks = completionTimes.filter(time => {
    const hour = parseInt(time.split(':')[0]);
    return hour >= 9 && hour <= 17;
  });

  if (businessHoursTasks.length > completionTimes.length * 0.6) {
    return 'working_professional';
  }

  // Academic barriers suggest student
  const academicBarriers = ['overwhelm', 'time-blindness', 'decision-paralysis'];
  const academicBarrierUsage = barriersUsed.filter(b =>
    academicBarriers.some(academic => b.toLowerCase().includes(academic))
  );

  if (academicBarrierUsage.length > barriersUsed.length * 0.4) {
    return 'student';
  }

  return 'other';
}

/**
 * Get confidence score for context detection
 */
export function getContextConfidence(
  context: UserContext,
  tasks: string[]
): number {
  if (!tasks || tasks.length === 0) return 0;

  const taskText = tasks.join(' ').toLowerCase();
  const clues = CONTEXT_CLUES[context];

  let matches = 0;
  let totalKeywords = 0;

  clues.taskKeywords?.forEach(keyword => {
    totalKeywords++;
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(taskText)) {
      matches++;
    }
  });

  return totalKeywords > 0 ? matches / totalKeywords : 0;
}

/**
 * Suggest context to user when confidence is low
 */
export function shouldAskForContextConfirmation(
  detectedContext: UserContext,
  confidence: number,
  taskCount: number
): boolean {
  // Ask for confirmation if:
  // - Low confidence (< 0.3)
  // - Few tasks to analyze (< 5)
  // - Detected as generic "other"
  return confidence < 0.3 || taskCount < 5 || detectedContext === 'other';
}

/**
 * Generate personalized context confirmation question
 */
export function getContextConfirmationQuestion(
  detectedContext: UserContext
): string {
  switch (detectedContext) {
    case 'working_professional':
      return "It looks like you have work-related tasks. Is this accurate?";

    case 'student':
      return "I notice academic tasks in your list. Are you currently studying?";

    case 'parent_caregiver':
      return "Your tasks seem family-focused. Are you caring for children or family members?";

    case 'unemployed_transitioning':
      return "It seems like you're working on career or job-related tasks. Is this a transition period?";

    default:
      return "I'd love to provide more personalized guidance. What's your main focus right now?";
  }
}

