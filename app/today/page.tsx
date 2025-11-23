'use client';

import { useState, useEffect } from 'react';
import { Compass, Plus } from 'lucide-react';
import { FocusSelector } from '@/components/FocusSelector';
import { TasksCard } from '@/components/TasksCard';
import { TaskClarificationModal } from '@/components/TaskClarificationModal';
import { FocusModeOverlay } from '@/components/FocusModeOverlay';
import { WorkTimeline } from '@/components/WorkTimeline';
import { SleepNotification } from '@/components/SleepNotification';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getCheckinByDate, saveCheckinWithFocus, type FocusItemPayload } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';
import { calculateCapacity, type TaskComplexity, type WorkWindow } from '@/lib/capacity';
import type { FocusLevel, UserContext } from '@/lib/user-context';
import type { BarrierType } from '@/lib/barriers';

interface TaskAnchor {
  type: 'at' | 'while' | 'before' | 'after';
  value: string;
}

interface FocusTask {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
  anchors?: TaskAnchor[];
  categories?: string[];
  barrier?: {
    type: string;
    icon?: string;
    custom?: string;
  };
}

interface LifeTask {
  id: string;
  description: string;
  completed: boolean;
  anchorTime?: string;
}

interface WorkBlock {
  start: string;
  end: string;
  window: WorkWindow;
  label?: string;
}

