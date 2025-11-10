"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { useCheckIn, type TaskAnchorType } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCheckinsForRange, type CheckinWithRelations } from "@/lib/supabase";
import { formatDateToLocalString } from "@/lib/date-utils";
import { anchorLabel } from "@/lib/anchors";
import { getCategoryEmoji } from "@/lib/categories";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const { weather } = useCheckIn();
  const { user, loading: authLoading } = useSupabaseUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [checkins, setCheckins] = useState<CheckinWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedCheckin, setSelectedCheckin] = useState<CheckinWithRelations | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      setError(null);
      
      try {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const startOfMonth = new Date(year, month, 1);
        const endOfMonth = new Date(year, month + 1, 0);
        
        const startDate = formatDateToLocalString(startOfMonth);
        const endDate = formatDateToLocalString(endOfMonth);

        const data = await getCheckinsForRange(user.id, startDate, endDate);

        setCheckins(data || []);
      } catch (err) {
        console.error('Error loading checkins:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load calendar data';
        setError(errorMessage);
        setCheckins([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentDate, user]);

  const checkinsByDate = useMemo(() => {
    return checkins.reduce<Record<string, CheckinWithRelations>>((acc, checkin) => {
      if (checkin?.checkin_date) {
        acc[checkin.checkin_date] = checkin;
      }
      return acc;
    }, {});
  }, [checkins]);

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<Date | null> = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function openModal(date: Date) {
    const iso = date.toISOString().split("T")[0];
    const entry = checkinsByDate[iso];
    if (!entry) return;
    setSelectedDate(iso);
    setSelectedCheckin(entry);
  }

  function closeModal() {
    setSelectedDate(null);
    setSelectedCheckin(null);
  }

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600" role="status" aria-live="polite">Syncing your calendar...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <header className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
              aria-label="Go back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-600">Calendar</p>
              <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
            </div>
          </header>
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6" role="alert">
            <p className="text-sm font-medium text-rose-800 mb-2">Unable to load calendar</p>
            <p className="text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const days = getDaysInMonth();

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600">Calendar</p>
            <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
            <p className="text-sm text-slate-600">Tap a day to revisit your focus + barriers.</p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
              className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:bg-white"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>
              {weather && <p className="text-xs text-slate-500">Today feels {weather.label.toLowerCase()}</p>}
            </div>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
              className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:bg-white"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-500">
            {dayNames.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="mt-3 grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const iso = date.toISOString().split("T")[0];
              const entry = checkinsByDate[iso];
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => openModal(date)}
                  className={`aspect-square rounded-2xl border px-2 py-2 text-left transition ${
                    entry
                      ? "border-cyan-200 bg-white shadow-sm hover:-translate-y-0.5"
                      : "border-white/40 bg-white/60"
                  } ${isToday ? "ring-2 ring-cyan-200" : ""} disabled:cursor-not-allowed disabled:opacity-60`}
                  disabled={!entry}
                  aria-label={entry ? `View check-in for ${date.toLocaleDateString()}` : `No check-in for ${date.toLocaleDateString()}`}
                  aria-pressed={selectedDate === iso}
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                    <span>{date.getDate()}</span>
                    {entry && entry.weather_icon && <span className="text-base">{entry.weather_icon}</span>}
                  </div>
                  {entry && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500">
                      {entry.internal_weather}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {selectedCheckin && selectedDate && (
        <div 
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 px-4 pb-6 pt-12 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkin-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">{selectedDate}</p>
                <p id="checkin-modal-title" className="text-xl font-semibold text-slate-900">
                  {selectedCheckin.weather_icon} {selectedCheckin.internal_weather}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:text-slate-800"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedCheckin.forecast_note && (
              <p className="mb-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {selectedCheckin.forecast_note}
              </p>
            )}

            <div className="space-y-3">
              {selectedCheckin.focus_items && selectedCheckin.focus_items.length > 0 ? (
                selectedCheckin.focus_items.map((item) => {
                  if (!item) return null;
                  const barrier = item.focus_barriers?.[0];
                  const barrierLabel = barrier?.barrier_types?.label || barrier?.custom_barrier;
                  const anchorType = (item.anchor_type as TaskAnchorType | null) ?? null;
                  const anchor = anchorLabel(anchorType, item.anchor_value || null);
                  const categoryEmoji = getCategoryEmoji(item.categories?.[0]);
                  return (
                    <div key={item.id} className="rounded-2xl border border-white/40 bg-white px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        {categoryEmoji && <span className="text-xl" aria-hidden="true">{categoryEmoji}</span>}
                        <span>{item.description}</span>
                      </p>
                    {anchor && (
                      <div className="mt-2 rounded-2xl border border-cyan-100 bg-cyan-50/80 px-3 py-2 text-xs text-cyan-800">
                        <p className="font-semibold uppercase tracking-wide text-[10px] text-cyan-600">Anchor pairing</p>
                        <p className="mt-0.5 font-medium">{anchor}</p>
                      </div>
                    )}
                    {barrierLabel && (
                      <p className="text-xs text-slate-500">
                        {barrier?.barrier_types?.icon && <span className="mr-1" aria-hidden="true">{barrier.barrier_types.icon}</span>}
                        {barrierLabel}
                      </p>
                    )}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500">No focus items for this check-in.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
