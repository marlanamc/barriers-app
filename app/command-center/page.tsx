'use client';

import { useState, useEffect } from 'react';
import { AppWordmark } from '@/components/AppWordmark';
import { HeaderStatus } from '@/components/HeaderStatus';
import { CapacityCard } from '@/components/CapacityCard';
import { FocusSection } from '@/components/FocusSection';
import { LifeMaintenance } from '@/components/LifeMaintenance';
import { EnergyModal } from '@/components/modals/EnergyModal';
import { TaskModal } from '@/components/modals/TaskModal';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getCheckinByDate, saveCheckinWithFocus, type FocusItemPayload } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';
import {
  EnergyLevel,
  TaskComplexity,
  TaskType,
  getCapacityInfo,
  getTimeUntilStop,
  getContextualMessage,
  MAX_FOCUS_ITEMS,
} from '@/lib/capacity';
import { getFlowGreeting } from '@/lib/getFlowGreeting';

const ENERGY_SUPPORT_MESSAGES: Record<EnergyLevel, string> = {
  sparky: 'Plenty of spark—pick one meaningful win to protect.',
  steady: 'Steady energy. Take one focused step forward.',
  flowing: 'Gentle flow. Keep things light and breathable.',
  foggy: 'Low energy. Aim for one small win tonight.',
  resting: 'Rest up. Light maintenance only if it feels good.',
};

type TimeWarningTone = 'soon' | 'urgent' | 'after';

const TIME_WARNING_STYLES: Record<TimeWarningTone, string> = {
  soon: 'bg-gradient-to-r from-[#fff8e8] to-[#ffeef9] text-amber-900 ring-[#ffe3c5] dark:bg-amber-900/20 dark:text-amber-100 dark:ring-amber-800/40',
  urgent: 'bg-gradient-to-r from-[#ffeef4] to-[#ffe6ff] text-rose-900 ring-[#ffcfe4] dark:bg-rose-900/30 dark:text-rose-100 dark:ring-rose-800/50',
  after: 'bg-gradient-to-r from-[#f2edff] to-[#e2f0ff] text-violet-900 ring-[#d7d4ff] dark:bg-violet-900/30 dark:text-violet-100 dark:ring-violet-800/60',
};

