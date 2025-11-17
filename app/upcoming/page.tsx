'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, CalendarRange, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getPlannedItems, type PlannedItemWithBarrier } from '@/lib/supabase';
import { TaskComplexity } from '@/lib/capacity';

interface GroupedTasks {
  [date: string]: PlannedItemWithBarrier[];
}

const COMPLEXITY_STYLES: Record<TaskComplexity, string> = {
  quick: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  medium: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
  deep: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
};

export default function UpcomingPage() {
  const { user } = useSupabaseUser();
  const [loading, setLoading] = useState(true);
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Get next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const next7Days = getNext7Days();

  useEffect(() => {
    if (!user?.id) return;

    const loadItems = async () => {
      try {
        setLoading(true);
        const items = await getPlannedItems(user.id);

        // Group items by date
        const grouped: GroupedTasks = {};
        next7Days.forEach(date => {
          grouped[date] = items.filter(item => {
            // For now, only handle 'once' type items
            return item.recurrence_type === 'once' && item.start_date === date;
          });
        });

        setGroupedTasks(grouped);

        // Auto-expand days with tasks
        const daysWithTasks = new Set(
          Object.entries(grouped)
            .filter(([_, tasks]) => tasks.length > 0)
            .map(([date]) => date)
        );
        setExpandedDates(daysWithTasks);
      } catch (error) {
        console.error('Error loading upcoming items:', error);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [user]);

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    }
    if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    }

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading upcoming tasks...</p>
      </main>
    );
  }

  const totalTasks = Object.values(groupedTasks).reduce((sum, tasks) => sum + tasks.length, 0);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f0f4ff] via-[#faf9ff] to-[#fffef6] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80 blur-[60px] dark:hidden"
        aria-hidden
      >
        <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[#e0edff]" />
        <div className="absolute -bottom-40 right-[-5%] h-96 w-96 rounded-full bg-[#f0e7ff]" />
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
              <CalendarRange className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Next 7 Days</h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'} planned
            </p>
          </div>
        </div>

        {/* Days list */}
        <div className="space-y-3">
          {next7Days.map((date) => {
            const tasks = groupedTasks[date] || [];
            const isExpanded = expandedDates.has(date);
            const isEmpty = tasks.length === 0;

            return (
              <div
                key={date}
                className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80"
              >
                <button
                  type="button"
                  onClick={() => !isEmpty && toggleDate(date)}
                  className={`flex w-full items-center gap-3 p-4 text-left transition ${
                    !isEmpty ? 'hover:bg-slate-50 dark:hover:bg-slate-800/60' : ''
                  }`}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(date)}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {isEmpty ? 'No tasks planned' : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'}`}
                    </p>
                  </div>
                  {!isEmpty && (
                    isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-slate-400" />
                    )
                  )}
                </button>

                {isExpanded && tasks.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 p-4 dark:border-slate-700">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                            {task.description}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            COMPLEXITY_STYLES[((task as any).complexity as TaskComplexity) || 'medium']
                          }`}
                        >
                          {(task as any).complexity || 'medium'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {totalTasks === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <CalendarRange className="h-16 w-16 text-indigo-400 opacity-50 dark:text-indigo-600" />
            <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Nothing planned for the week
            </h2>
            <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
              Use the side menu to plan ahead or add items to specific days.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
