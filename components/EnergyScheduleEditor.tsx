'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Bell, BellOff } from 'lucide-react';
import { InternalWeatherSelector, internalWeatherOptions, type EnergyTypeOption } from './InternalWeatherSelector';
import { getEnergySchedules, createEnergySchedule, updateEnergySchedule, deleteEnergySchedule, type EnergySchedule, supabase } from '@/lib/supabase';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

interface EnergyScheduleEditorProps {
  onScheduleChange?: () => void;
}

type DayType = 'all' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

const DAY_OPTIONS: { value: DayType; label: string; short: string }[] = [
  { value: 'all', label: 'All Days', short: 'All' },
  { value: 'sunday', label: 'Sunday', short: 'S' },
  { value: 'monday', label: 'Monday', short: 'M' },
  { value: 'tuesday', label: 'Tuesday', short: 'T' },
  { value: 'wednesday', label: 'Wednesday', short: 'W' },
  { value: 'thursday', label: 'Thursday', short: 'Th' },
  { value: 'friday', label: 'Friday', short: 'F' },
  { value: 'saturday', label: 'Saturday', short: 'Sa' },
];

function minutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

function minutesToDisplayTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
}

function timeStringToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function EnergyScheduleEditor({ onScheduleChange }: EnergyScheduleEditorProps) {
  const { user } = useSupabaseUser();
  const [schedules, setSchedules] = useState<EnergySchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimes, setLoadingTimes] = useState(true);
  const [savingTimes, setSavingTimes] = useState(false);
  const [timesSaved, setTimesSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = useState<DayType[]>(['all']);
  const defaultAnchors = {
    wakeTime: '07:00',
    workStart: '09:00',
    hardStop: '',
    bedtime: '22:00',
  };
  const [anchors, setAnchors] = useState<Record<DayType, typeof defaultAnchors>>(() => {
    const base: Record<DayType, typeof defaultAnchors> = {} as any;
    DAY_OPTIONS.forEach((d) => { (base as any)[d.value] = { ...defaultAnchors }; });
    return base;
  });
  const [newSchedule, setNewSchedule] = useState<{
    time: string;
    energyKey: string;
    label: string;
    notify: boolean;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadSchedules();
      loadTimes();
    }
  }, [user]);

  const loadTimes = async () => {
    if (!user) return;
    setLoadingTimes(true);
    try {
      const metadata = (user as any).user_metadata || {};
      const storedAnchors = (metadata.anchor_times as Record<string, any>) || {};
      const base = {
        wakeTime: metadata.wake_time || storedAnchors.all?.wakeTime || defaultAnchors.wakeTime,
        workStart: metadata.work_start || storedAnchors.all?.workStart || defaultAnchors.workStart,
        hardStop: metadata.hard_stop || storedAnchors.all?.hardStop || defaultAnchors.hardStop,
        bedtime: metadata.bedtime || storedAnchors.all?.bedtime || defaultAnchors.bedtime,
      };

      const nextAnchors: Record<DayType, typeof defaultAnchors> = {} as any;
      DAY_OPTIONS.forEach((d) => {
        const dayKey = d.value;
        nextAnchors[dayKey] = {
          wakeTime: storedAnchors[dayKey]?.wakeTime ?? base.wakeTime,
          workStart: storedAnchors[dayKey]?.workStart ?? base.workStart,
          hardStop: storedAnchors[dayKey]?.hardStop ?? base.hardStop,
          bedtime: storedAnchors[dayKey]?.bedtime ?? base.bedtime,
        };
      });
      setAnchors(nextAnchors);
    } catch (error) {
      console.error('Error loading times:', error);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleSaveTimes = async () => {
    if (!user) return;
    setSavingTimes(true);
    try {
      const payloadAnchors = anchors;
      const all = payloadAnchors.all || defaultAnchors;
      const { error } = await supabase.auth.updateUser({
        data: {
          wake_time: all.wakeTime,
          work_start: all.workStart,
          hard_stop: (all.hardStop || null),
          bedtime: all.bedtime,
          anchor_times: payloadAnchors,
        },
      });

      if (error) throw error;
      setTimesSaved(true);
      setTimeout(() => setTimesSaved(false), 3000);
    } catch (error) {
      console.error('Error saving times:', error);
      alert('Failed to save times. Please try again.');
    } finally {
      setSavingTimes(false);
    }
  };

      const loadSchedules = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getEnergySchedules(user.id);
      setSchedules(data);
    } catch (error) {
      console.error('Error loading schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchedule = () => {
    setNewSchedule({
      time: '11:00',
      energyKey: 'steady',
      label: '',
      notify: false,
    });
  };

  const handleSaveNewSchedule = async () => {
    if (!user || !newSchedule) return;

    try {
      const minutes = timeStringToMinutes(newSchedule.time);
      // Use the first selected day, or default to 'all' if 'all' is selected
      const dayType = selectedDays.includes('all') ? 'all' : selectedDays[0] || 'all';
      
      await createEnergySchedule({
        user_id: user.id,
        start_time_minutes: minutes,
        energy_key: newSchedule.energyKey as EnergySchedule['energy_key'],
        label: newSchedule.label || null,
        notify_on_transition: newSchedule.notify,
        is_active: true,
        day_type: dayType,
      });
      setNewSchedule(null);
      await loadSchedules();
      onScheduleChange?.();
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule. Please try again.');
    }
  };

  const handleUpdateSchedule = async (id: string, updates: {
    time?: string;
    energyKey?: string;
    label?: string;
    notify?: boolean;
  }) => {
    if (!user) return;

    try {
      const updateData: any = {};
      if (updates.time !== undefined) {
        updateData.start_time_minutes = timeStringToMinutes(updates.time);
      }
      if (updates.energyKey !== undefined) {
        updateData.energy_key = updates.energyKey;
      }
      if (updates.label !== undefined) {
        updateData.label = updates.label || null;
      }
      if (updates.notify !== undefined) {
        updateData.notify_on_transition = updates.notify;
      }

      await updateEnergySchedule(id, updateData);
      setEditingId(null);
      await loadSchedules();
      onScheduleChange?.();
    } catch (error) {
      console.error('Error updating schedule:', error);
      alert('Failed to update schedule. Please try again.');
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this schedule?')) return;

    try {
      await deleteEnergySchedule(id);
      await loadSchedules();
      onScheduleChange?.();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-slate-600 dark:text-slate-400">Loading schedule...</div>;
  }

  // Filter schedules by selected day
      const filteredSchedules = schedules.filter(s => {
    const scheduleDay = (s as any).day_type || 'all';
    return selectedDays.includes('all') ? scheduleDay === 'all' : selectedDays.includes(scheduleDay);
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => a.start_time_minutes - b.start_time_minutes);

  return (
    <div className="space-y-6">
      {/* Day Selector */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Select day to customize
        </p>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map((day) => (
            <button
              key={day.value}
              onClick={() => {
                setSelectedDays((prev) => {
                  // Toggle selection; "all" resets others
                  if (day.value === 'all') return ['all'];
                  const withoutAll = prev.filter((d) => d !== 'all');
                  return withoutAll.includes(day.value)
                    ? withoutAll.filter((d) => d !== day.value)
                    : [...withoutAll, day.value];
                });
              }}
              className={`flex h-9 min-w-[38px] items-center justify-center rounded-full px-2.5 text-sm font-semibold transition ${
                selectedDays.includes(day.value)
                  ? 'bg-cyan-600 text-white shadow-lg dark:bg-cyan-500'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              {day.short}
            </button>
          ))}
        </div>
        {!selectedDays.includes('all') && selectedDays.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Editing schedule for {selectedDays.map(d => DAY_OPTIONS.find(opt => opt.value === d)?.label || d).join(', ')}.
          </p>
        )}
      </div>

      {/* Day-specific anchors */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {selectedDays.includes('all')
                ? 'Default anchors for all days'
                : `Anchors for ${selectedDays.map(d => DAY_OPTIONS.find(opt => opt.value === d)?.label || d).join(', ')}`}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Set wake, work start, hard stop, and bedtime for this selection.
            </p>
          </div>
          {timesSaved && (
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200">
              Saved
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">🌅 Wake time</label>
            <input
              type="time"
              value={selectedDays.includes('all') ? (anchors.all?.wakeTime || '') : ''}
              onChange={(e) => {
                setAnchors(prev => {
                  const next = { ...prev };
                  if (selectedDays.includes('all')) {
                    next.all = { ...(next.all || defaultAnchors), wakeTime: e.target.value };
                  } else {
                    selectedDays.forEach(day => {
                      next[day] = { ...(next[day] || defaultAnchors), wakeTime: e.target.value };
                    });
                  }
                  return next;
                });
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              disabled={loadingTimes || savingTimes}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">☀️ Work start</label>
            <input
              type="time"
              value={selectedDays.includes('all') ? (anchors.all?.workStart || '') : ''}
              onChange={(e) => {
                setAnchors(prev => {
                  const next = { ...prev };
                  if (selectedDays.includes('all')) {
                    next.all = { ...(next.all || defaultAnchors), workStart: e.target.value };
                  } else {
                    selectedDays.forEach(day => {
                      next[day] = { ...(next[day] || defaultAnchors), workStart: e.target.value };
                    });
                  }
                  return next;
                });
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              disabled={loadingTimes || savingTimes}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">🌙 Hard stop (optional)</label>
            <input
              type="time"
              value={selectedDays.includes('all') ? (anchors.all?.hardStop || '') : ''}
              onChange={(e) => {
                setAnchors(prev => {
                  const next = { ...prev };
                  if (selectedDays.includes('all')) {
                    next.all = { ...(next.all || defaultAnchors), hardStop: e.target.value };
                  } else {
                    selectedDays.forEach(day => {
                      next[day] = { ...(next[day] || defaultAnchors), hardStop: e.target.value };
                    });
                  }
                  return next;
                });
              }}
              placeholder="Leave blank if flexible"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              disabled={loadingTimes || savingTimes}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Skip if your day ends flexibly.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-400">💤 Bedtime</label>
            <input
              type="time"
              value={selectedDays.includes('all') ? (anchors.all?.bedtime || '') : ''}
              onChange={(e) => {
                setAnchors(prev => {
                  const next = { ...prev };
                  if (selectedDays.includes('all')) {
                    next.all = { ...(next.all || defaultAnchors), bedtime: e.target.value };
                  } else {
                    selectedDays.forEach(day => {
                      next[day] = { ...(next[day] || defaultAnchors), bedtime: e.target.value };
                    });
                  }
                  return next;
                });
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              disabled={loadingTimes || savingTimes}
            />
          </div>
        </div>
        <button
          onClick={handleSaveTimes}
          className="w-full rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={loadingTimes || savingTimes}
        >
          {savingTimes ? 'Saving...' : 'Save anchors'}
        </button>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Tip: set "All" first, then switch days to tweak differences.
        </p>
      </div>

      {/* Schedule Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-2xl">⚡️</div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Energy schedule</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">Add times when your energy shifts</p>
            </div>
          </div>
          {!newSchedule && (
            <button
              onClick={handleAddSchedule}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-3 py-1.5 text-sm text-white transition hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          )}
        </div>

        {sortedSchedules.length === 0 && !newSchedule ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            No energy schedules yet
          </div>
        ) : (
          sortedSchedules.map((schedule) => {
            const isEditing = editingId === schedule.id;
            const energyOption = internalWeatherOptions.find((opt) => opt.key === schedule.energy_key);

            return (
              <div
                key={schedule.id}
                className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Time
                      </label>
                      <input
                        type="time"
                        value={minutesToTimeString(schedule.start_time_minutes)}
                        onChange={(e) => handleUpdateSchedule(schedule.id, { time: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Energy Level
                      </label>
                      <InternalWeatherSelector
                        selectedKey={schedule.energy_key}
                        onSelect={(option) => handleUpdateSchedule(schedule.id, { energyKey: option.key })}
                        suppressAutoSelect={false}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Label (optional)
                      </label>
                      <input
                        type="text"
                        value={schedule.label || ''}
                        onChange={(e) => handleUpdateSchedule(schedule.id, { label: e.target.value })}
                        placeholder="e.g., meds wearing off, bed time"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateSchedule(schedule.id, { notify: !schedule.notify_on_transition })}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                          schedule.notify_on_transition
                            ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                        }`}
                      >
                        {schedule.notify_on_transition ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                        Notify on transition
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="rounded-lg border border-rose-300 px-4 py-2 text-rose-600 transition hover:bg-rose-50 dark:border-rose-600 dark:text-rose-400 dark:hover:bg-rose-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {minutesToDisplayTime(schedule.start_time_minutes)}
                        </span>
                      </div>
                      {energyOption && (
                        <div className="flex items-center gap-2">
                          <energyOption.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">{energyOption.label}</span>
                        </div>
                      )}
                      {schedule.label && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">({schedule.label})</span>
                      )}
                      {schedule.notify_on_transition && (
                        <Bell className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                      )}
                    </div>
                    <button
                      onClick={() => setEditingId(schedule.id)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {newSchedule && (
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Time
              </label>
              <input
                type="time"
                value={newSchedule.time}
                onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Energy Level
              </label>
              <InternalWeatherSelector
                selectedKey={newSchedule.energyKey}
                onSelect={(option) => setNewSchedule({ ...newSchedule, energyKey: option.key })}
                suppressAutoSelect={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Label (optional)
              </label>
              <input
                type="text"
                value={newSchedule.label}
                onChange={(e) => setNewSchedule({ ...newSchedule, label: e.target.value })}
                placeholder="e.g., meds wearing off, peak focus time"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNewSchedule({ ...newSchedule, notify: !newSchedule.notify })}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition ${
                  newSchedule.notify
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}
              >
                {newSchedule.notify ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                Notify on transition
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveNewSchedule}
                className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
              >
                Save
              </button>
              <button
                onClick={() => setNewSchedule(null)}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
