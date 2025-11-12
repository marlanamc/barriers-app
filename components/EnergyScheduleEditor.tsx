'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Bell, BellOff } from 'lucide-react';
import { InternalWeatherSelector, internalWeatherOptions, type EnergyTypeOption } from './InternalWeatherSelector';
import { getEnergySchedules, createEnergySchedule, updateEnergySchedule, deleteEnergySchedule, type EnergySchedule } from '@/lib/supabase';
import { useSupabaseUser } from '@/lib/useSupabaseUser';

interface EnergyScheduleEditorProps {
  onScheduleChange?: () => void;
}

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSchedule, setNewSchedule] = useState<{
    time: string;
    energyKey: string;
    label: string;
    notify: boolean;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user]);

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
      await createEnergySchedule({
        user_id: user.id,
        start_time_minutes: minutes,
        energy_key: newSchedule.energyKey as EnergySchedule['energy_key'],
        label: newSchedule.label || null,
        notify_on_transition: newSchedule.notify,
        is_active: true,
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

  const sortedSchedules = [...schedules].sort((a, b) => a.start_time_minutes - b.start_time_minutes);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Energy Schedule</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Set your energy levels throughout the day. Energy will auto-adjust based on time.
          </p>
        </div>
        {!newSchedule && (
          <button
            onClick={handleAddSchedule}
            className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4" />
            Add Time
          </button>
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

      {sortedSchedules.length === 0 && !newSchedule && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <Clock className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No energy schedule set. Add time slots to automatically adjust your energy throughout the day.
          </p>
          <button
            onClick={handleAddSchedule}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
          >
            Create Schedule
          </button>
        </div>
      )}

      {sortedSchedules.map((schedule) => {
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
                    placeholder="e.g., meds wearing off"
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
      })}
    </div>
  );
}

