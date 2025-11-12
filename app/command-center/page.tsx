'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StatusHeader } from '@/components/command-center/StatusHeader';
import { FocusSection } from '@/components/command-center/FocusSection';
import { LifeSection } from '@/components/command-center/LifeSection';
import { ContextualMessage } from '@/components/command-center/ContextualMessage';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import {
  EnergyLevel,
  TaskComplexity,
  TaskType,
  getCapacityInfo,
  getTimeUntilStop,
  getContextualMessage
} from '@/lib/capacity';

// Temporary mock data - will be replaced with real data from database
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
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | null>('steady');
  const [hardStopTime, setHardStopTime] = useState<string>('18:00');
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      description: 'Apply to 3 jobs',
      completed: false,
      complexity: 'deep',
      type: 'focus',
      anchorTime: '10am',
      barrier: {
        type: 'overwhelm',
      },
    },
    {
      id: '2',
      description: 'Email recruiter',
      completed: false,
      complexity: 'quick',
      type: 'focus',
      anchorTime: '2pm',
    },
    {
      id: '3',
      description: 'Take morning meds',
      completed: true,
      complexity: 'quick',
      type: 'life',
    },
    {
      id: '4',
      description: 'Drink water',
      completed: true,
      complexity: 'quick',
      type: 'life',
    },
    {
      id: '5',
      description: 'Feed cat',
      completed: false,
      complexity: 'quick',
      type: 'life',
    },
  ]);

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
    router.push('/focus'); // Temporary - will create energy selector modal
  };

  const handleAddFocusTask = () => {
    router.push('/focus'); // Temporary - will create task add modal
  };

  const handleToggleFocusTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleTaskClick = (taskId: string) => {
    // TODO: Open task detail modal
    console.log('Task clicked:', taskId);
  };

  const handleAddLifeTask = (description: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      description,
      completed: false,
      complexity: 'quick',
      type: 'life',
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleToggleLifeTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteLifeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const focusCompleted = focusTasks.filter((t) => t.completed).length;
  const lifeCompleted = lifeTasks.filter((t) => t.completed).length;

  return (
    <main className="min-h-screen pb-24">
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
  );
}
