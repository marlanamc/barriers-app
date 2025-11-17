'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Sunrise, Plus } from 'lucide-react';
import Link from 'next/link';
import { TasksCard } from '@/components/TasksCard';
import { QuickAddModal } from '@/components/modals/QuickAddModal';
import { TaskModal } from '@/components/modals/TaskModal';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getPlannedItems, deletePlannedItem, type PlannedItemWithBarrier } from '@/lib/supabase';
import { TaskComplexity, TaskType } from '@/lib/capacity';

interface TaskAnchor {
  type: 'at' | 'while' | 'before' | 'after';
  value: string;
}

export default function TomorrowPage() {
  const { user } = useSupabaseUser();
  const [loading, setLoading] = useState(true);
  const [plannedItems, setPlannedItems] = useState<PlannedItemWithBarrier[]>([]);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);

  // Calculate tomorrow's date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateString = tomorrow.toISOString().split('T')[0];
  const tomorrowFormatted = tomorrow.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Load tomorrow's planned items
  useEffect(() => {
    if (!user?.id) return;

    const loadItems = async () => {
      try {
        setLoading(true);
        const items = await getPlannedItems(user.id);

        // Filter for tomorrow (one-time items scheduled for tomorrow or recurring items that apply)
        const tomorrowItems = items.filter(item => {
          if (item.recurrence_type === 'once' && item.start_date === tomorrowDateString) {
            return true;
          }
          // TODO: Add recurring item logic for weekly/monthly
          return false;
        });

        setPlannedItems(tomorrowItems);
      } catch (error) {
        console.error('Error loading tomorrow items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [user, tomorrowDateString]);

  const handleQuickAddSave = async (taskData: {
    description: string;
    complexity?: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
    anchors?: TaskAnchor[];
    categories?: string[];
    barrier?: {
      barrierTypeSlug?: string;
      barrierTypeId?: string | null;
      custom?: string;
    };
    inInbox?: boolean;
    scheduledDate?: string;
    scheduledTime?: string;
    focusDate?: string;
  }) => {
    // TODO: Save to planned_items for tomorrow
    console.log('Save to tomorrow:', taskData);
    setShowQuickAddModal(false);
  };

  const handleTaskClick = (taskId: string) => {
    const task = plannedItems.find(t => t.id === taskId);
    if (task) {
      setEditingTask(task);
      setShowTaskModal(true);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deletePlannedItem(taskId);
      setPlannedItems(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading tomorrow...</p>
      </main>
    );
  }

  const focusTasks = plannedItems.filter(t => (t as any).task_type === 'focus');
  const lifeTasks = plannedItems.filter(t => (t as any).task_type === 'life');

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fffaf0] via-[#fff8f0] to-[#fffef6] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0 opacity-80 blur-[60px] dark:hidden"
          aria-hidden
        >
          <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[#ffebd4]" />
          <div className="absolute -bottom-40 right-[-5%] h-96 w-96 rounded-full bg-[#fff4e0]" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 pb-16 pt-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Sunrise className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Tomorrow</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{tomorrowFormatted}</p>
            </div>
          </div>

          {/* Empty state or tasks */}
          {plannedItems.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center py-16">
              <Sunrise className="h-16 w-16 text-amber-400 opacity-50 dark:text-amber-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Nothing planned for tomorrow
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Add your first focus item to get ready for tomorrow.
              </p>
              <button
                onClick={() => setShowQuickAddModal(true)}
                className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-white shadow-lg transition hover:from-amber-600 hover:to-amber-700"
              >
                <Plus className="h-5 w-5" />
                Add Item
              </button>
            </div>
          ) : (
            <TasksCard
              focusTasks={focusTasks.map((task) => ({
                id: task.id,
                description: task.description,
                completed: false,
                complexity: ((task as any).complexity as TaskComplexity) || 'medium',
              }))}
              lifeTasks={lifeTasks.map((task) => ({
                id: task.id,
                description: task.description,
                completed: false,
              }))}
              canAddMoreFocus={focusTasks.length < 5}
              onAddFocusTask={() => setShowQuickAddModal(true)}
              onToggleFocusTask={() => {}}
              onFocusTaskClick={handleTaskClick}
              onDeleteFocusTask={handleDeleteTask}
              onAddLifeTask={() => {}}
              onToggleLifeTask={() => {}}
              onDeleteLifeTask={handleDeleteTask}
            />
          )}
        </div>

        {/* Floating Add Item Button */}
        <button
          type="button"
          onClick={() => setShowQuickAddModal(true)}
          className="fixed bottom-24 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-[0_8px_24px_rgba(245,158,11,0.4)] transition hover:scale-105 hover:shadow-[0_12px_32px_rgba(245,158,11,0.5)]"
          aria-label="Add item for tomorrow"
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>

      <QuickAddModal
        isOpen={showQuickAddModal}
        defaultType="focus"
        defaultInbox={false}
        onClose={() => setShowQuickAddModal(false)}
        onSave={handleQuickAddSave}
      />

      <TaskModal
        isOpen={showTaskModal}
        mode="edit"
        taskType="focus"
        initialData={editingTask}
        onClose={() => setShowTaskModal(false)}
        onSave={() => {}}
      />
    </>
  );
}
