'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatusHeader } from '@/components/command-center/StatusHeader';
import { FocusSection } from '@/components/command-center/FocusSection';
import { LifeSection } from '@/components/command-center/LifeSection';
import { ContextualMessage } from '@/components/command-center/ContextualMessage';
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
  const router = useRouter();

  // State
  const [loading, setLoading] = useState(true);
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>(null);
  const [hardStopTime, setHardStopTime] = useState<string>('18:00');
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
      const newTask: Task = {
        id: `temp-${Date.now()}`,
        description: taskData.description,
        completed: false,
        complexity: taskData.complexity,
        type: taskData.taskType,
        anchorTime: taskData.anchorTime,
      };
      const updated = [...tasks, newTask];
      setTasks(updated);
      await saveToDatabase(updated);
    }
  };

  const handleAddLifeTask = async (description: string) => {
    const newTask: Task = {
      id: `temp-life-${Date.now()}`,
      description,
      completed: false,
      complexity: 'quick',
      type: 'life',
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    await saveToDatabase(updated);
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

  const focusCompleted = focusTasks.filter((t) => t.completed).length;
  const lifeCompleted = lifeTasks.filter((t) => t.completed).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading your day...</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen pb-24">
        {/* App Title */}
        <div className="border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
          <h1 className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
            ADHD Barrier Tracker
          </h1>
        </div>

        {/* Status Header */}
        <StatusHeader
          energyLevel={energyLevel}
          hardStopTime={hardStopTime}
          focusCount={focusTasks.length}
          focusCompleted={focusCompleted}
          totalCapacity={capacityInfo.totalCapacity}
          usedCapacity={capacityInfo.usedCapacity}
          lifeCount={lifeTasks.length}
          onEnergyChange={handleEnergyChange}
        />

        {/* Main Content */}
        <div className="mx-auto max-w-2xl space-y-6 p-4">
          {/* Contextual Message */}
          {contextual.action && (
            <ContextualMessage
              type={contextual.type}
              message={contextual.message}
              action={contextual.action}
              onAction={handleEnergyChange}
            />
          )}

          {/* Focus Items Section */}
          <FocusSection
            tasks={focusTasks.map((t) => ({
              id: t.id,
              description: t.description,
              completed: t.completed,
              complexity: t.complexity,
              anchorTime: t.anchorTime,
              barrier: t.barrier,
            }))}
            canAddMore={capacityInfo.canAddTask}
            onAddTask={handleAddFocusTask}
            onToggleTask={handleToggleFocusTask}
            onTaskClick={handleTaskClick}
          />

          {/* Divider */}
          <div className="border-t border-slate-200 dark:border-slate-700" />

          {/* Life Maintenance Section */}
          <LifeSection
            tasks={lifeTasks.map((t) => ({
              id: t.id,
              description: t.description,
              completed: t.completed,
            }))}
            onAddTask={handleAddLifeTask}
            onToggleTask={handleToggleLifeTask}
            onDeleteTask={handleDeleteLifeTask}
          />
        </div>
      </main>

      {/* Modals */}
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
