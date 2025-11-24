'use client';

import { useState, useEffect } from 'react';
import { Compass, Plus, Calendar } from 'lucide-react';
import { FocusSelector } from '@/components/FocusSelector';
import { TasksCard } from '@/components/TasksCard';
import { TaskClarificationModal } from '@/components/TaskClarificationModal';
import { FocusModeOverlay } from '@/components/FocusModeOverlay';
import { WorkTimeline } from '@/components/WorkTimeline';
import { SleepNotification } from '@/components/SleepNotification';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getCheckinByDate, saveCheckinWithFocus, type FocusItemPayload } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';
import { type TaskComplexity, type WorkWindow, COMPLEXITY_COST } from '@/lib/capacity';
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
  const [selectedFocus, setSelectedFocus] = useState<FocusLevel | null>(null);
  const [focusTasks, setFocusTasks] = useState<FocusTask[]>([]);
  const [lifeTasks, setLifeTasks] = useState<LifeTask[]>([]);
  const [showFocusSelector, setShowFocusSelector] = useState(true);
  const [clarificationTaskId, setClarificationTaskId] = useState<string | null>(null);
  const [newTaskDescription, setNewTaskDescription] = useState<string>('');
  const [activeFocusTaskId, setActiveFocusTaskId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timelineCollapsed, setTimelineCollapsed] = useState(true);
  const [wakeTime, setWakeTime] = useState('08:00');

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
          if (checkin.internal_weather && typeof checkin.internal_weather === 'object') {
            const weather = checkin.internal_weather as any;
            if (weather.focus_level) {
              setSelectedFocus(weather.focus_level as FocusLevel);
              setShowFocusSelector(false);
            }

            if (weather.wake_time) {
              setWakeTime(weather.wake_time);
            }
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
        }
      } catch (error) {
        console.error('Error loading today data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTodayData();
  }, [user, authLoading]);

  // Auto-save when tasks or focus level changes
  useEffect(() => {
    // Only save if we have a user and focus level selected
    if (user && selectedFocus && !isLoading) {
      saveToDatabase();
    }
  }, [focusTasks, lifeTasks, selectedFocus, wakeTime]);

  // Convert FocusLevel to internalWeather format
  const getInternalWeather = (focusLevel: FocusLevel) => {
    const mapping: Record<FocusLevel, { key: string; label: string; icon: string }> = {
      focused: {
        key: 'focused',
        label: 'Smooth Sailing',
        icon: '⚓',
      },
      scattered: {
        key: 'scattered',
        label: 'Choppy Waters',
        icon: '🌊',
      },
      unfocused: {
        key: 'unfocused',
        label: 'Navigating Fog',
        icon: '🌫️',
      },
    };
    return mapping[focusLevel];
  };

  // Save to database
  const saveToDatabase = async () => {
    if (!user) {
      console.log('No user, skipping save');
      return;
    }

    if (!selectedFocus) {
      console.log('No focus level selected yet, skipping save');
      return;
    }

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
        internalWeather: getInternalWeather(selectedFocus),
        checkinDate: today,
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

  const handleAddFocusTask = (description?: string) => {
    setNewTaskDescription(description || '');
    setClarificationTaskId('new');
  };

  const handleSaveTask = (taskData: {
    description: string;
    complexity: TaskComplexity;
    categories: string[];
    anchors: TaskAnchor[];
    barrier: { type: string; custom?: string } | null;
  }) => {
    console.log('Saving task with data:', taskData);

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
      console.log('Created new task:', newTask);
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
    setNewTaskDescription('');
  };

  const handleToggleFocusTask = (taskId: string) => {
    setFocusTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleFocusTaskClick = (taskId: string) => {
    setActiveFocusTaskId(taskId);
  };

  const handleDeleteFocusTask = (taskId: string) => {
    setFocusTasks(prev => prev.filter(task => task.id !== taskId));
    if (activeFocusTaskId === taskId) {
      setActiveFocusTaskId(null);
    }
  };

  const handleAddLifeTask = (description: string) => {
    const newTask: LifeTask = {
      id: `life-${Date.now()}`,
      description,
      completed: false,
    };
    setLifeTasks(prev => [...prev, newTask]);
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
  };

  const handleRescheduleFocusTask = (taskId: string) => {
    // TODO: Implement reschedule functionality
    console.log('Reschedule task:', taskId);
  };

  const handleAddBarrier = (taskId: string) => {
    setClarificationTaskId(taskId);
  };

  // Calculate capacity
  const totalCapacity = selectedFocus === 'focused' ? 5 : selectedFocus === 'scattered' ? 3 : 1;
  const usedCapacity = focusTasks.reduce((sum, task) => {
    if (task.completed) return sum;
    return sum + (COMPLEXITY_COST[task.complexity] || 1);
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-orange-50 to-sky-50 dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        <div className="relative z-10 animate-pulse text-slate-500 dark:text-[#a8c5d8] font-crimson">Loading...</div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-orange-50 to-sky-50 dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
          <div
            className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
        </div>
        <div className="relative z-10 text-center">
          <p className="text-slate-600 dark:text-[#a8c5d8] font-crimson">Please log in to continue</p>
        </div>
      </div>
    );
  }

  // Show focus selector if not selected
  if (showFocusSelector || !selectedFocus) {
    return (
      <div className="min-h-screen">
        <FocusSelector
          userContext={'other' as UserContext}
          onSelectFocus={handleFocusSelect}
          onContinue={() => setShowFocusSelector(false)}
          hasDeadlines={false}
        />
      </div>
    );
  }

  const completedTasks = focusTasks.filter(t => t.completed).length + lifeTasks.filter(t => t.completed).length;

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Background - Light mode: warm soft pastels, Dark mode: deep ocean */}
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-orange-50 to-sky-50 dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
        {/* Grid lines */}
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(148, 163, 184, 0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(148, 163, 184, 0.4) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />

        {/* Compass rose decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] dark:opacity-[0.02]">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-slate-400 dark:text-[#d4a574]"/>
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-slate-400 dark:text-[#d4a574]"/>
            <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M50 5 L52 15 L50 12 L48 15 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M50 95 L48 85 L50 88 L52 85 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M5 50 L15 48 L12 50 L15 52 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
            <path d="M95 50 L85 52 L88 50 L85 48 Z" fill="currentColor" className="text-slate-400 dark:text-[#d4a574]"/>
          </svg>
        </div>

        {/* Texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] dark:opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2 pl-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 dark:from-[#d4a574] dark:to-[#c49a6c] flex items-center justify-center shadow-lg">
            <Compass className="h-6 w-6 text-white dark:text-[#0a1628]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-[#f4e9d8] tracking-wide font-cinzel">
              Today's Compass
            </h1>
            <p className="text-sm text-slate-600 dark:text-[#a8c5d8] font-crimson">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
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
          wakeTime={wakeTime}
          focusLevel={selectedFocus}
        />

        {/* Add Task Input - Always under timeline */}
        {canAddMoreFocus && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/80 dark:bg-[#0a1628]/60 backdrop-blur-sm border border-slate-200 dark:border-[#d4a574]/20 focus-within:border-sky-400 dark:focus-within:border-[#d4a574]/40 focus-within:shadow-lg transition-all">
            <input
              type="text"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newTaskDescription.trim()) {
                  handleAddFocusTask(newTaskDescription.trim());
                }
              }}
              placeholder="What's your Compass priority?"
              className="flex-1 bg-transparent border-0 outline-none text-base text-slate-700 dark:text-[#f4e9d8] placeholder-slate-400 dark:placeholder-[#a8c5d8]/60 font-crimson"
            />
            <button
              type="button"
              className="text-slate-400 hover:text-slate-500 dark:text-[#d4a574]/60 dark:hover:text-[#d4a574] transition-colors"
            >
              <Calendar className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (newTaskDescription.trim()) {
                  handleAddFocusTask(newTaskDescription.trim());
                }
              }}
              disabled={!newTaskDescription.trim()}
              className="text-sky-500 hover:text-sky-600 dark:text-[#d4a574] dark:hover:text-[#c49a6c] disabled:text-slate-300 dark:disabled:text-slate-600 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
        )}

        {/* Tasks */}
        <TasksCard
          focusTasks={focusTasks}
          lifeTasks={lifeTasks}
          canAddMoreFocus={canAddMoreFocus}
          focusCapacityTarget={totalCapacity}
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
          taskDescription={newTaskDescription || (clarificationTaskId !== 'new' ? focusTasks.find(t => t.id === clarificationTaskId)?.description || '' : '')}
          onSave={(data) => {
            // Convert the modal's data format to our task format
            const taskData = {
              description: newTaskDescription || (clarificationTaskId !== 'new' ? focusTasks.find(t => t.id === clarificationTaskId)?.description || '' : ''),
              complexity: data.complexity,
              categories: data.category ? [data.category] : [],
              anchors: data.anchor ? [data.anchor] : [],
              barrier: data.barrier ? { type: data.barrier } : null,
            };
            handleSaveTask(taskData);
          }}
          onCancel={() => {
            setClarificationTaskId(null);
            setNewTaskDescription('');
          }}
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
