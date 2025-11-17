'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Brain, Plus, ArrowRight, X } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getCheckinByDate, saveCheckinWithFocus, type FocusItemPayload } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';
import { QuickAddModal } from '@/components/modals/QuickAddModal';
import { TaskComplexity, TaskType } from '@/lib/capacity';

interface BrainDumpTask {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
  type: TaskType;
  inInbox: boolean;
}

const COMPLEXITY_STYLES: Record<TaskComplexity, string> = {
  quick: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  deep: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
};

export default function BrainDumpPage() {
  const { user } = useSupabaseUser();
  const [loading, setLoading] = useState(true);
  const [brainDumpTasks, setBrainDumpTasks] = useState<BrainDumpTask[]>([]);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadBrainDumpTasks = async () => {
      try {
        setLoading(true);
        const today = getTodayLocalDateString();
        const checkin = await getCheckinByDate(user.id, today);

        if (checkin) {
          const tasks: BrainDumpTask[] = checkin.focus_items
            .filter((item: any) => item.in_inbox)
            .map((item: any) => ({
              id: item.id,
              description: item.description,
              completed: item.completed || false,
              complexity: (item.complexity as TaskComplexity) || 'medium',
              type: (item.task_type as TaskType) || 'focus',
              inInbox: true,
            }));

          setBrainDumpTasks(tasks);
        }
      } catch (error) {
        console.error('Error loading brain dump:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBrainDumpTasks();
  }, [user]);

  const handlePromoteTask = async (taskId: string) => {
    // Move from brain dump to today
    const updatedTasks = brainDumpTasks.map(t =>
      t.id === taskId ? { ...t, inInbox: false } : t
    );
    setBrainDumpTasks(updatedTasks.filter(t => t.inInbox));
    // TODO: Save to database
  };

  const handleDeleteTask = async (taskId: string) => {
    setBrainDumpTasks(prev => prev.filter(t => t.id !== taskId));
    // TODO: Delete from database
  };

  const handleQuickAddSave = async (taskData: {
    description: string;
    complexity: TaskComplexity;
    taskType: TaskType;
    anchorTime?: string;
    inInbox?: boolean;
  }) => {
    const newTask: BrainDumpTask = {
      id: `temp-${Date.now()}`,
      description: taskData.description,
      completed: false,
      complexity: taskData.complexity,
      type: taskData.taskType,
      inInbox: true,
    };
    setBrainDumpTasks(prev => [...prev, newTask]);
    // TODO: Save to database
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading brain dump...</p>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f5f5f5] via-[#fafafa] to-[#ffffff] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 blur-[60px] dark:hidden"
          aria-hidden
        >
          <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-slate-200" />
          <div className="absolute -bottom-40 right-[-5%] h-96 w-96 rounded-full bg-slate-100" />
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
                <Brain className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Brain Dump</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {brainDumpTasks.length} {brainDumpTasks.length === 1 ? 'thought' : 'thoughts'} captured
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 dark:border-pink-800/30 dark:bg-pink-900/20">
            <p className="text-sm text-pink-900 dark:text-pink-100">
              🧠 <strong>Your Brain Dump</strong> is for those racing thoughts - get them out of your head without pressure.
              When you're ready, promote them to Today or let them go.
            </p>
          </div>

          {/* Task list */}
          {brainDumpTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Brain className="h-16 w-16 text-pink-400 opacity-50 dark:text-pink-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Your brain is clear
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Capture racing thoughts as they come - get them out of your head.
              </p>
              <button
                onClick={() => setShowQuickAddModal(true)}
                className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-3 text-white shadow-lg transition hover:from-pink-700 hover:to-pink-800"
              >
                <Plus className="h-5 w-5" />
                Dump a Thought
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {brainDumpTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {task.description}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${COMPLEXITY_STYLES[task.complexity]}`}
                  >
                    {task.complexity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePromoteTask(task.id)}
                    className="flex items-center gap-1 rounded-lg bg-cyan-600 px-2 py-1 text-xs font-semibold text-white opacity-0 transition hover:bg-cyan-700 group-hover:opacity-100 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                    title="Promote to Today"
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

        {/* Floating Quick Add Button */}
        <button
          type="button"
          onClick={() => setShowQuickAddModal(true)}
          className="fixed bottom-24 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-[0_8px_24px_rgba(219,39,119,0.4)] transition hover:scale-105 hover:shadow-[0_12px_32px_rgba(219,39,119,0.5)]"
          aria-label="Quick add to brain dump"
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>

      <QuickAddModal
        isOpen={showQuickAddModal}
        defaultType="focus"
        defaultInbox={true}
        onClose={() => setShowQuickAddModal(false)}
        onSave={handleQuickAddSave}
      />
    </>
  );
}
