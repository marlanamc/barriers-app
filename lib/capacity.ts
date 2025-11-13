/**
 * Capacity calculation utilities
 *
 * Core philosophy:
 * - Energy level determines base capacity
 * - Task complexity affects capacity usage
 * - Time remaining adjusts recommendations
 * - Prevent over-scheduling and burnout
 */

export type EnergyLevel = 'sparky' | 'steady' | 'flowing' | 'foggy' | 'resting';
export type TaskComplexity = 'quick' | 'medium' | 'deep';
export type TaskType = 'focus' | 'life';

/**
 * Base capacity points by energy level
 * This represents the number of "medium" complexity tasks a person can handle
 */
export const ENERGY_CAPACITY: Record<EnergyLevel, number> = {
  sparky: 3,    // Peak focus: 3-4 meaningful tasks
  steady: 2.5,  // Good day: 2-3 meaningful tasks
  flowing: 1.5, // Lower energy: 1-2 meaningful tasks
  foggy: 0.5,   // Very low: 0-1 meaningful tasks
  resting: 0,   // No deep work expected
};

/**
 * Capacity cost by task complexity
 * How many capacity points each task type uses
 */
export const COMPLEXITY_COST: Record<TaskComplexity, number> = {
  quick: 0.5,   // Small task: half a point
  medium: 1,    // Normal task: one point
  deep: 1.5,    // Big task: one and a half points
};

/**
 * Maximum focus items allowed (hard limit)
 */
export const MAX_FOCUS_ITEMS = 5;

/**
 * Life maintenance tasks have no capacity cost
 * and no limit on quantity
 */
export const LIFE_TASK_COST = 0;

/**
 * Calculate capacity usage for a set of tasks
 */
export function calculateCapacityUsage(
  tasks: Array<{ completed: boolean; complexity: TaskComplexity; type: TaskType }>
): {
  totalCapacity: number;
  usedCapacity: number;
  remainingCapacity: number;
} {
  const focusTasks = tasks.filter((t) => t.type === 'focus' && !t.completed);
  const usedCapacity = focusTasks.reduce(
    (sum, task) => sum + COMPLEXITY_COST[task.complexity],
    0
  );

  return {
    totalCapacity: 0, // Will be set based on energy level
    usedCapacity,
    remainingCapacity: 0, // Will be calculated
  };
}

/**
 * Get capacity info based on energy level and current tasks
 */
export function getCapacityInfo(
  energyLevel: EnergyLevel,
  tasks: Array<{ completed: boolean; complexity: TaskComplexity; type: TaskType }>
): {
  totalCapacity: number;
  usedCapacity: number;
  remainingCapacity: number;
  percentUsed: number;
  canAddTask: boolean;
  recommendedComplexity: TaskComplexity | null;
} {
  const totalCapacity = ENERGY_CAPACITY[energyLevel];
  const { usedCapacity } = calculateCapacityUsage(tasks);
  const remainingCapacity = Math.max(0, totalCapacity - usedCapacity);
  const percentUsed = totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0;

  // Can add task if we have room and haven't hit max focus items
  const focusCount = tasks.filter((t) => t.type === 'focus' && !t.completed).length;
  const canAddTask = focusCount < MAX_FOCUS_ITEMS && remainingCapacity >= COMPLEXITY_COST.quick;

  // Recommend task complexity based on remaining capacity
  let recommendedComplexity: TaskComplexity | null = null;
  if (remainingCapacity >= COMPLEXITY_COST.deep) {
    recommendedComplexity = 'deep';
  } else if (remainingCapacity >= COMPLEXITY_COST.medium) {
    recommendedComplexity = 'medium';
  } else if (remainingCapacity >= COMPLEXITY_COST.quick) {
    recommendedComplexity = 'quick';
  }

  return {
    totalCapacity,
    usedCapacity,
    remainingCapacity,
    percentUsed,
    canAddTask,
    recommendedComplexity,
  };
}

/**
 * Get a human-readable capacity message
 */
export function getCapacityMessage(energyLevel: EnergyLevel): string {
  switch (energyLevel) {
    case 'sparky':
      return 'Peak focus';
    case 'steady':
      return 'Good energy';
    case 'flowing':
      return 'Gentle energy';
    case 'foggy':
      return 'Low energy';
    case 'resting':
      return 'Rest mode';
  }
}

/**
 * Get capacity range text for display
 */
