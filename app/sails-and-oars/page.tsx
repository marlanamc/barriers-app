'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  createEnergySchedule,
  deleteEnergySchedule,
  getEnergySchedules,
  updateEnergySchedule,
  type EnergySchedule,
} from '@/lib/supabase';
import { Anchor, ArrowLeft, Check, Clock, Plus, Save, Sparkles, Trash2, Waves, Wind, X } from 'lucide-react';
import { PageBackground } from '@/components/PageBackground';

// Keys must match DB enum: sparky, steady, flowing, foggy, resting
const ENERGY_LEVELS = [
  { key: 'sparky', label: 'High Tide', icon: Waves, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', river: 'from-blue-500 to-blue-400' },
  { key: 'steady', label: 'Steady', icon: Wind, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', river: 'from-emerald-500 to-emerald-400' },
  { key: 'foggy', label: 'Low Tide', icon: Anchor, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', river: 'from-amber-500 to-amber-400' },
  { key: 'resting', label: 'Sleeping', icon: Anchor, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', river: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700' },
];

const MAX_MARKERS = 8;

const ENERGY_PATTERNS = [
  {
    id: 'xr-meds-classic',
    label: 'XR Meds (classic)',
    description: 'Slow AM start, strong mid-morning, taper before dinner',
    schedule: [
      { time: '07:30', key: 'foggy', label: 'Wake / meds in' },
      { time: '09:00', key: 'sparky', label: 'Peak focus' },
      { time: '13:30', key: 'steady', label: 'Gentle glide' },
      { time: '17:30', key: 'foggy', label: 'Evening drop' },
      { time: '20:30', key: 'foggy', label: 'Wind down' },
    ],
  },
  {
    id: 'ir-meds-two-peaks',
    label: 'IR + Booster',
    description: 'Two IR peaks, predictable crash windows',
    schedule: [
      { time: '07:30', key: 'foggy', label: 'Dose 1 on board' },
      { time: '08:30', key: 'sparky', label: 'Peak 1' },
      { time: '11:30', key: 'foggy', label: 'Crash window' },
      { time: '12:30', key: 'sparky', label: 'Booster peak' },
      { time: '16:30', key: 'steady', label: 'Coast' },
      { time: '19:30', key: 'foggy', label: 'Evening crash' },
    ],
  },
  {
    id: 'afternoon-bloom',
    label: 'Afternoon Bloom',
    description: 'Late focus surge for night owls or delayed meds',
    schedule: [
      { time: '09:30', key: 'foggy', label: 'Slow morning' },
      { time: '12:30', key: 'steady', label: 'Warming up' },
      { time: '15:30', key: 'sparky', label: 'Big push' },
      { time: '19:00', key: 'steady', label: 'Glide' },
      { time: '21:30', key: 'foggy', label: 'Cool down' },
    ],
  },
  {
    id: 'burst-recovery',
    label: 'Burst + Recovery',
    description: 'Short hyperfocus bursts with planned dips',
    schedule: [
      { time: '07:30', key: 'steady', label: 'Up and moving' },
      { time: '09:00', key: 'sparky', label: 'Burst 1' },
      { time: '10:30', key: 'foggy', label: 'Recover' },
      { time: '13:00', key: 'sparky', label: 'Burst 2' },
      { time: '15:00', key: 'steady', label: 'Coast' },
      { time: '17:30', key: 'sparky', label: 'Burst 3' },
      { time: '19:30', key: 'foggy', label: 'Off-ramp' },
    ],
  },
  {
    id: 'unmedicated-fog',
    label: 'Unmedicated / Foggy',
    description: 'Gentle ramps with realistic low-energy valleys',
    schedule: [
      { time: '08:00', key: 'foggy', label: 'Foggy wake' },
      { time: '10:30', key: 'steady', label: 'Light focus' },
      { time: '12:30', key: 'foggy', label: 'Midday dip' },
      { time: '15:00', key: 'steady', label: 'Small climb' },
      { time: '18:30', key: 'foggy', label: 'Evening fade' },
    ],
  },
];

function clampMinutes(minutes: number) {
  return Math.max(0, Math.min(1439, minutes));
}

function roundToQuarterHour(minutes: number) {
  return clampMinutes(Math.round(minutes / 15) * 15);
}

function getNearestQuarterHourFromNow() {
  const now = new Date();
  return roundToQuarterHour(now.getHours() * 60 + now.getMinutes());
}

function minutesToTimeString(minutes: number) {
  const safeMinutes = clampMinutes(minutes);
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatTimeReadable(minutes: number) {
  const safeMinutes = clampMinutes(minutes);
  const h = Math.floor(safeMinutes / 60);
  const m = safeMinutes % 60;
  const hour12 = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const paddedMinutes = m.toString().padStart(2, '0');
  return `${hour12}:${paddedMinutes} ${suffix}`;
}

function getEnergyLevel(key: string) {
  return ENERGY_LEVELS.find((level) => level.key === key) || ENERGY_LEVELS.find((level) => level.key === 'steady') || ENERGY_LEVELS[0];
}

export default function SailsAndOarsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState<EnergySchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ startTime: '09:00', energyKey: 'steady', label: '' });
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setSchedules([]);
      setLoading(false);
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const scheds = await getEnergySchedules(user.id);
      const limited = scheds.sort((a, b) => a.start_time_minutes - b.start_time_minutes).slice(0, MAX_MARKERS);
      setSchedules(limited);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNewMarker = (timeMinutes?: number) => {
    const startMinutes = typeof timeMinutes === 'number' ? timeMinutes : getNearestQuarterHourFromNow();
    setEditingId('new');
    setEditForm({
      startTime: minutesToTimeString(startMinutes),
      energyKey: 'steady',
      label: '',
    });
    setIsModalOpen(true);
  };

  const handleSaveSchedule = async () => {
    if (!user) return;
    const [hours, minutes] = editForm.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;

    try {
      if (editingId === 'new') {
        await createEnergySchedule({
          user_id: user.id,
          start_time_minutes: totalMinutes,
          energy_key: editForm.energyKey,
          label: editForm.label,
          is_active: true,
        });
      } else if (editingId) {
        await updateEnergySchedule(editingId, {
          start_time_minutes: totalMinutes,
          energy_key: editForm.energyKey,
          label: editForm.label,
        });
      }
      await loadData();
      setIsModalOpen(false);
      setEditingId(null);
      setEditForm({ startTime: '09:00', energyKey: 'steady', label: '' });
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete this energy marker?')) return;
    try {
      await deleteEnergySchedule(id);
      await loadData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  const handleApplyPattern = async (pattern: (typeof ENERGY_PATTERNS)[number]) => {
    if (!user) return;
    if (!confirm('This will replace your current energy markers. Continue?')) return;

    setLoading(true);
    try {
      const existing = await getEnergySchedules(user.id);
      await Promise.all(existing.map((s) => deleteEnergySchedule(s.id)));

      const creates = pattern.schedule.slice(0, MAX_MARKERS).map((item) => {
        const [h, m] = item.time.split(':').map(Number);
        return createEnergySchedule({
          user_id: user.id,
          start_time_minutes: h * 60 + m,
          energy_key: item.key,
          label: item.label,
          is_active: true,
        });
      });
      await Promise.all(creates);

      await loadData();
      setIsPatternModalOpen(false);
    } catch (error) {
      console.error('Error applying pattern:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (schedules.length >= MAX_MARKERS) {
      alert(`Maximum ${MAX_MARKERS} energy markers. Delete one to add more.`);
      return;
    }
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const minutes = clampMinutes(Math.floor((y / rect.height) * 1440));
    const roundedMinutes = roundToQuarterHour(minutes);
    openNewMarker(roundedMinutes);
  };

  const openEditModal = (schedule: EnergySchedule) => {
    setEditingId(schedule.id);
    setEditForm({
      startTime: minutesToTimeString(schedule.start_time_minutes),
      energyKey: schedule.energy_key,
      label: schedule.label || '',
    });
    setIsModalOpen(true);
  };

  const adjustStartTime = (deltaMinutes: number) => {
    const [hours, minutes] = editForm.startTime.split(':').map(Number);
    const totalMinutes = clampMinutes(hours * 60 + minutes + deltaMinutes);
    setEditForm({ ...editForm, startTime: minutesToTimeString(totalMinutes) });
  };

  const renderRiverSegments = () => {
    // Get bedtime and waketime from user metadata
    const userSchedule = ((user?.user_metadata ?? {}) as {
      wake_time?: string;
      bedtime?: string;
      anchor_times?: Record<string, { wakeTime?: string; bedtime?: string }>;
    }) || {};
    const anchorTimes = userSchedule.anchor_times || {};
    const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayAnchors = anchorTimes[todayKey] || anchorTimes.all || {};
    const userWakeTime = todayAnchors.wakeTime ?? userSchedule.wake_time ?? '08:00';
    const userBedtime = todayAnchors.bedtime ?? userSchedule.bedtime ?? '22:00';

    // Convert bedtime and waketime to minutes
    const [bedHour, bedMin] = userBedtime.split(':').map(Number);
    const [wakeHour, wakeMin] = userWakeTime.split(':').map(Number);
    const bedtimeMinutes = (bedHour * 60 + bedMin) % 1440;
    const waketimeMinutes = (wakeHour * 60 + wakeMin) % 1440;

    const sorted = [...schedules].sort((a, b) => a.start_time_minutes - b.start_time_minutes);
    const restingLevel = getEnergyLevel('resting');

    // Create a combined list of all transition points (markers + sleep times)
    const transitions: Array<{ time: number; isSleep: boolean; energyKey?: string }> = [];
    
    // Add sleep transitions
    if (bedtimeMinutes < waketimeMinutes) {
      // Normal case: bedtime before waketime (e.g., 22:00 to 08:00)
      transitions.push({ time: bedtimeMinutes, isSleep: true });
      transitions.push({ time: waketimeMinutes, isSleep: false });
    } else {
      // Bedtime after midnight (e.g., 01:00 to 08:00) - sleep wraps around
      transitions.push({ time: 0, isSleep: true });
      transitions.push({ time: waketimeMinutes, isSleep: false });
      transitions.push({ time: bedtimeMinutes, isSleep: true });
      transitions.push({ time: 1440, isSleep: false });
    }

    // Add marker transitions
    sorted.forEach(schedule => {
      transitions.push({ time: schedule.start_time_minutes, isSleep: false, energyKey: schedule.energy_key });
    });

    // Sort all transitions by time
    transitions.sort((a, b) => a.time - b.time);

    // Remove duplicates and merge adjacent sleep periods
    const uniqueTransitions: Array<{ time: number; isSleep: boolean; energyKey?: string }> = [];
    for (let i = 0; i < transitions.length; i++) {
      const current = transitions[i];
      if (i === 0 || current.time !== transitions[i - 1].time) {
        uniqueTransitions.push(current);
      }
    }

    const segments: Array<{ start: number; height: number; level: typeof ENERGY_LEVELS[number] }> = [];

    // Helper to check if a time is during sleep
    const isDuringSleep = (time: number): boolean => {
      if (bedtimeMinutes < waketimeMinutes) {
        // Normal: bedtime before waketime (e.g., 22:00 to 08:00)
        return time >= bedtimeMinutes && time < waketimeMinutes;
      } else {
        // Bedtime after midnight (e.g., 01:00 to 08:00) - sleep wraps around
        return time >= bedtimeMinutes || time < waketimeMinutes;
      }
    };

    // Build segments between transitions
    for (let i = 0; i < uniqueTransitions.length; i++) {
      const current = uniqueTransitions[i];
      const next = uniqueTransitions[i + 1] || { time: 1440, isSleep: false };
      
      const startTime = current.time;
      const endTime = next.time;
      
      if (endTime <= startTime) continue;

      let level: typeof ENERGY_LEVELS[number];
      
      // Check if this segment is during sleep (use midpoint to determine)
      const segmentMidpoint = (startTime + endTime) / 2;
      if (isDuringSleep(segmentMidpoint)) {
        level = restingLevel;
      } else if (current.energyKey) {
        // This starts with a marker
        level = getEnergyLevel(current.energyKey);
      } else {
        // Find the nearest marker before this point
        const prevMarker = sorted.filter(s => s.start_time_minutes <= startTime).pop();
        if (prevMarker) {
          level = getEnergyLevel(prevMarker.energy_key);
        } else {
          // Use the first marker's energy level (wraps around)
          level = sorted.length > 0 ? getEnergyLevel(sorted[0].energy_key) : getEnergyLevel('steady');
        }
      }

      segments.push({
        start: (startTime / 1440) * 100,
        height: ((endTime - startTime) / 1440) * 100,
        level,
      });
    }

    // If no segments, show default
    if (segments.length === 0) {
      return <div className="absolute inset-0 bg-gradient-to-b from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900" />;
    }

    return segments.map((seg, idx) => (
      <div
        key={idx}
        className={`absolute w-full bg-gradient-to-b ${seg.level.river}`}
        style={{ top: `${seg.start}%`, height: `${seg.height}%` }}
      />
    ));
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <PageBackground symbol="sailboat" />
        <div className="relative z-10 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-md dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
            <Waves className="h-5 w-5 animate-spin" />
            Loading your river...
          </div>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <PageBackground symbol="sailboat" />
        <div className="relative z-10 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-md dark:border-slate-700 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          Please sign in to manage your Sails & Oars schedule.
        </div>
      </main>
    );
  }

  const sortedSchedules = [...schedules].sort((a, b) => a.start_time_minutes - b.start_time_minutes);

  return (
    <>
      <PageBackground symbol="sailboat" />
      <main className="relative min-h-screen px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Link href="/map" className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white font-cinzel flex items-center gap-3">
                <Wind className="w-8 h-8 text-sky-500" />
                Sails & Oars
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1 font-crimson text-lg">
                Click the river or use the buttons to drop up to {MAX_MARKERS} energy markers
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => openNewMarker()}
              className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl shadow-sm hover:bg-sky-600 transition-colors font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Add marker
            </button>
            <button
              onClick={() => setIsPatternModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 rounded-xl border border-sky-100 dark:border-slate-700 shadow-sm hover:bg-sky-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Use a Pattern
            </button>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="grid gap-10 md:grid-cols-[1fr,320px]">
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute left-0 top-0 bottom-0 pointer-events-none text-xs text-slate-400 dark:text-slate-600 font-mono select-none pr-3 w-20 text-right z-30" style={{ height: '640px' }}>
                  {[0, 240, 480, 720, 960, 1200, 1439].map((mins) => {
                    const topPercent = (mins / 1440) * 100;
                    return (
                      <span 
                        key={mins} 
                        className="absolute -translate-y-1/2"
                        style={{ top: `${topPercent}%` }}
                      >
                        {formatTimeReadable(mins)}
                      </span>
                    );
                  })}
                </div>

                <div className="relative h-[640px] w-24 mx-auto ml-32 z-10">
                  <div
                    ref={timelineRef}
                    onClick={handleTimelineClick}
                    className="absolute inset-0 bg-slate-200 dark:bg-slate-800/50 rounded-full cursor-pointer overflow-hidden ring-1 ring-slate-300 dark:ring-slate-700 shadow-inner group"
                  >
                    <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition-colors pointer-events-none" />
                    {renderRiverSegments()}
                  </div>
                  
                  {sortedSchedules.map((schedule, index, arr) => {
                    const isFirst = index === 0;
                    const isDifferent = !isFirst && schedule.energy_key !== arr[index - 1].energy_key;
                    const hasLabel = Boolean(schedule.label);
                    if (!isFirst && !isDifferent && !hasLabel) return null;

                    const top = (schedule.start_time_minutes / 1440) * 100;
                    const level = getEnergyLevel(schedule.energy_key);
                    const Icon = level.icon;

                    return (
                      <div
                        key={schedule.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(schedule);
                        }}
                        className="absolute left-1/2 ml-10 -translate-x-1/2 z-10 group/marker cursor-pointer"
                        style={{ top: `${top}%` }}
                      >
                        <div className={`w-8 h-8 -mt-4 rounded-full bg-white dark:bg-slate-800 border-2 ${level.border} shadow-md flex items-center justify-center transition-transform hover:scale-110`}>
                          <Icon className={`w-4 h-4 ${level.color}`} />
                        </div>
                        <div className="absolute left-10 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none z-20">
                          <div className="font-bold text-xs text-slate-700 dark:text-slate-200">{formatTimeReadable(schedule.start_time_minutes)}</div>
                          <div className={`text-xs ${level.color} font-medium`}>{level.label}</div>
                          {schedule.label && <div className="text-[10px] text-slate-500 max-w-[140px] truncate">{schedule.label}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute -bottom-8 left-0 right-0 text-center text-xs text-slate-500 dark:text-slate-400">
                  {schedules.length} / {MAX_MARKERS} markers
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Your markers</h4>
                  <button
                    onClick={() => openNewMarker()}
                    className="flex items-center gap-1 rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                {sortedSchedules.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No markers yet. Click the river or “Add” to drop your first one.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {sortedSchedules.map((schedule) => {
                      const level = getEnergyLevel(schedule.energy_key);
                      const Icon = level.icon;
                      return (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800/70"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border ${level.border} flex items-center justify-center bg-slate-50 dark:bg-slate-900`}>
                              <Icon className={`w-4 h-4 ${level.color}`} />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-100">
                                {formatTimeReadable(schedule.start_time_minutes)}
                              </div>
                              <div className={`text-xs ${level.color} font-semibold`}>{level.label}</div>
                        {schedule.label && <div className="text-xs text-slate-500 dark:text-slate-400">{schedule.label}</div>}
                      </div>
                    </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditModal(schedule)}
                              className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="rounded-lg px-2 py-1 text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Waves className="w-4 h-4 text-sky-500" />
                  How the river works
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li>• Click anywhere on the river to drop a marker.</li>
                  <li>• The color between markers shows your energy for that stretch.</li>
                  <li>• Markers merge if they share the same energy level.</li>
                  <li>• Use patterns to quickly reset when meds or schedule shifts.</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40">
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Legend</h4>
                <div className="space-y-2">
                  {ENERGY_LEVELS.map((level) => {
                    const Icon = level.icon;
                    return (
                      <div key={level.key} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/60">
                        <div className={`w-8 h-8 rounded-full border ${level.border} flex items-center justify-center bg-white dark:bg-slate-900`}>
                          <Icon className={`w-4 h-4 ${level.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{level.label}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{level.key.replace('-', ' ')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingId === 'new' ? 'New Energy Marker' : 'Edit Marker'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <button
                    onClick={() => adjustStartTime(-15)}
                    className="rounded-lg border border-slate-200 px-2 py-1 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    -15m
                  </button>
                  <button
                    onClick={() => adjustStartTime(15)}
                    className="rounded-lg border border-slate-200 px-2 py-1 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    +15m
                  </button>
                  <span className="ml-1">Snaps to the nearest 15 minutes</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Energy Level</label>
                <div className="grid grid-cols-1 gap-2">
                  {ENERGY_LEVELS.map((level) => {
                    const Icon = level.icon;
                    const isActive = editForm.energyKey === level.key;
                    return (
                      <button
                        key={level.key}
                        onClick={() => setEditForm({ ...editForm, energyKey: level.key })}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isActive ? `${level.bg} ${level.border} border-2` : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <Icon className={`w-5 h-5 ${level.color}`} />
                        <span className="font-medium text-slate-700 dark:text-slate-200">{level.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Label (optional)</label>
                <input
                  type="text"
                  value={editForm.label}
                  onChange={(e) => setEditForm({ ...editForm, label: e.target.value })}
                  placeholder="e.g., Morning Focus"
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {editingId !== 'new' && (
                  <button
                    onClick={() => handleDeleteSchedule(editingId!)}
                    className="px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={handleSaveSchedule}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isPatternModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-500" />
                Choose a Pattern
              </h3>
              <button onClick={() => setIsPatternModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {ENERGY_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => handleApplyPattern(pattern)}
                  className="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50 dark:hover:bg-slate-800/50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{pattern.label}</span>
                    <span className="opacity-0 group-hover:opacity-100 text-sky-500 transition-opacity">
                      <Check className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{pattern.description}</p>
                  <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    {pattern.schedule.map((item, i) => {
                      const level = getEnergyLevel(item.key);
                      return <div key={i} className={`h-full flex-1 ${level.bg}`} />;
                    })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
    </>
  );
}
