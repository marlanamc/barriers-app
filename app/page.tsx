"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, LineChart, CalendarPlus } from "lucide-react";
import { InternalWeatherSelector } from "@/components/InternalWeatherSelector";
import { AppWordmark } from "@/components/AppWordmark";
import { useCheckIn, MAX_FOCUS_ITEMS, type FocusItemState } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCategoryEmoji } from "@/lib/categories";
import { getPlannedItemsForDate } from "@/lib/supabase";
import { appliesToDate } from "@/lib/recurrence";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getFlowLabel() {
  const hour = new Date().getHours();
  if (hour < 12) return "Morning Flow";
  if (hour < 18) return "Afternoon Flow";
  return "Evening Flow";
}

export default function HomePage() {
  const router = useRouter();
  const { weather, setWeather, forecastNote, setForecastNote, focusItems, loadPlannedItems } = useCheckIn();
  const { user, loading, error } = useSupabaseUser();
  const [loadedPlanned, setLoadedPlanned] = useState(false);

  const greeting = useMemo(() => getGreeting(), []);
  const flowLabel = useMemo(() => getFlowLabel(), []);

  // Load planned items for today on mount
  useEffect(() => {
    if (!user || loadedPlanned || focusItems.length > 0) return;

    const today = new Date().toISOString().split('T')[0];

    getPlannedItemsForDate(user.id, today).then((plannedItems) => {
      // Filter items that apply to today based on recurrence
      const applicableItems = plannedItems.filter((item) => {
        return appliesToDate(today, {
          recurrenceType: item.recurrence_type,
          startDate: item.start_date,
          endDate: item.end_date,
          recurrenceDays: item.recurrence_days,
        });
      });

      if (applicableItems.length > 0) {
        // Convert planned items to focus item format
        const focusItemsFromPlanned: FocusItemState[] = applicableItems.map((item, index) => ({
          id: crypto.randomUUID(),
          description: item.description,
          categories: item.categories || [],
          sortOrder: index,
          barrier: item.custom_barrier || item.barrier_type_id
            ? {
                barrierTypeSlug: null, // We'd need to look this up if needed
                custom: item.custom_barrier,
              }
            : null,
          anchorType: item.anchor_type as FocusItemState['anchorType'],
          anchorValue: item.anchor_value,
        }));

        loadPlannedItems(focusItemsFromPlanned);
      }

      setLoadedPlanned(true);
    }).catch((err) => {
      console.error('Error loading planned items:', err);
      setLoadedPlanned(true);
    });
  }, [user, loadedPlanned, focusItems.length, loadPlannedItems]);

  const handleNext = () => {
    if (!weather) return;
    router.push("/focus");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600">Warming up your companion...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <AppWordmark className="text-base font-semibold" />
            <h1 className="text-3xl font-bold text-slate-900">{greeting}</h1>
          </div>
          <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            {flowLabel}
          </div>
        </header>

        <section className="space-y-4 rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-600">Step 1</p>
            <h2 className="text-2xl font-bold text-slate-900">What kind of day does it feel like inside?</h2>
            <p className="text-slate-600">Tap the card that feels the closest match.</p>
          </div>

          <InternalWeatherSelector selectedKey={weather?.key} onSelect={setWeather} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="forecast-note">
              Want to describe the forecast?
            </label>
            <textarea
              id="forecast-note"
              value={forecastNote}
              onChange={(event) => setForecastNote(event.target.value)}
              placeholder="Mentally foggy? Overstimulated? Drop a few words."
              className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              rows={3}
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}. You can still explore the flow, but saving may not work until Supabase is configured.
            </p>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!weather}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next: What Matters Today
            <ArrowRight className="h-5 w-5" />
          </button>
        </section>

        {focusItems.length > 0 && (
          <section className="space-y-4 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-cyan-600">Today&rsquo;s focus list</p>
                <p className="text-xs text-slate-500">Add up to {MAX_FOCUS_ITEMS} gentle points.</p>
              </div>
              <span className="text-sm font-semibold text-slate-600">
                {focusItems.length}/{MAX_FOCUS_ITEMS}
              </span>
            </div>

            <ul className="space-y-3">
              {focusItems
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => (
                  <li key={item.id} className="flex items-start gap-3 rounded-2xl bg-white/70 px-4 py-3">
                    <span className="text-2xl leading-none">
                      {getCategoryEmoji(item.categories[0]) || "•"}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{item.description}</p>
                      {item.categories.length > 0 && (
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {item.categories.join(" • ")}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
            </ul>

            <button
              type="button"
              onClick={() => router.push("/focus")}
              className="flex w-full items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              Add another focus
            </button>
          </section>
        )}

        <section className="space-y-3">
          <Link
            href="/calendar"
            className="group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm transition hover:bg-white hover:shadow-md"
          >
            <span className="rounded-full bg-cyan-100 p-3 text-cyan-700">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Calendar</p>
              <p className="text-sm text-slate-600">See your daily weather</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
          </Link>

          <Link
            href="/patterns"
            className="group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm transition hover:bg-white hover:shadow-md"
          >
            <span className="rounded-full bg-indigo-100 p-3 text-indigo-700">
              <LineChart className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Patterns</p>
              <p className="text-sm text-slate-600">Notice gentle trends</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
          </Link>

          <Link
            href="/plan-ahead"
            className="group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm transition hover:bg-white hover:shadow-md"
          >
            <span className="rounded-full bg-emerald-100 p-3 text-emerald-700">
              <CalendarPlus className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Plan Ahead</p>
              <p className="text-sm text-slate-600">Set up future or recurring items</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1" />
          </Link>
        </section>
      </div>
    </main>
  );
}
