'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Sunset, Moon, Sunrise } from 'lucide-react';

interface TimePreferences {
  startTime: string;
  deepWorkStop: string;
  lightWorkStop: string;
  fullStop: string;
}

interface TimeSettingsModalProps {
  isOpen: boolean;
  currentPreferences: TimePreferences;
  onClose: () => void;
  onSave: (preferences: TimePreferences) => void;
}

const TIME_EXPLANATIONS = {
  startTime: {
    icon: Sunrise,
    label: 'Work Day Starts',
    description: 'When you typically begin your work day',
    color: 'text-amber-600 dark:text-amber-400',
  },
  deepWorkStop: {
    icon: Sunset,
    label: 'Deep Work Stop',
    description: 'Hard stop for focus items (brain shuts down)',
    color: 'text-orange-600 dark:text-orange-400',
  },
  lightWorkStop: {
    icon: Moon,
    label: 'Light Work Stop',
    description: 'Can do life tasks, but no more focus items',
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  fullStop: {
    icon: Moon,
    label: 'Full Stop',
    description: 'Complete shutdown, rest time begins',
    color: 'text-purple-600 dark:text-purple-400',
  },
};

export function TimeSettingsModal({
  isOpen,
  currentPreferences,
  onClose,
  onSave,
}: TimeSettingsModalProps) {
  const [preferences, setPreferences] = useState<TimePreferences>(currentPreferences);
  const [error, setError] = useState('');

  useEffect(() => {
    setPreferences(currentPreferences);
    setError('');
  }, [currentPreferences, isOpen]);

  if (!isOpen) return null;

  const validateTimes = (): boolean => {
    // Convert times to minutes for comparison
    const timeToMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start = timeToMinutes(preferences.startTime);
    const deep = timeToMinutes(preferences.deepWorkStop);
    const light = timeToMinutes(preferences.lightWorkStop);
    const full = timeToMinutes(preferences.fullStop);

    if (start >= deep) {
      setError('Start time must be before deep work stop');
      return false;
    }

    if (deep >= light) {
      setError('Deep work stop must be before light work stop');
      return false;
    }

    if (light >= full) {
      setError('Light work stop must be before full stop');
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validateTimes()) return;

    onSave(preferences);
    onClose();
  };

  const handleTimeChange = (field: keyof TimePreferences, value: string) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-6 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Time Boundaries
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Set realistic boundaries for your work day
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-200">
                {error}
              </div>
            )}

            {/* Info Box */}
            <div className="rounded-xl bg-blue-50 p-4 dark:bg-blue-900/20">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>ADHD-friendly boundaries:</strong> Most people can't do deep work after
                6-8pm. Be honest with yourself!
              </p>
            </div>

            {/* Time Inputs */}
            <div className="space-y-4">
              {(Object.keys(TIME_EXPLANATIONS) as Array<keyof TimePreferences>).map((field) => {
                const config = TIME_EXPLANATIONS[field];
                const Icon = config.icon;

                return (
                  <div key={field} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                      <label
                        htmlFor={field}
                        className="text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        {config.label}
                      </label>
                    </div>
                    <input
                      type="time"
                      id={field}
                      value={preferences[field]}
                      onChange={(e) => handleTimeChange(field, e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {config.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Visual Timeline */}
            <div className="space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-slate-900/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Your Day Timeline
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {preferences.startTime} - Start of work day
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-cyan-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    ...focus work happens...
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {preferences.deepWorkStop} - No more focus items
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {preferences.lightWorkStop} - Life tasks only
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-slate-700 dark:text-slate-300">
                    {preferences.fullStop} - Complete rest
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-lg bg-cyan-600 px-4 py-3 font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
            >
              Save Boundaries
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
