'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfettiExplosion from 'react-confetti-explosion';
import { HeaderStatus } from '@/components/HeaderStatus';
import { TasksCard } from '@/components/TasksCard';
import { InboxCard } from '@/components/InboxCard';
import { TaskModal } from '@/components/modals/TaskModal';
import { QuickAddModal } from '@/components/modals/QuickAddModal';
import { EnergyTimeline } from '@/components/command-center/EnergyTimeline';
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
import { getEnergySchedules } from '@/lib/supabase';
import { timeToMinutes } from '@/components/command-center/timelines/TimeUtils';
import { getFlowGreeting } from '@/lib/getFlowGreeting';
import { getCurrentEnergyLevel } from '@/lib/getCurrentEnergy';
import { Loading } from '@/components/Loading';
import { useDebounce } from '@/lib/useDebounce';
import { useCache } from '@/lib/useCache';
import { Plus } from 'lucide-react';

type TimeWarningTone = 'soon' | 'urgent' | 'after';

const TIME_WARNING_STYLES: Record<TimeWarningTone, string> = {
  soon: 'bg-gradient-to-r from-[#fff8e8] to-[#ffeef9] text-amber-900 ring-[#ffe3c5] dark:bg-none dark:bg-amber-900/20 dark:text-amber-100 dark:ring-amber-800/40',
  urgent: 'bg-gradient-to-r from-[#ffeef4] to-[#ffe6ff] text-rose-900 ring-[#ffcfe4] dark:bg-none dark:bg-rose-900/30 dark:text-rose-100 dark:ring-rose-800/50',
  after: 'bg-gradient-to-r from-[#f2edff] to-[#e2f0ff] text-violet-900 ring-[#d7d4ff] dark:bg-none dark:bg-violet-900/30 dark:text-violet-100 dark:ring-violet-800/60',
};