export default function TodayPage() {
  const { user, loading: authLoading } = useSupabaseUser();

  // State
  const [userContext, setUserContext] = useState<UserContext>({
    wakeTime: '08:00',
    sleepTime: '23:00',
    hasDeadlines: false,
  });
  const [selectedFocus, setSelectedFocus] = useState<FocusLevel | null>(null);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  const [lifeTasks, setLifeTasks] = useState<LifeTask[]>([]);
  const [showFocusSelector, setShowFocusSelector] = useState(true);
  const [clarificationTaskId, setClarificationTaskId] = useState<string | null>(null);
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  // Load today's data
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setIsLoading(false);
      return;
    }

    const loadTodayData = async () => {
      try {
        const today = getTodayLocalDateString();
        const checkin = await getCheckinByDate(user.id, today);

        if (checkin) {
          // Load existing data
          if (checkin.internal_weather?.focus_level) {
            setSelectedFocus(checkin.internal_weather.focus_level as FocusLevel);
            setShowFocusSelector(false);
          }

          if (checkin.focus_items && Array.isArray(checkin.focus_items)) {
            const loadedFocusTasks: FocusTask[] = checkin.focus_items
              .filter((item: any) => item.task_type === 'focus')
              .map((item: any) => ({
                id: item.id,
                description: item.description,
                completed: item.completed || false,
                complexity: (item.complexity || 'quick') as TaskComplexity,
                anchors: item.anchors || [],
                categories: item.categories || [],
                barrier: item.barrier || undefined,
              }));

            const loadedLifeTasks: LifeTask[] = checkin.focus_items
              .filter((item: any) => item.task_type === 'life')
              .map((item: any) => ({
                id: item.id,
                description: item.description,
                completed: item.completed || false,
                anchorTime: item.anchor_value || undefined,
              }));

            setFocusTasks(loadedFocusTasks);
            setLifeTasks(loadedLifeTasks);
          }

          // Load user context
          if (checkin.internal_weather) {
            setUserContext(prev => ({
              ...prev,
              wakeTime: checkin.internal_weather.wake_time || prev.wakeTime,
              sleepTime: checkin.internal_weather.sleep_time || prev.sleepTime,
              hasDeadlines: checkin.internal_weather.has_deadlines || false,
            }));
          }
        }
      } catch (error) {
        console.error('Error loading today data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayData();
  }, [user, authLoading]);

  // Save to database
  const saveToDatabase = async () => {
    if (!user || !selectedFocus) return;

    try {
      const today = getTodayLocalDateString();
      const allTasks = [...focusTasks, ...lifeTasks];

      const focusItemsPayload: FocusItemPayload[] = allTasks.map((task, index) => {
        if ('complexity' in task) {
          // Focus task
          return {
            id: task.id,
            description: task.description,
            categories: task.categories || [],
            sortOrder: index,
            taskType: 'focus',
            complexity: task.complexity,
            completed: task.completed,
            anchors: task.anchors || [],
            anchorType: null,
            anchorValue: null,
            barrier: task.barrier || null,
          };
        } else {
          // Life task
          return {
            id: task.id,
            description: task.description,
            categories: [],
            sortOrder: index,
            taskType: 'life',
            complexity: 'quick',
            completed: task.completed,
            anchors: [],
            anchorType: null,
            anchorValue: task.anchorTime || null,
            barrier: null,
          };
        }
      });

      await saveCheckinWithFocus({
        userId: user.id,
        internalWeather: {
          focusLevel: selectedFocus,
          wakeTime: userContext.wakeTime,
          sleepTime: userContext.sleepTime,
          hasDeadlines: userContext.hasDeadlines,
        },
        date: today,
        focusItems: focusItemsPayload,
      });
    } catch (error) {
      console.error('Error saving to database:', error);
    }
  };

  // Handlers
  const handleFocusSelect = (focus: FocusLevel) => {
    setSelectedFocus(focus);
    setShowFocusSelector(false);
    saveToDatabase();
  };

  const handleAddFocusTask = () => {
    setClarificationTaskId('new');
  };

  const handleSaveTask = (taskData: {
    description: string;
    complexity: TaskComplexity;
    categories: string[];
    anchors: TaskAnchor[];
    barrier: { type: string; custom?: string } | null;
  }) => {
    if (clarificationTaskId === 'new') {
      // New task
      const newTask: FocusTask = {
        id: `task-${Date.now()}`,
        description: taskData.description,
        completed: false,
        complexity: taskData.complexity,
        categories: taskData.categories,
        anchors: taskData.anchors,
        barrier: taskData.barrier || undefined,
      };
      setFocusTasks(prev => [...prev, newTask]);
    } else if (clarificationTaskId) {
      // Edit existing task
      setFocusTasks(prev =>
        prev.map(task =>
          task.id === clarificationTaskId
            ? {
              ...task,
              description: taskData.description,
              complexity: taskData.complexity,
              categories: taskData.categories,
              anchors: taskData.anchors,
              barrier: taskData.barrier || undefined,
            }
            : task
        )
      );
    }
    setClarificationTaskId(null);
    saveToDatabase();
  };

  const handleToggleFocusTask = (taskId: string) => {
    setFocusTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    saveToDatabase();
  };

  const handleFocusTaskClick = (taskId: string) => {
    setActiveFocusTaskId(taskId);
  };

  const handleDeleteFocusTask = (taskId: string) => {
    setFocusTasks(prev => prev.filter(task => task.id !== taskId));
    saveToDatabase();
  };

  const handleAddLifeTask = (description: string) => {
    const newTask: LifeTask = {
      id: `life-${Date.now()}`,
      description,
      completed: false,
    };
    setLifeTasks(prev => [...prev, newTask]);
    saveToDatabase();
  };

  const handleToggleLifeTask = (taskId: string) => {
    setLifeTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    saveToDatabase();
  };

  const handleDeleteLifeTask = (taskId: string) => {
    setLifeTasks(prev => prev.filter(task => task.id !== taskId));
    saveToDatabase();
  };

  const handleRescheduleFocusTask = (taskId: string) => {
    // TODO: Implement reschedule functionality
    console.log('Reschedule task:', taskId);
  };

  const handleAddBarrier = (taskId: string) => {
    setClarificationTaskId(taskId);
  };

  // Calculate capacity
  const capacity = selectedFocus ? calculateCapacity(selectedFocus) : { quick: 0, medium: 0, deep: 0 };
  const totalCapacity = capacity.quick + capacity.medium + capacity.deep;
  const usedCapacity = focusTasks.reduce((sum, task) => {
    if (task.completed) return sum;
    return sum + (task.complexity === 'quick' ? 1 : task.complexity === 'medium' ? 2 : 3);
  }, 0);
  const canAddMoreFocus = usedCapacity < totalCapacity;

  // Work blocks for timeline
  const workBlocks: WorkBlock[] = [
    { start: '08:00', end: '12:00', window: 'deep', label: 'Morning' },
    { start: '12:00', end: '17:00', window: 'light', label: 'Afternoon' },
    { start: '17:00', end: '22:00', window: 'rest', label: 'Evening' },
  ];

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse text-slate-500">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Please log in to continue</p>
        </div>
      </div>
    );
  }

  // Show focus selector if not selected
  if (showFocusSelector || !selectedFocus) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <FocusSelector
          userContext={userContext}
          onSelectFocus={handleFocusSelect}
          hasDeadlines={userContext.hasDeadlines}
        />
      </div>
    );
  }

  const completedTasks = focusTasks.filter(t => t.completed).length + lifeTasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="h-8 w-8 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Today's Compass
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <WorkTimeline
          workBlocks={workBlocks}
          currentTime={new Date()}
          completedTasks={completedTasks}
          totalCapacity={totalCapacity}
          collapsed={timelineCollapsed}
          onToggleCollapsed={() => setTimelineCollapsed(!timelineCollapsed)}
          wakeTime={userContext.wakeTime}
          focusLevel={selectedFocus}
        />

        {/* Sleep Notification */}
        <SleepNotification wakeTime={userContext.wakeTime} />

        {/* Tasks */}
        <TasksCard
          focusTasks={focusTasks}
          lifeTasks={lifeTasks}
          canAddMoreFocus={canAddMoreFocus}
          focusCapacityTarget={totalCapacity}
          onAddFocusTask={handleAddFocusTask}
          onToggleFocusTask={handleToggleFocusTask}
          onFocusTaskClick={handleFocusTaskClick}
          onDeleteFocusTask={handleDeleteFocusTask}
          onAddLifeTask={handleAddLifeTask}
          onToggleLifeTask={handleToggleLifeTask}
          onDeleteLifeTask={handleDeleteLifeTask}
          onRescheduleFocusTask={handleRescheduleFocusTask}
          onAddBarrier={handleAddBarrier}
        />
      </div>

      {/* Task Clarification Modal */}
      {clarificationTaskId && (
        <TaskClarificationModal
          isOpen={true}
          onClose={() => setClarificationTaskId(null)}
          onSave={handleSaveTask}
          initialData={
            clarificationTaskId !== 'new'
              ? focusTasks.find(t => t.id === clarificationTaskId)
              : undefined
          }
        />
      )}

      {/* Focus Mode Overlay */}
      {activeFocusTaskId && (() => {
        const task = focusTasks.find(t => t.id === activeFocusTaskId);
        if (!task) return null;
        return (
          <FocusModeOverlay
            task={task}
            onComplete={() => {
              handleToggleFocusTask(task.id);
              setActiveFocusTaskId(null);
            }}
            onMinimize={() => setActiveFocusTaskId(null)}
            onStuck={() => {
              setActiveFocusTaskId(null);
              handleAddBarrier(task.id);
            }}
            onDelete={() => {
              handleDeleteFocusTask(task.id);
              setActiveFocusTaskId(null);
            }}
          />
        );
      })()}
    </div>
  );
}
