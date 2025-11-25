'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Check } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useReflect } from '@/hooks/useReflect';
import { useThoughts } from '@/hooks/useThoughts';
import { getCheckinByDate } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';
import { NervousSystemCheck } from '@/components/reflect/NervousSystemCheck';
import { BandwidthCheck } from '@/components/reflect/BandwidthCheck';
import { PriorityReview } from '@/components/reflect/PriorityReview';
import { ThoughtOffload } from '@/components/reflect/ThoughtOffload';
import { EaseTomorrow } from '@/components/reflect/EaseTomorrow';
import { AddThoughtModal } from '@/components/logbook/AddThoughtModal';
import { PageBackground } from '@/components/PageBackground';

export default function ReflectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    data,
    loading,
    saving,
    error,
    updateSignals,
    updateBandwidth,
    updatePriorityOutcome,
    updateTomorrowPrep,
    saveReflect,
  } = useReflect(user?.id);
  const { addThought } = useThoughts(user?.id);

  const [showThoughtModal, setShowThoughtModal] = useState(false);
  const [todaysPriority, setTodaysPriority] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  // Load today's priority if exists
  useEffect(() => {
    async function loadPriority() {
      if (!user) return;

      try {
        const today = getTodayLocalDateString();
        const checkin = await getCheckinByDate(user.id, today);

        if (checkin?.focus_items && checkin.focus_items.length > 0) {
          // Find the first focus item (priority)
          const priority = checkin.focus_items.find(
            (item: any) => item.task_type === 'focus' || item.task_type === 'priority'
          );
          if (priority) {
            setTodaysPriority(priority.description);
          }
        }
      } catch (err) {
        console.error('Error loading priority:', err);
      }
    }

    loadPriority();
  }, [user]);

  const handleSaveThought = async (text: string) => {
    await addThought(text);
  };

  const handleFinish = async () => {
    const success = await saveReflect();
    if (success) {
      setCompleted(true);
      // Return to home after brief delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <PageBackground symbol="moon-stars" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-violet-200 dark:border-violet-800 border-t-violet-600 dark:border-t-violet-400 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-crimson">Loading...</p>
        </div>
      </main>
    );
  }

  if (completed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <PageBackground symbol="moon-stars" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="mb-4 rounded-full bg-violet-100 dark:bg-violet-900/30 p-4 inline-flex">
            <Check className="h-8 w-8 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 font-cinzel mb-2">
            You did enough today.
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 font-crimson">
            Rest well, Captain.
          </p>
        </div>
      </main>
    );
  }

  return (
    <>
      <PageBackground symbol="moon-stars" />
      <main className="relative min-h-screen pb-36">

        <div className="relative mx-auto max-w-lg px-4 pt-6">
          {/* Header - offset for side panel */}
          <div className="mb-6 pl-12 sm:pl-14">
            <div className="flex items-center gap-2 mb-1">
              <Moon className="h-5 w-5 text-violet-500 dark:text-violet-400" />
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-cinzel">
                Evening Reflect
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {/* Nervous System Check */}
            <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-100 dark:border-slate-700 p-5 shadow-sm">
              <NervousSystemCheck
                selected={data.nervous_system_signals}
                onChange={updateSignals}
              />
            </section>

            {/* Bandwidth Check */}
            <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-100 dark:border-slate-700 p-5 shadow-sm">
              <BandwidthCheck
                selected={data.bandwidth}
                onChange={updateBandwidth}
              />
            </section>

            {/* Priority Review - only show if there was a priority today */}
            {todaysPriority && (
              <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-100 dark:border-slate-700 p-5 shadow-sm">
                <PriorityReview
                  priorityText={todaysPriority}
                  selected={data.priority_outcome}
                  onChange={updatePriorityOutcome}
                />
              </section>
            )}

            {/* Thought Offload */}
            <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-100 dark:border-slate-700 p-5 shadow-sm">
              <ThoughtOffload onAddThought={() => setShowThoughtModal(true)} />
            </section>

            {/* Ease Tomorrow */}
            <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-violet-100 dark:border-slate-700 p-5 shadow-sm">
              <EaseTomorrow
                selected={data.tomorrow_prep}
                onChange={updateTomorrowPrep}
              />
            </section>
          </div>
        </div>

        {/* Finish Button - Fixed at bottom */}
        <div className="fixed bottom-20 inset-x-0 px-4 pb-4">
          <div className="mx-auto max-w-lg space-y-3">
            {error && (
              <div className="rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 p-3 text-center">
                <p className="text-sm text-rose-700 dark:text-rose-300 font-crimson">{error}</p>
              </div>
            )}
            <button
              onClick={handleFinish}
              disabled={saving}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 dark:from-violet-600 dark:to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 font-crimson"
            >
              {saving ? 'Saving...' : 'Complete Reflection'}
            </button>
          </div>
        </div>
      </main>

      {/* Add Thought Modal */}
      <AddThoughtModal
        isOpen={showThoughtModal}
        onClose={() => setShowThoughtModal(false)}
        onSave={handleSaveThought}
      />
    </>
  );
}
