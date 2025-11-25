'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ListChecks, Filter } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getCheckinByDate, getPlannedItems } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';
import { TaskComplexity, TaskType } from '@/lib/capacity';

interface Task {
  id: string;
  description: string;
  completed: boolean;
  complexity: TaskComplexity;
  type: TaskType;
  source: 'today' | 'planned' | 'inbox';
  date?: string;
  inInbox?: boolean;
}

const COMPLEXITY_STYLES: Record<TaskComplexity, string> = {
  quick: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  deep: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
};

const SOURCE_LABELS = {
  today: 'Today',
  planned: 'Planned',
  inbox: 'Inbox',
};

export default function AllTasksPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'focus' | 'life'>('all');
  const [filterSource, setFilterSource] = useState<'all' | 'today' | 'planned' | 'inbox'>('all');

  useEffect(() => {
    if (!user) return;

    const loadAllTasks = async () => {
      try {
        setLoading(true);
        const today = getTodayLocalDateString();
        const tasks: Task[] = [];

        // Load today's tasks
        const checkin = await getCheckinByDate(user.id, today);
        if (checkin) {
          checkin.focus_items.forEach((item: any) => {
            tasks.push({
              id: item.id,
              description: item.description,
              completed: item.completed || false,
              complexity: (item.complexity as TaskComplexity) || 'medium',
              type: (item.task_type as TaskType) || 'focus',
              source: item.in_inbox ? 'inbox' : 'today',
              inInbox: item.in_inbox,
            });
          });
        }

        // Load planned items
        const plannedItems = await getPlannedItems(user.id);
        plannedItems.forEach((item) => {
          if (item.recurrence_type === 'once' && item.start_date !== today) {
            tasks.push({
              id: item.id,
              description: item.description,
              completed: false,
              complexity: ((item as any).complexity as TaskComplexity) || 'medium',
              type: ((item as any).task_type as TaskType) || 'focus',
              source: 'planned',
              date: item.start_date,
            });
          }
        });

        setAllTasks(tasks);
      } catch (error) {
        console.error('Error loading all tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAllTasks();
  }, [user]);

  const filteredTasks = allTasks.filter((task) => {
    if (filterType !== 'all' && task.type !== filterType) return false;
    if (filterSource !== 'all' && task.source !== filterSource) return false;
    return true;
  });

  const focusCount = allTasks.filter(t => t.type === 'focus').length;
  const lifeCount = allTasks.filter(t => t.type === 'life').length;
  const todayCount = allTasks.filter(t => t.source === 'today').length;
  const plannedCount = allTasks.filter(t => t.source === 'planned').length;
  const inboxCount = allTasks.filter(t => t.source === 'inbox').length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading all tasks...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#faf5ff] via-[#fefcff] to-[#fffef6] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80 blur-[60px] dark:hidden"
        aria-hidden
      >
        <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[#f0e7ff]" />
        <div className="absolute -bottom-40 right-[-5%] h-96 w-96 rounded-full bg-[#e7f0ff]" />
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
              <ListChecks className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">All Tasks</h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {filteredTasks.length !== allTasks.length && ` (filtered from ${allTasks.length})`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800/30 dark:bg-purple-900/20">
          <div className="mb-3 flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-700 dark:text-purple-300" />
            <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Filters</h3>
          </div>

          <div className="space-y-3">
            {/* Type filter */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">Type</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterType === 'all'
                      ? 'bg-purple-600 text-white dark:bg-purple-500'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  All ({allTasks.length})
                </button>
                <button
                  onClick={() => setFilterType('focus')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterType === 'focus'
                      ? 'bg-purple-600 text-white dark:bg-purple-500'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Focus ({focusCount})
                </button>
                <button
                  onClick={() => setFilterType('life')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterType === 'life'
                      ? 'bg-purple-600 text-white dark:bg-purple-500'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Life ({lifeCount})
                </button>
              </div>
            </div>

            {/* Source filter */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">Source</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterSource('all')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterSource === 'all'
                      ? 'bg-purple-600 text-white dark:bg-purple-500'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterSource('today')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterSource === 'today'
                      ? 'bg-purple-600 text-white dark:bg-purple-500'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Today ({todayCount})
                </button>
                <button
                  onClick={() => setFilterSource('planned')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterSource === 'planned'
                      ? 'bg-purple-600 text-white dark:bg-purple-500'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Planned ({plannedCount})
                </button>
                <button
                  onClick={() => setFilterSource('inbox')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filterSource === 'inbox'
                      ? 'bg-purple-600 text-white dark:bg-purple-500'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Inbox ({inboxCount})
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ListChecks className="h-16 w-16 text-purple-400 opacity-50 dark:text-purple-600" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              No tasks found
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              {filterType !== 'all' || filterSource !== 'all'
                ? 'Try adjusting your filters'
                : 'Add some tasks to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800/60"
              >
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    task.completed
                      ? 'text-slate-500 line-through dark:text-slate-400'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {task.description}
                  </p>
                  {task.date && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(task.date + 'T00:00:00').toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  )}
                </div>

                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${COMPLEXITY_STYLES[task.complexity]}`}
                >
                  {task.complexity}
                </span>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {SOURCE_LABELS[task.source]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
