'use client';

import { useState, useEffect } from 'react';
import { Clock, Save, AlertCircle } from 'lucide-react';
import { useOnboarding } from '@/lib/onboarding-context';

export function ScheduleSettings() {
  const { state, setDailySchedule } = useOnboarding();

  const [wakeTime, setWakeTime] = useState(state.dailySchedule?.wake || '07:00');
  const [workStart, setWorkStart] = useState(state.dailySchedule?.workStart || '09:00');
  const [hardStop, setHardStop] = useState(state.dailySchedule?.hardStop || '18:00');
  const [bedtime, setBedtime] = useState(state.dailySchedule?.bedtime || '22:00');
  const [saved, setSaved] = useState(false);

  // Update local state when context changes
  useEffect(() => {
    if (state.dailySchedule) {
      setWakeTime(state.dailySchedule.wake);
      setWorkStart(state.dailySchedule.workStart);
      setHardStop(state.dailySchedule.hardStop);
      setBedtime(state.dailySchedule.bedtime);
    }
  }, [state.dailySchedule]);

  const handleSave = () => {
    setDailySchedule(wakeTime, workStart, hardStop, bedtime);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const hasChanges =
    wakeTime !== state.dailySchedule?.wake ||
    workStart !== state.dailySchedule?.workStart ||
    hardStop !== state.dailySchedule?.hardStop ||
    bedtime !== state.dailySchedule?.bedtime;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Wake Time */}
        <div className="space-y-2">
          <label
            htmlFor="wake-time"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            🌅 Wake Time
          </label>
          <input
            type="time"
            id="wake-time"
            value={wakeTime}
            onChange={(e) => setWakeTime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            When you typically wake up
          </p>
        </div>

        {/* Work Start */}
        <div className="space-y-2">
          <label
            htmlFor="work-start"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            ☀️ Work Start
          </label>
          <input
            type="time"
            id="work-start"
            value={workStart}
            onChange={(e) => setWorkStart(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            When you can start focused work
          </p>
        </div>

        {/* Hard Stop */}
        <div className="space-y-2">
          <label
            htmlFor="hard-stop"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            🌙 Hard Stop
          </label>
          <input
            type="time"
            id="hard-stop"
            value={hardStop}
            onChange={(e) => setHardStop(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            When your brain shuts down for the day
          </p>
        </div>

        {/* Bedtime */}
        <div className="space-y-2">
          <label
            htmlFor="bedtime"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            🛏️ Bedtime
          </label>
          <input
            type="time"
            id="bedtime"
            value={bedtime}
            onChange={(e) => setBedtime(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Target time to go to bed
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-sky-600 dark:text-sky-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-sky-800 dark:text-sky-200">
          <p className="font-medium mb-1">These times help personalize your experience:</p>
          <ul className="list-disc list-inside space-y-1 text-sky-700 dark:text-sky-300">
            <li>Energy timeline adapts to your schedule</li>
            <li>Sleep notifications remind you to wind down</li>
            <li>Work blocks match your peak hours</li>
          </ul>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!hasChanges}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
      >
        <Save className="h-5 w-5" />
        {saved ? 'Saved!' : 'Save Schedule'}
      </button>

      {saved && (
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <span className="text-lg">✓</span>
          Schedule updated! Changes will apply across the app.
        </div>
      )}
    </div>
  );
}