function getTimeWarning(timeInfo: ReturnType<typeof getTimeUntilStop> | null) {
  if (!timeInfo) return null;
  if (timeInfo.isPastStop) {
    return {
      tone: 'after' as TimeWarningTone,
      message: 'You are past your hard stop. Start winding down when you can.',
    };
  }
  if (timeInfo.totalMinutes <= 30) {
    return {
      tone: 'urgent' as TimeWarningTone,
      message: `${Math.max(timeInfo.totalMinutes, 1)} min until your hard stop. Time to wrap up for the day.`,
    };
  }
  if (timeInfo.totalMinutes <= 120) {
    const hours = Math.floor(timeInfo.totalMinutes / 60);
    const minutes = timeInfo.totalMinutes % 60;
    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} min`);
    }
    return {
      tone: 'soon' as TimeWarningTone,
      message: `${parts.join(' ')} until your hard stop. Choose one last focus.`,
    };
  }
  return null;
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
  type: TaskType;
  anchorTime?: string;
  barrier?: {
    type: string;
    custom?: string;
  };
}

export default function CommandCenterPage() {
  const { user } = useSupabaseUser();

  // State
  const [loading, setLoading] = useState(true);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [hardStopTime] = useState<string>('18:00');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkinId, setCheckinId] = useState<string | null>(null);

  // Modal state
  const [showEnergyModal, setShowEnergyModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'add' | 'edit'>('add');
  const [taskModalType, setTaskModalType] = useState<TaskType>('focus');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Load today's checkin data
  useEffect(() => {
    if (!user) return;

    const loadTodayData = async () => {
      try {
        setLoading(true);
        const today = getTodayLocalDateString();
        const checkin = await getCheckinByDate(user.id, today);

        if (checkin) {
          setCheckinId(checkin.id);
          setEnergyLevel(checkin.internal_weather as EnergyLevel);

          // Convert focus_items to Task format
          const loadedTasks: Task[] = checkin.focus_items.map((item: any) => ({
            id: item.id,
            description: item.description,
            completed: item.completed || false,
            complexity: (item.complexity as TaskComplexity) || 'medium',
            type: (item.task_type as TaskType) || 'focus',
            anchorTime: item.anchors && Array.isArray(item.anchors) && item.anchors.length > 0
              ? `${item.anchors[0].type} ${item.anchors[0].value}`
              : undefined,
            barrier: item.focus_barriers?.[0]
              ? {
                  type: item.focus_barriers[0].barrier_types?.slug || '',
                  custom: item.focus_barriers[0].custom_barrier || undefined,
                }
              : undefined,
          }));

          setTasks(loadedTasks);
        }
      } catch (error) {
        console.error('Error loading checkin:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTodayData();
  }, [user]);

  // Save checkin to database
  const saveToDatabase = async (updatedTasks: Task[], newEnergy?: EnergyLevel) => {
    if (!user) return;

    try {
      const today = getTodayLocalDateString();
      const energyToSave = newEnergy || energyLevel;

      if (!energyToSave) return;

      const focusItemsPayload: FocusItemPayload[] = updatedTasks.map((task, index) => ({
        id: task.id,
        description: task.description,
        categories: [],
        sortOrder: index,
        taskType: task.type,
        complexity: task.complexity,
        anchorValue: task.anchorTime,
        barrier: task.barrier ? {
          barrierTypeSlug: task.barrier.type,
          custom: task.barrier.custom,
        } : null,
      }));

      const id = await saveCheckinWithFocus({
        userId: user.id,
        internalWeather: {
          key: energyToSave,
          label: energyToSave,
          icon: '',
        },
        focusItems: focusItemsPayload,
        checkinDate: today,
      });

      setCheckinId(id);
    } catch (error) {
      console.error('Error saving checkin:', error);
    }
  };

  // Separate tasks by type
  const focusTasks = tasks.filter((t) => t.type === 'focus');
  const lifeTasks = tasks.filter((t) => t.type === 'life');

  // Calculate capacity
  const capacityInfo = energyLevel
    ? getCapacityInfo(energyLevel, tasks)
    : { totalCapacity: 0, usedCapacity: 0, remainingCapacity: 0, percentUsed: 0, canAddTask: false, recommendedComplexity: null };

  // Time info
  const timeInfo = hardStopTime ? getTimeUntilStop(hardStopTime) : null;

  // Contextual message
  const contextual = getContextualMessage(
    tasks,
    timeInfo?.isPastStop || false,
    !!energyLevel
  );

  const focusPlanned = focusTasks.filter((t) => !t.completed).length;
  const capacityTarget = energyLevel
    ? Math.max(1, Math.round(capacityInfo.totalCapacity || 1))
    : Math.max(focusPlanned || 1, 1);
  const supportiveMessage = energyLevel
    ? ENERGY_SUPPORT_MESSAGES[energyLevel]
    : 'Check your energy to set expectations for today.';
  const timeWarning = getTimeWarning(timeInfo);
  const headerTimeInfo = timeInfo
    ? { totalMinutes: timeInfo.totalMinutes, isPastStop: timeInfo.isPastStop }
    : null;
  const planHint = contextual.message || null;
  const userSchedule = ((user?.user_metadata ?? {}) as {
    workStart?: string;
    workEnd?: string;
    work_start?: string;
    work_end?: string;
  }) || {};
  const scheduleStart = userSchedule.workStart ?? userSchedule.work_start ?? '08:00';
  const scheduleEnd = userSchedule.workEnd ?? userSchedule.work_end ?? hardStopTime ?? '18:00';
  const flowGreeting = getFlowGreeting(new Date(), {
    workStart: scheduleStart,
    workEnd: scheduleEnd,
  });

  // Handlers
  const handleEnergyChange = () => {
    setShowEnergyModal(true);
  };

  const handleEnergySelect = async (energy: EnergyLevel) => {
    setEnergyLevel(energy);
    await saveToDatabase(tasks, energy);
  };

  const handleAddFocusTask = () => {
    if (focusTasks.length >= MAX_FOCUS_ITEMS) return;
    setTaskModalMode('add');
    setTaskModalType('focus');
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleToggleFocusTask = async (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    await saveToDatabase(updated);
  };

  const handleTaskClick = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.type === 'focus') {
      setTaskModalMode('edit');
      setTaskModalType('focus');
      setEditingTask(task);
      setShowTaskModal(true);
    }
  };

  const appendTask = async (newTask: Task) => {
    const updated = [...tasks, newTask];
    setTasks(updated);
    await saveToDatabase(updated);
  };

  const handleTaskSave = async (taskData: {
    id?: string;
    description: string;
    complexity: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
  }) => {
    if (taskData.id) {
      // Edit existing task
      const updated = tasks.map((t) =>
        t.id === taskData.id
          ? {
              ...t,
              description: taskData.description,
              complexity: taskData.complexity,
              anchorTime: taskData.anchorTime,
            }
          : t
      );
      setTasks(updated);
      await saveToDatabase(updated);
    } else {
      // Add new task
      await appendTask({
        id: `temp-${Date.now()}`,
        description: taskData.description,
        completed: false,
        complexity: taskData.complexity,
        type: taskData.taskType,
        anchorTime: taskData.anchorTime,
      });
    }
  };

  const handleAddLifeTask = async (description: string) => {
    await appendTask({
      id: `temp-life-${Date.now()}`,
      description,
      completed: false,
      complexity: 'quick',
      type: 'life',
    });
  };

  const handleToggleLifeTask = async (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    setTasks(updated);
    await saveToDatabase(updated);
  };

  const handleDeleteLifeTask = async (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    await saveToDatabase(updated);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading your day...</p>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fff7fb] via-[#f2fbff] to-[#fffef6] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div
          className="pointer-events-none absolute inset-0 opacity-80 blur-[60px] dark:hidden"
          aria-hidden
        >
          <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[#ffdff4]" />
          <div className="absolute -bottom-40 right-[-5%] h-96 w-96 rounded-full bg-[#dff7ff]" />
          <div className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#ffeec9]" />
        </div>
        <div
          className="pointer-events-none absolute inset-0 hidden opacity-40 blur-3xl dark:block"
          aria-hidden
        >
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-slate-900/60 to-transparent" />
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 pb-16 pt-6">
          <div className="flex items-center justify-between">
            <AppWordmark />
          </div>

          <HeaderStatus
            energyLevel={energyLevel}
            focusCount={focusPlanned}
            capacityTarget={capacityTarget}
            supportiveMessage={supportiveMessage}
            flowGreeting={flowGreeting}
            timeInfo={headerTimeInfo}
            onEnergyClick={handleEnergyChange}
          />

          {timeWarning && (
            <div
              className={`rounded-2xl px-3 py-2 text-sm font-medium shadow-sm ring-1 backdrop-blur ${TIME_WARNING_STYLES[timeWarning.tone]}`}
            >
              {timeWarning.message}
            </div>
          )}

          <CapacityCard
            energyLevel={energyLevel}
            hardStopTime={hardStopTime}
            focusCount={focusPlanned}
            capacityInfo={energyLevel ? capacityInfo : null}
            planHint={planHint}
          />

          <FocusSection
            tasks={focusTasks.map((task) => ({
              id: task.id,
              description: task.description,
              completed: task.completed,
              complexity: task.complexity,
            }))}
            canAddMore={capacityInfo.canAddTask}
            onAddTask={handleAddFocusTask}
            onToggleTask={handleToggleFocusTask}
            onTaskClick={handleTaskClick}
          />

          <LifeMaintenance
            tasks={lifeTasks.map((task) => ({
              id: task.id,
              description: task.description,
              completed: task.completed,
            }))}
            onAddTask={handleAddLifeTask}
            onToggleTask={handleToggleLifeTask}
            onDeleteTask={handleDeleteLifeTask}
          />
        </div>
      </main>

      <EnergyModal
        isOpen={showEnergyModal}
        currentEnergy={energyLevel}
        onClose={() => setShowEnergyModal(false)}
        onSelect={handleEnergySelect}
      />

      <TaskModal
        isOpen={showTaskModal}
        mode={taskModalMode}
        taskType={taskModalType}
        initialData={editingTask ? {
          id: editingTask.id,
          description: editingTask.description,
          complexity: editingTask.complexity,
          anchorTime: editingTask.anchorTime,
          barrier: editingTask.barrier,
        } : undefined}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskSave}
      />
    </>
  );
}