export function getCapacityRangeText(energyLevel: EnergyLevel): string {
  switch (energyLevel) {
    case 'sparky':
      return '3-4 tasks';
    case 'steady':
      return '2-3 tasks';
    case 'flowing':
      return '1-2 tasks';
    case 'foggy':
      return '0-1 tasks';
    case 'resting':
      return '0 tasks';
  }
}

/**
 * Calculate time remaining until hard stop
 */
export function getTimeUntilStop(hardStopTime: string): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  isPastStop: boolean;
  message: string;
} {
  const now = new Date();
  const [hours, minutes] = hardStopTime.split(':').map(Number);

  const stopTime = new Date();
  stopTime.setHours(hours, minutes, 0, 0);

  const diffMs = stopTime.getTime() - now.getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const isPastStop = totalMinutes < 0;

  const absMinutes = Math.abs(totalMinutes);
  const hoursRemaining = Math.floor(absMinutes / 60);
  const minutesRemaining = absMinutes % 60;

  let message = '';
  if (isPastStop) {
    message = "Past your hard stop";
  } else if (totalMinutes < 60) {
    message = `${minutesRemaining}m remaining`;
  } else if (totalMinutes < 120) {
    message = `${hoursRemaining}h ${minutesRemaining}m remaining`;
  } else {
    message = `${hoursRemaining}h ${minutesRemaining}m until hard stop`;
  }

  return {
    hours: hoursRemaining,
    minutes: minutesRemaining,
    totalMinutes: isPastStop ? 0 : totalMinutes,
    isPastStop,
    message,
  };
}

/**
 * Adjust capacity based on time remaining
 * As you get closer to hard stop, effective capacity decreases
 */
export function getTimeAdjustedCapacity(
  baseCapacity: number,
  minutesUntilStop: number
): {
  adjustedCapacity: number;
  shouldAddTasks: boolean;
  timeMessage: string;
} {
  if (minutesUntilStop <= 0) {
    return {
      adjustedCapacity: 0,
      shouldAddTasks: false,
      timeMessage: 'Past your hard stop - no more tasks',
    };
  }

  if (minutesUntilStop < 60) {
    return {
      adjustedCapacity: baseCapacity * 0.3,
      shouldAddTasks: false,
      timeMessage: 'Less than 1 hour left - focus on finishing',
    };
  }

  if (minutesUntilStop < 120) {
    return {
      adjustedCapacity: baseCapacity * 0.6,
      shouldAddTasks: false,
      timeMessage: 'Less than 2 hours left - minimal new tasks',
    };
  }

  if (minutesUntilStop < 180) {
    return {
      adjustedCapacity: baseCapacity * 0.8,
      shouldAddTasks: true,
      timeMessage: 'A few hours left - plan carefully',
    };
  }

  return {
    adjustedCapacity: baseCapacity,
    shouldAddTasks: true,
    timeMessage: 'Plenty of time - plan your day',
  };
}

/**
 * Get contextual message based on time of day and tasks
 */
export function getContextualMessage(
  tasks: Array<{ completed: boolean; type: TaskType }>,
  isPastStop: boolean,
  hasSetEnergy: boolean
): {
  type: 'morning' | 'midday' | 'evening' | 'empty';
  message: string;
  action?: string;
} {
  const focusTasks = tasks.filter((t) => t.type === 'focus');
  const completedFocus = focusTasks.filter((t) => t.completed).length;
  const totalFocus = focusTasks.length;

  // Past hard stop
  if (isPastStop) {
    return {
      type: 'evening',
      message: `Your brain is done with deep work. ${completedFocus > 0 ? `You completed ${completedFocus} focus ${completedFocus === 1 ? 'item' : 'items'} today!` : ''} That's a solid day. Rest up! 🌟`,
    };
  }

  // No energy set yet
  if (!hasSetEnergy) {
    return {
      type: 'morning',
      message: "Good morning! Let's plan your day together.",
      action: 'Set your energy level to get started',
    };
  }

  // No tasks yet
  if (totalFocus === 0) {
    return {
      type: 'empty',
      message: 'What matters most today?',
      action: 'Add your first focus item',
    };
  }

  // Tasks in progress
  if (completedFocus < totalFocus) {
    const remaining = totalFocus - completedFocus;
    return {
      type: 'midday',
      message: `${remaining} focus ${remaining === 1 ? 'item' : 'items'} remaining. You've got this! 💪`,
    };
  }

  // All done!
  return {
    type: 'evening',
    message: `All focus items complete! You did ${completedFocus} meaningful ${completedFocus === 1 ? 'task' : 'tasks'} today. 🎉`,
  };
}
