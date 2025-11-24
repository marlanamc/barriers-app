/**
 * Work Window Capacity System
 *
 * Core philosophy:
 * - Work windows determine WHEN you can work (not energy levels to predict)
 * - Task complexity affects capacity usage
 * - Clear expectations: what you can accomplish in each window
 * - Prevent over-scheduling and burnout
 */

export type WorkWindow = 'deep' | 'light' | 'rest';
export type TaskComplexity = 'quick' | 'medium' | 'deep';
export type TaskType = 'focus' | 'life' | 'inbox';

/**
 * Base capacity by work window
 * This represents what you can realistically accomplish in each time period
 */
export const WINDOW_CAPACITY: Record<WorkWindow, number> = {
  deep: 3,      // Deep work: 2-3 meaningful tasks (high focus required)
  light: 4,     // Light work: 3-5 simpler tasks (maintenance, emails)
  rest: 0,      // Rest: 0 tasks expected (recharge time)
};

/**
 * Legacy energy level support - maps to work windows for backwards compatibility
 */
export type EnergyLevel = 'sparky' | 'steady' | 'flowing' | 'foggy' | 'resting';
export const ENERGY_TO_WINDOW: Record<EnergyLevel, WorkWindow> = {
  sparky: 'deep',
  steady: 'deep',
  flowing: 'light',
  foggy: 'light',
  resting: 'rest',
};

/**
 * Base capacity points by energy level (legacy support)
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
 * Evening capacity limit - light tasks only
 * Meant for simple activities like cooking, tidying
 */
export const EVENING_CAPACITY_MAX = 0.5;

/**
 * Deep sleep capacity - no task planning
 * Rest activities only (reading, bath, no screens)
 */
export const SLEEP_CAPACITY = 0;

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
 * Get capacity info based on work window and current tasks
 */
export function getCapacityInfo(
  workWindow: WorkWindow,
  tasks: Array<{ completed: boolean; complexity: TaskComplexity; type: TaskType }>
): {
  totalCapacity: number;
  usedCapacity: number;
  remainingCapacity: number;
  percentUsed: number;
  canAddTask: boolean;
  recommendedComplexity: TaskComplexity | null;
  windowType: WorkWindow;
} {
  const totalCapacity = WINDOW_CAPACITY[workWindow];
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
    windowType: workWindow,
  };
}

/**
 * Legacy function for backwards compatibility - converts energy level to work window
 */
export function getCapacityInfoFromEnergy(
  energyLevel: EnergyLevel,
  tasks: Array<{ completed: boolean; complexity: TaskComplexity; type: TaskType }>
) {
  const workWindow = ENERGY_TO_WINDOW[energyLevel];
  return getCapacityInfo(workWindow, tasks);
}

/**
 * Get a human-readable capacity message for work windows
 */
export function getCapacityMessage(workWindow: WorkWindow): string {
  switch (workWindow) {
    case 'deep':
      return 'Deep work window - tackle complex tasks';
    case 'light':
      return 'Light work window - handle maintenance tasks';
    case 'rest':
      return 'Rest window - recharge and recover';
  }
}

/**
 * Get a human-readable capacity message (legacy energy version)
 */
export function getEnergyCapacityMessage(energyLevel: EnergyLevel): string {
  const workWindow = ENERGY_TO_WINDOW[energyLevel];
  return getCapacityMessage(workWindow);
}

/**
 * Get capacity range text for work windows
 */
export function getCapacityRangeText(workWindow: WorkWindow): string {
  switch (workWindow) {
    case 'deep':
      return '2-3 complex tasks';
    case 'light':
      return '3-5 simple tasks';
    case 'rest':
      return '0 tasks - rest time';
  }
}

/**
 * Get capacity range text (legacy energy version)
 */
export function getEnergyCapacityRangeText(energyLevel: EnergyLevel): string {
  const workWindow = ENERGY_TO_WINDOW[energyLevel];
  return getCapacityRangeText(workWindow);
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
 * Get capacity based on flow mode and work window
 */
export function getCapacityByFlow(
  flowMode: 'day' | 'evening' | 'night',
  workWindow: WorkWindow
): number {
  if (flowMode === 'night') {
    return SLEEP_CAPACITY;
  }
  if (flowMode === 'evening') {
    return Math.min(WINDOW_CAPACITY[workWindow], EVENING_CAPACITY_MAX);
  }
  return WINDOW_CAPACITY[workWindow];
}

/**
 * Legacy getCapacityByFlow with energy level
 */
export function getCapacityByFlowEnergy(
  flowMode: 'day' | 'evening' | 'night',
  energyLevel: EnergyLevel
): number {
  const workWindow = ENERGY_TO_WINDOW[energyLevel];
  return getCapacityByFlow(flowMode, workWindow);
}

/**
 * Get contextual message based on time of day, tasks, and work window
 */
export function getContextualMessage(
  tasks: Array<{ completed: boolean; type: TaskType }>,
  isPastStop: boolean,
  currentWindow: WorkWindow | null
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

  // No work window set yet
  if (!currentWindow) {
    return {
      type: 'morning',
      message: "Good morning! Let's see what you can accomplish today.",
      action: 'Choose your work window to get started',
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
