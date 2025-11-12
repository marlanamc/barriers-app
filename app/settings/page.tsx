'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Tag, Anchor } from 'lucide-react';
import { EnergyScheduleEditor } from '@/components/EnergyScheduleEditor';
import { CustomTagsEditor } from '@/components/CustomTagsEditor';
import { CustomAnchorsEditor } from '@/components/CustomAnchorsEditor';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const [scheduleChanged, setScheduleChanged] = useState(false);
  const [tagsChanged, setTagsChanged] = useState(false);
  const [anchorsChanged, setAnchorsChanged] = useState(false);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </main>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              Manage your energy schedule and preferences
            </p>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
            <div className="mb-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Energy Schedule</h2>
            </div>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Set your energy levels throughout the day. Your energy will automatically adjust based on your schedule, 
              and you'll receive gentle notifications when entering resting periods.
            </p>
            <EnergyScheduleEditor onScheduleChange={() => setScheduleChanged(true)} />
            {scheduleChanged && (
              <div className="mt-4 rounded-lg bg-cyan-50 p-3 text-sm text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200">
                Schedule updated! Your energy will adjust automatically throughout the day.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
            <div className="mb-4 flex items-center gap-3">
              <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Custom Tags</h2>
            </div>
            <CustomTagsEditor onTagsChange={() => setTagsChanged(true)} />
            {tagsChanged && (
              <div className="mt-4 rounded-lg bg-purple-50 p-3 text-sm text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
                Custom tags updated! They'll now appear when adding focus items.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
            <div className="mb-4 flex items-center gap-3">
              <Anchor className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Anchor Presets</h2>
            </div>
            <CustomAnchorsEditor onAnchorsChange={() => setAnchorsChanged(true)} />
            {anchorsChanged && (
              <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-900/20 dark:text-teal-200">
                Anchor presets updated! They'll now appear when linking tasks to time or rhythm.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

