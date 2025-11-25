'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Anchor, ChevronDown, Clock } from 'lucide-react';

import { CustomTagsEditor } from '@/components/CustomTagsEditor';
import { CustomAnchorsEditor } from '@/components/CustomAnchorsEditor';
import { ScheduleSettings } from '@/components/ScheduleSettings';
import { useAuth } from '@/components/AuthProvider';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [tagsChanged, setTagsChanged] = useState(false);
  const [anchorsChanged, setAnchorsChanged] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('schedule');

  return (
    <main className="min-h-screen px-4 py-8 pb-24">
      <div className="mx-auto max-w-2xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-cinzel">Settings</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 font-crimson">
              Manage your preferences
            </p>
          </div>

          {/* Schedule Section */}
          <div className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-sm dark:border-slate-600/40 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'schedule' ? null : 'schedule')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 font-cinzel">Daily Schedule</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-crimson">
                    Set your wake, work, and sleep times
                  </p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${expandedSection === 'schedule' ? 'rotate-180' : ''}`} />
            </button>
            {expandedSection === 'schedule' && (
              <div className="px-6 pb-6">
                <ScheduleSettings />
              </div>
            )}
          </div>

          {/* Custom Tags Section */}
          <div className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-sm dark:border-slate-600/40 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'tags' ? null : 'tags')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 font-cinzel">Custom Tags</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-crimson">
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
          <div className="rounded-3xl border border-slate-200/60 bg-white/70 backdrop-blur-sm dark:border-slate-600/40 dark:bg-slate-800/80 overflow-hidden">
            <button
              onClick={() => setExpandedSection(expandedSection === 'anchors' ? null : 'anchors')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex items-center gap-3">
                <Anchor className="h-6 w-6 text-sky-600 dark:text-cyan-400" />
                <div className="text-left">
                  <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 font-cinzel">Anchor Presets</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-crimson">
                    Preset anchors for linking tasks to time
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
