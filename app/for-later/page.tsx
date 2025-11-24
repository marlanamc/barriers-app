'use client';

import { useState, useEffect } from 'react';
import { Clock, ArrowRight, X, Plus } from 'lucide-react';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getCheckinByDate } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';
import type { TaskComplexity, TaskType } from '@/lib/capacity';
import { QuickAddModal } from '@/components/modals/QuickAddModal';

interface ForLaterTask {
  id: string;
  description: string;
  complexity: TaskComplexity;
}

const COMPLEXITY_STYLES: Record<TaskComplexity, string> = {
  quick: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  deep: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
};

const COMPLEXITY_LABEL: Record<TaskComplexity, string> = {
  quick: 'Quick',
  medium: 'Medium',
  deep: 'Deep',
};

export default function ForLaterPage() {
  const { user } = useSupabaseUser();
  const [tasks, setTasks] = useState<ForLaterTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      try {
        setLoading(true);
        const today = getTodayLocalDateString();
        const checkin = await getCheckinByDate(user.id, today);
        
        if (checkin?.focus_items) {
          const forLaterTasks = checkin.focus_items
            .filter((item: any) => item.in_inbox)
            .map((item: any) => ({
              id: item.id,
              description: item.description,
              complexity: (item.complexity as TaskComplexity) || 'medium',
            }));
          setTasks(forLaterTasks);
        }
      } catch (error) {
        console.error('Error loading for later tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, [user]);

  const handlePromoteTask = async (taskId: string) => {
    // TODO: Move task from for-later to today's focus
    console.log('Promote task:', taskId);
  };

  const handleDeleteTask = async (taskId: string) => {
    // TODO: Delete task
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleQuickAddSave = async (taskData: {
    description: string;
    complexity?: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
    anchors?: { type: 'at' | 'while' | 'before' | 'after'; value: string }[];
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
    // TODO: Save task to for-later
    console.log('Save to for later:', taskData);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0f4ff] via-[#faf9ff] to-[#fffef6] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 pb-16 pt-6">
          {/* Header */}
          <div className="flex items-center gap-4 pl-12 sm:pl-14">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">For Later</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} saved for later
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800/30 dark:bg-indigo-900/20">
            <p className="text-sm text-indigo-900 dark:text-indigo-100">
              💭 <strong>For Later</strong> is where you save tasks you want to revisit when you're ready. Promote them to Focus when you have capacity.
            </p>
          </div>

          {/* Tasks list */}
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Clock className="h-16 w-16 text-indigo-400 opacity-50 dark:text-indigo-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Nothing saved for later
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Save tasks here when you want to revisit them later.
              </p>
              <button
                onClick={() => setShowQuickAdd(true)}
                className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 text-white shadow-lg transition hover:from-indigo-700 hover:to-indigo-800"
              >
                <Plus className="h-5 w-5" />
                Add Task
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {task.description}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${COMPLEXITY_STYLES[task.complexity]}`}
                  >
                    {COMPLEXITY_LABEL[task.complexity]}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePromoteTask(task.id)}
                    className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2 py-1 text-xs font-semibold text-white opacity-0 transition hover:bg-cyan-700 group-hover:opacity-100 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                    title="Promote to Focus"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="rounded-lg p-1 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                    aria-label="Delete"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Item Button */}
        <button
          type="button"
          onClick={() => setShowQuickAdd(true)}
          className="fixed bottom-24 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-[0_8px_24px_rgba(99,102,241,0.4)] transition hover:scale-105 hover:shadow-[0_12px_32px_rgba(99,102,241,0.5)]"
          aria-label="Add item to for later"
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>

      <QuickAddModal
        isOpen={showQuickAdd}
        defaultType="focus"
        defaultInbox={true}
        onClose={() => setShowQuickAdd(false)}
        onSave={handleQuickAddSave}
      />
    </>
  );
}

