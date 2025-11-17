'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Tag, Anchor, ChevronDown, Sun, Moon } from 'lucide-react';
import { EnergyScheduleEditor } from '@/components/EnergyScheduleEditor';
import { CustomTagsEditor } from '@/components/CustomTagsEditor';
import { CustomAnchorsEditor } from '@/components/CustomAnchorsEditor';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { supabase } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useSupabaseUser();
  const [scheduleChanged, setScheduleChanged] = useState(false);
  const [tagsChanged, setTagsChanged] = useState(false);
  const [anchorsChanged, setAnchorsChanged] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('wake-bedtime');

  // Wake/Bedtime state (default times - per-day times set via energy schedule)
  const [wakeTime, setWakeTime] = useState('08:00');
  const [bedtime, setBedtime] = useState('22:00');
  const [timesSaved, setTimesSaved] = useState(false);

  // Load wake/bedtime from user metadata
  useEffect(() => {
    if (user) {
      const metadata = (user as any).user_metadata || {};
      setWakeTime(metadata.wake_time || '08:00');
      setBedtime(metadata.bedtime || '22:00');
    }
  }, [user]);

  const handleSaveTimes = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          wake_time: wakeTime,
          bedtime: bedtime,
        },
      });

      if (error) throw error;

      setTimesSaved(true);
      setTimeout(() => setTimesSaved(false), 3000);
    } catch (error) {
      console.error('Error saving wake/bedtime:', error);
      alert('Failed to save times. Please try again.');
    }
  };

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

          {/* Wake/Bedtime Section */}
          <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'wake-bedtime' ? null : 'wake-bedtime')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex items-center gap-3">
                <Sun className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Wake & Bedtime</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Set your typical wake and sleep times
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedSection === 'wake-bedtime' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'wake-bedtime' && (
              <div className="px-6 pb-6 space-y-6">
                {/* Default Times */}
                <div>
                  <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                    Set default times. Different times for specific days? Use Energy Schedules below.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                        Wake Time
                      </label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">
                        Bedtime
                      </label>
                      <input
                        type="time"
                        value={bedtime}
                        onChange={(e) => setBedtime(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveTimes}
                  className="w-full rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700"
                >
                  Save Times
                </button>

                {timesSaved && (
                  <div className="rounded-lg bg-cyan-50 p-3 text-sm text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200">
                    Wake and bedtime saved! Your timeline will use these times.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Energy Schedule Section */}
          <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'energy' ? null : 'energy')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Energy Schedule</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Auto-adjust energy levels throughout the day
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedSection === 'energy' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'energy' && (
              <div className="px-6 pb-6">
                <EnergyScheduleEditor onScheduleChange={() => setScheduleChanged(true)} />
                {scheduleChanged && (
                  <div className="mt-4 rounded-lg bg-cyan-50 p-3 text-sm text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-200">
                    Schedule updated! Your energy will adjust automatically throughout the day.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Tags Section */}
          <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'tags' ? null : 'tags')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Custom Tags</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Create category tags for focus items
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedSection === 'tags' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'tags' && (
              <div className="px-6 pb-6">
                <CustomTagsEditor onTagsChange={() => setTagsChanged(true)} />
                {tagsChanged && (
                  <div className="mt-4 rounded-lg bg-purple-50 p-3 text-sm text-purple-800 dark:bg-purple-900/20 dark:text-purple-200">
                    Custom tags updated! They'll now appear when adding focus items.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Anchor Presets Section */}
          <div className="rounded-3xl border border-white/20 bg-white/70 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'anchors' ? null : 'anchors')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex items-center gap-3">
                <Anchor className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Anchor Presets</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Preset anchors for linking tasks to time or rhythm
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedSection === 'anchors' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'anchors' && (
              <div className="px-6 pb-6">
                <CustomAnchorsEditor onAnchorsChange={() => setAnchorsChanged(true)} />
                {anchorsChanged && (
                  <div className="mt-4 rounded-lg bg-teal-50 p-3 text-sm text-teal-800 dark:bg-teal-900/20 dark:text-teal-200">
                    Anchor presets updated! They'll now appear when linking tasks to time or rhythm.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

