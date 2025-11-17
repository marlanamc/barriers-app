'use client';

import { useState, useEffect } from 'react';
import { Zap, Clock, Edit2 } from 'lucide-react';
import { EnergyPresetSelector } from '@/components/EnergyPresetSelector';
import { EnergyScheduleEditor } from '@/components/EnergyScheduleEditor';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { ENERGY_PRESETS, presetToDbSchedule, type EnergySchedulePreset } from '@/lib/energyPresets';
import { getEnergySchedules, createEnergySchedule, deleteEnergySchedule } from '@/lib/supabase';

type ViewMode = 'presets' | 'editing';

export default function EnergyPage() {
  const { user } = useSupabaseUser();
  const [viewMode, setViewMode] = useState<ViewMode>('presets');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [hasExistingSchedule, setHasExistingSchedule] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserSchedule();
    }
  }, [user]);

  const loadUserSchedule = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const schedules = await getEnergySchedules(user.id);
      setHasExistingSchedule(schedules.length > 0);
      if (schedules.length > 0) {
        setViewMode('editing');
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const [pendingPreset, setPendingPreset] = useState<EnergySchedulePreset | null>(null);
  const [showDayTypeModal, setShowDayTypeModal] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set(['all']));

  const handleSelectPreset = (preset: EnergySchedulePreset) => {
    setPendingPreset(preset);
    setSelectedDays(new Set(['all'])); // Default to all days
    setShowDayTypeModal(true);
  };

  const toggleDay = (day: string) => {
    const newSelection = new Set(selectedDays);

    if (day === 'all') {
      // If selecting 'all', clear everything else
      setSelectedDays(new Set(['all']));
    } else {
      // Remove 'all' if selecting specific days
      newSelection.delete('all');

      if (newSelection.has(day)) {
        newSelection.delete(day);
        // If nothing left, default back to 'all'
        if (newSelection.size === 0) {
          setSelectedDays(new Set(['all']));
          return;
        }
      } else {
        newSelection.add(day);
      }
      setSelectedDays(newSelection);
    }
  };

  const handleApplyPreset = async () => {
    if (!user || !pendingPreset || selectedDays.size === 0) return;

    try {
      const existing = await getEnergySchedules(user.id);

      // For each selected day, clear and create schedules
      for (const dayType of selectedDays) {
        // Clear existing schedules for this day
        const toDelete = existing.filter(s => {
          const sDayType = (s as any).day_type || 'all';
          return sDayType === dayType;
        });
        await Promise.all(toDelete.map(s => deleteEnergySchedule(s.id)));

        // Create new schedules
        const scheduleData = presetToDbSchedule(pendingPreset, user.id, dayType);
        await Promise.all(scheduleData.map(data => createEnergySchedule(data)));
      }

      setSelectedPresetId(pendingPreset.id);
      setHasExistingSchedule(true);
      setViewMode('editing');
      setShowDayTypeModal(false);
      setPendingPreset(null);
      setSelectedDays(new Set(['all']));
    } catch (error) {
      console.error('Error applying preset:', error);
      alert('Failed to apply preset. Please try again.');
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#fffbf0] via-[#fefef8] to-[#fffff8] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80 blur-[60px] dark:hidden"
        aria-hidden
      >
        <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-[#fff4d4]" />
        <div className="absolute -bottom-40 right-[-5%] h-96 w-96 rounded-full bg-[#fff9e0]" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 pb-16 pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 pl-12 sm:pl-14">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Energy Blueprint</h1>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Set up your daily energy pattern
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800/30 dark:bg-yellow-900/20">
          <p className="text-sm text-yellow-900 dark:text-yellow-100">
            ⚡ <strong>ADHD brains have predictable energy patterns.</strong> Set your blueprint once, then your timeline will automatically show when you have peak focus and when you need to rest.
          </p>
        </div>

        {/* View Mode Toggle */}
        {hasExistingSchedule && (
          <div className="flex gap-2 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              onClick={() => setViewMode('editing')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === 'editing'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Edit2 className="h-4 w-4" />
              Your Schedule
            </button>
            <button
              onClick={() => setViewMode('presets')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                viewMode === 'presets'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Clock className="h-4 w-4" />
              Change Blueprint
            </button>
          </div>
        )}

        {/* Preset Selector */}
        {viewMode === 'presets' && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Choose Your Blueprint
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Pick the pattern that matches your experience. You can customize it after.
              </p>
            </div>
            <EnergyPresetSelector
              selectedPresetId={selectedPresetId}
              onSelectPreset={handleSelectPreset}
            />
          </div>
        )}

        {/* Schedule Editor */}
        {viewMode === 'editing' && hasExistingSchedule && (
          <div className="space-y-4">
            <div>
              <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Your Energy Schedule
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Fine-tune your energy levels throughout the day
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <EnergyScheduleEditor onScheduleChange={loadUserSchedule} />
            </div>
          </div>
        )}

      </div>

      {/* Day Selection Modal */}
      {showDayTypeModal && pendingPreset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-800">
            <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">
              Which days?
            </h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Pick the days for "{pendingPreset.name}" - no work week assumptions!
            </p>

            {/* All Days Option */}
            <button
              onClick={() => toggleDay('all')}
              className={`mb-4 w-full rounded-lg border-2 p-3 text-left transition ${
                selectedDays.has('all')
                  ? 'border-cyan-600 bg-cyan-50 dark:border-cyan-500 dark:bg-cyan-900/20'
                  : 'border-slate-300 bg-white hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700'
              }`}
            >
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {selectedDays.has('all') ? '✓ ' : ''}Every Day
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Same schedule all week
              </div>
            </button>

            {/* Individual Days */}
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                Or pick specific days:
              </p>
              <div className="grid grid-cols-7 gap-2">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const label = day.slice(0, 2).toUpperCase();
                  const isSelected = selectedDays.has(day);

                  return (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`aspect-square rounded-lg border-2 font-semibold transition ${
                        isSelected
                          ? 'border-cyan-600 bg-cyan-500 text-white'
                          : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleApplyPreset}
                disabled={selectedDays.size === 0}
                className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 font-medium text-white transition hover:bg-cyan-700 disabled:opacity-50"
              >
                Apply Schedule
              </button>
              <button
                onClick={() => {
                  setShowDayTypeModal(false);
                  setPendingPreset(null);
                  setSelectedDays(new Set(['all']));
                }}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