function getTimeWarning(timeInfo: ReturnType<typeof getTimeUntilStop> | null) {
  if (!timeInfo) return null;
  if (timeInfo.isPastStop) {
    return {
      tone: 'after' as TimeWarningTone,
      message: 'Past your hard stop',
      showTimeline: true,
    };
  }
  if (timeInfo.totalMinutes <= 30) {
    return {
      tone: 'urgent' as TimeWarningTone,
      message: `${Math.max(timeInfo.totalMinutes, 1)}m remaining - wrap up`,
      showTimeline: false,
    };
  }
  if (timeInfo.totalMinutes <= 120) {
    const hours = Math.floor(timeInfo.totalMinutes / 60);
    const minutes = timeInfo.totalMinutes % 60;
    const parts = [];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`);
    }
    return {
      tone: 'soon' as TimeWarningTone,
      message: `${parts.join(' ')} remaining - last focus window`,
      showTimeline: false,
    };
  }
  return null;
}

interface TaskAnchor {
  type: 'at' | 'while' | 'before' | 'after';
  value: string;
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
  type: TaskType;
  inInbox?: boolean;
  anchors?: TaskAnchor[];
  anchorTime?: string; // Legacy format - kept for backwards compatibility
  barrier?: {
    type: string;
    custom?: string;
  };
}

export default function CommandCenterPage() {
  const { user } = useSupabaseUser();
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [hardStopTime] = useState<string>('18:00');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [checkinId, setCheckinId] = useState<string | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [energyScheduleBlocks, setEnergyScheduleBlocks] = useState<
    { start: string; end: string; level: EnergyLevel }[]
  >([]);

  // Modal state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'add' | 'edit'>('add');
  const [taskModalType, setTaskModalType] = useState<TaskType>('focus');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Celebration state
  const [showConfetti, setShowConfetti] = useState(false);

  // Load today's checkin data
  useEffect(() => {
    if (!user) return;

    const loadTodayData = async () => {
      try {
        setLoading(true);
        setError(null);
        const today = getTodayLocalDateString();
        const checkin = await getCheckinByDate(user.id, today);

        if (checkin) {
          setCheckinId(checkin.id);
          // Don't set energy level from checkin - it will be set from schedule below
          // setEnergyLevel(checkin.internal_weather as EnergyLevel);

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
        setError('Failed to load your check-in data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadTodayData();
  }, [user]);

  // Save checkin to database
  const saveToDatabase = async (updatedTasks: Task[]) => {
    if (!user) return;

    try {
      const today = getTodayLocalDateString();

      // Energy comes from schedule now, use current value
      if (!energyLevel) return;

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
          key: energyLevel,
          label: energyLevel,
          icon: '',
        },
        focusItems: focusItemsPayload,
        checkinDate: today,
      });

      setCheckinId(id);
      setError(null); // Clear any previous errors on successful save
    } catch (error) {
      console.error('Error saving checkin:', error);
      setError('Failed to save your changes. Please check your connection and try again.');
    }
  };

  // Separate tasks by type and inbox status
  const focusTasks = tasks.filter((t) => t.type === 'focus' && !t.inInbox);
  const lifeTasks = tasks.filter((t) => t.type === 'life');
  const inboxTasks = tasks.filter((t) => t.inInbox && t.type === 'focus');

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

  // Cache for energy schedules to avoid repeated API calls
  type EnergyScheduleCacheData = {
    blocks: { start: string; end: string; level: EnergyLevel }[];
    energyLevel: EnergyLevel | null;
  };
  const energyScheduleCache = useCache<EnergyScheduleCacheData>(10 * 60 * 1000); // 10 minutes cache
  const debouncedScheduleStart = useDebounce(scheduleStart, 1000);
  const debouncedScheduleEnd = useDebounce(scheduleEnd, 1000);

  // Energy schedule for timeline blocks
  useEffect(() => {
    let active = true;
    const loadEnergySchedule = async () => {
      if (!user?.id) return;

      const cacheKey = `energy-schedule-${user.id}-${debouncedScheduleStart}-${debouncedScheduleEnd}`;

      // Check cache first
      if (energyScheduleCache.has(cacheKey)) {
        const cachedData = energyScheduleCache.get(cacheKey);
        if (cachedData && active) {
          setEnergyScheduleBlocks(cachedData.blocks);
          if (cachedData.energyLevel) {
            setEnergyLevel(cachedData.energyLevel);
          }
          return;
        }
      }

      try {
        const schedules = await getEnergySchedules(user.id);
        if (!active) return;

        const toHM = (minutes: number) => {
          const h = Math.floor(minutes / 60) % 24;
          const m = minutes % 60;
          return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        };

        const wakeMinutes = (() => {
          const [h, m] = debouncedScheduleStart.split(':').map(Number);
          return (h ?? 0) * 60 + (m ?? 0);
        })();
        const stopMinutes = (() => {
          const [h, m] = debouncedScheduleEnd.split(':').map(Number);
          return (h ?? 0) * 60 + (m ?? 0);
        })();

        const sorted = [...(schedules || [])].sort(
          (a, b) => (a.start_time_minutes ?? 0) - (b.start_time_minutes ?? 0)
        );

        // Build blocks for ALL time periods (not just daytime)
        const blocks: { start: string; end: string; level: EnergyLevel }[] = [];
        sorted.forEach((s, idx) => {
          const startMin = s.start_time_minutes ?? 0;
          const nextStart = idx < sorted.length - 1 ? sorted[idx + 1].start_time_minutes ?? 1440 : 1440;
          const endMin = nextStart;

          if (endMin > startMin) {
            blocks.push({
              start: toHM(startMin),
              end: toHM(endMin),
              level: (s.energy_key as EnergyLevel) || 'steady',
            });
          }
        });

        // Fallback single block if schedules empty
        if (!blocks.length) {
          blocks.push({
            start: debouncedScheduleStart,
            end: debouncedScheduleEnd,
            level: energyLevel || 'steady',
          });
        }

        setEnergyScheduleBlocks(blocks);

        // Set current energy level from schedule (this takes precedence over checkin)
        let currentEnergy: EnergyLevel | null = null;
        if (schedules && schedules.length > 0) {
          currentEnergy = getCurrentEnergyLevel(schedules);
          console.log('Setting energy level from schedule:', currentEnergy, 'schedules:', schedules.map(s => ({ time: s.start_time_minutes, level: s.energy_key, day: (s as any).day_type })));
          setEnergyLevel(currentEnergy);
        }

        // Cache the results
        energyScheduleCache.set(cacheKey, {
          blocks,
          energyLevel: currentEnergy,
        });
      } catch (err) {
        console.error('Error loading energy schedule for timeline:', err);
        setEnergyScheduleBlocks([]);
      }
    };

    loadEnergySchedule();

    // Update energy level every 5 minutes (reduced frequency)
    const interval = setInterval(() => {
      loadEnergySchedule();
    }, 300000); // 5 minutes

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user?.id, debouncedScheduleStart, debouncedScheduleEnd, energyScheduleCache, energyLevel]);

  // Handlers
  const handleEnergyChange = () => {
    // Energy is now managed via schedule - redirect to energy page
    router.push('/energy');
  };

  const handleAddFocusTask = () => {
    if (focusTasks.length >= MAX_FOCUS_ITEMS) return;
    setTaskModalMode('add');
    setTaskModalType('focus');
    setEditingTask(null);
    setShowTaskModal(true);
  };

  const handleToggleFocusTask = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );

    // Show confetti when completing a focus task (not when uncompleting)
    if (task && task.type === 'focus' && !task.completed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2500);
    }

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

  const handleQuickAddSave = async (taskData: {
    description: string;
    complexity: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
    inInbox?: boolean;
  }) => {
    await appendTask({
      id: `temp-${Date.now()}`,
      description: taskData.description,
      completed: false,
      complexity: taskData.complexity,
      type: taskData.taskType,
      anchorTime: taskData.anchorTime,
      inInbox: taskData.inInbox,
    });
  };

  const handlePromoteInboxTask = async (taskId: string) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, inInbox: false } : t
    );
    setTasks(updated);
    await saveToDatabase(updated);
  };

  const handleDeleteInboxTask = async (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    await saveToDatabase(updated);
  };

  if (loading) {
    return (
      <Loading
        fullScreen
        text="Loading your day..."
        size="lg"
      />
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center mb-4">
            <div className="text-red-500">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-center text-slate-900 dark:text-slate-100 mb-2">
            Something went wrong
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            {error}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-2xl font-medium transition"
            >
              Refresh Page
            </button>
            <button
              onClick={() => setError(null)}
              className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-100 px-4 py-3 rounded-2xl font-medium transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Confetti celebration */}
      {showConfetti && (
        <div className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2">
          <ConfettiExplosion
            force={0.6}
            duration={2500}
            particleCount={80}
            width={1200}
          />
        </div>
      )}

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
          {/* Date header */}
          <p className="ml-12 text-base font-semibold text-slate-700 dark:text-slate-300 md:ml-0">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>

          {/* Visual Timeline - Collapsible */}
          <div className="rounded-3xl bg-gradient-to-br from-white/95 via-slate-50/90 to-white/95 p-4 shadow-[0_12px_28px_rgba(100,116,139,0.15)] ring-1 ring-slate-200/50 backdrop-blur-sm dark:from-slate-900/70 dark:via-slate-900/60 dark:to-slate-900/70 dark:ring-slate-800">
            <EnergyTimeline
              workStartTime={scheduleStart}
              hardStopTime={scheduleEnd}
              bedtime="22:00"
              nextWakeTime={scheduleStart}
              currentTime={new Date()}
              currentEnergyLevel={energyLevel}
              timeRemainingMinutes={headerTimeInfo?.totalMinutes ?? null}
              energySchedule={energyScheduleBlocks}
              collapsed={!timelineOpen}
              onToggleCollapsed={() => setTimelineOpen((prev) => !prev)}
            />
          </div>

          <HeaderStatus
            energyLevel={energyLevel}
            focusCount={focusPlanned}
            capacityTarget={capacityTarget}
            flowGreeting={flowGreeting}
            timeInfo={headerTimeInfo}
            onEnergyClick={handleEnergyChange}
          />

          {timeWarning && !timeWarning.showTimeline && (
            <div className="my-2 h-px bg-slate-500/10 dark:bg-slate-400/10" />
          )}

          <TasksCard
            focusTasks={focusTasks.map((task) => ({
              id: task.id,
              description: task.description,
              completed: task.completed,
              complexity: task.complexity,
            }))}
            lifeTasks={lifeTasks.map((task) => ({
              id: task.id,
              description: task.description,
              completed: task.completed,
            }))}
            canAddMoreFocus={capacityInfo.canAddTask}
            onAddFocusTask={handleAddFocusTask}
            onToggleFocusTask={handleToggleFocusTask}
            onFocusTaskClick={handleTaskClick}
            onAddLifeTask={handleAddLifeTask}
            onToggleLifeTask={handleToggleLifeTask}
            onDeleteLifeTask={handleDeleteLifeTask}
          />

          <InboxCard
            tasks={inboxTasks.map((task) => ({
              id: task.id,
              description: task.description,
              complexity: task.complexity,
            }))}
            onPromoteTask={handlePromoteInboxTask}
            onDeleteTask={handleDeleteInboxTask}
          />

        </div>

        {/* Floating Quick Add Button */}
        <button
          type="button"
          onClick={() => setShowQuickAddModal(true)}
          className="fixed bottom-24 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-[0_8px_24px_rgba(6,182,212,0.4)] transition hover:scale-105 hover:shadow-[0_12px_32px_rgba(6,182,212,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 dark:from-cyan-400 dark:to-cyan-500"
          aria-label="Quick add task"
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>

      <TaskModal
        isOpen={showTaskModal}
        mode={taskModalMode}
        taskType={taskModalType}
        initialData={editingTask ? {
          id: editingTask.id,
          description: editingTask.description,
          complexity: editingTask.complexity,
          anchors: editingTask.anchors,
          barrier: editingTask.barrier,
        } : undefined}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskSave}
      />

      <QuickAddModal
        isOpen={showQuickAddModal}
        defaultType="focus"
        onClose={() => setShowQuickAddModal(false)}
        onSave={handleQuickAddSave}
      />
    </>
  );
}
