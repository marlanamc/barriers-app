"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, CalendarPlus, CheckCircle2, Circle, LineChart, RotateCcw, Trash2 } from "lucide-react";
import { InternalWeatherSelector } from "@/components/InternalWeatherSelector";
import { AppWordmark } from "@/components/AppWordmark";
import { useCheckIn, MAX_FOCUS_ITEMS, type FocusItemState, type WeatherSelection } from "@/lib/checkin-context";
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
  const {
    weather,
    setWeather,
    forecastNote,
    setForecastNote,
    focusItems,
    loadPlannedItems,
    updateFocusItem,
    removeFocusItem,
  } = useCheckIn();
  const { user, loading, error } = useSupabaseUser();
  const [loadedPlanned, setLoadedPlanned] = useState(false);
  const [suppressAutoSelectWeather, setSuppressAutoSelectWeather] = useState(false);
  const weatherSectionRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const flowLabel = useMemo(() => getFlowLabel(), []);

  useEffect(() => {
    if (!user || loadedPlanned || focusItems.length > 0) return;

    const today = new Date().toISOString().split("T")[0];

    getPlannedItemsForDate(user.id, today)
      .then((plannedItems) => {
        const applicableItems = plannedItems.filter((item) =>
          appliesToDate(today, {
            recurrenceType: item.recurrence_type,
            startDate: item.start_date,
            endDate: item.end_date,
            recurrenceDays: item.recurrence_days,
          })
        );

        if (applicableItems.length > 0) {
          const focusItemsFromPlanned: FocusItemState[] = applicableItems.map((item, index) => ({
            id: crypto.randomUUID(),
            description: item.description,
            categories: item.categories || [],
            sortOrder: index,
            plannedItemId: item.id,
            barrier:
              item.custom_barrier || item.barrier_type_id
                ? {
                    barrierTypeId: item.barrier_type_id,
                    barrierTypeSlug: item.barrier_types?.slug ?? null,
                    custom: item.custom_barrier,
                  }
                : null,
            anchorType: item.anchor_type as FocusItemState["anchorType"],
            anchorValue: item.anchor_value,
            completed: false,
          }));

          loadPlannedItems(focusItemsFromPlanned);
        }

        setLoadedPlanned(true);
      })
      .catch((err) => {
        console.error("Error loading planned items:", err);
        setLoadedPlanned(true);
      });
  }, [user, loadedPlanned, focusItems.length, loadPlannedItems]);

  const handleResetWeather = () => {
    setWeather(null);
    setSuppressAutoSelectWeather(true);
    requestAnimationFrame(() => {
      weatherSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleSelectWeather = (option: WeatherSelection) => {
    setWeather(option);
    setSuppressAutoSelectWeather(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600">Warming up your companion...</p>
      </main>
    );
  }

  const activeFocusItems = focusItems.filter((item) => !item.completed);
  const completedFocusItems = focusItems.filter((item) => item.completed);
  const hasFocus = focusItems.length > 0;
  const hasWeather = Boolean(weather);
  const showCompactWeather = hasFocus && hasWeather;

  const renderWeatherSection = () => (
    <section ref={weatherSectionRef} className="space-y-4 rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-600">Step 1</p>
        <h2 className="text-2xl font-bold text-slate-900">What kind of day does it feel like inside?</h2>
        <p className="text-slate-600">Tap the card that feels the closest match.</p>
      </div>

      <InternalWeatherSelector
        selectedKey={weather?.key}
        onSelect={handleSelectWeather}
        suppressAutoSelect={suppressAutoSelectWeather}
        onUserInteract={() => setSuppressAutoSelectWeather(false)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor="forecast-note">
          How are your energy or focus levels today?
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
        onClick={() => router.push("/focus")}
        disabled={!weather}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next: What Matters Today
        <ArrowRight className="h-5 w-5" />
      </button>
    </section>
  );

  const renderFocusSummary = () => (
    <section className="space-y-4 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-600">Today&rsquo;s focus list</p>
          <p className="text-xs text-slate-500">A soft snapshot of what matters.</p>
        </div>
        <span className="text-sm font-semibold text-slate-600">
          {activeFocusItems.length}/{MAX_FOCUS_ITEMS}
        </span>
      </div>

      {showCompactWeather && weather && (
        <div className="flex flex-col gap-2 rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">Today&rsquo;s energy</p>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-2xl">{weather.icon}</span>
              {weather.label}
            </p>
            <p className="text-sm text-slate-600">{weather.description}</p>
          </div>
          <button
            type="button"
            onClick={handleResetWeather}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200 px-3 py-1 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            <RotateCcw className="h-4 w-4" />
            Adjust energy
          </button>
        </div>
      )}

      {hasFocus ? (
        <>
          <ul className="space-y-3">
            {activeFocusItems
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => (
                <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => updateFocusItem(item.id, { completed: true })}
                    className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-cyan-200 hover:text-cyan-600"
                    aria-label="Mark focus as done"
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 flex items-center gap-2">
                      <span className="text-2xl leading-none">{getCategoryEmoji(item.categories[0]) || "•"}</span>
                      <span>{item.description}</span>
                    </p>
                    {item.categories.length > 0 && (
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        {item.categories.join(" • ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFocusItem(item.id)}
                    className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600"
                    aria-label="Delete focus"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
          </ul>

          {completedFocusItems.length > 0 && (
            <div className="space-y-2 border-t border-white/40 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed today</p>
              <ul className="space-y-2">
                {completedFocusItems
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => (
                    <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => updateFocusItem(item.id, { completed: false })}
                        className="rounded-full border border-transparent p-1 text-emerald-500 transition hover:border-emerald-200"
                        aria-label="Mark focus as not done"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-500 line-through">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFocusItem(item.id)}
                        className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600"
                        aria-label="Delete completed focus"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push("/focus")}
            className="flex w-full items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            Open focus & supports
          </button>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/40 bg-white/70 p-5 text-center">
          <p className="text-sm text-slate-600">No focus items yet. Start Step 2 when you&rsquo;re ready.</p>
          <button
            type="button"
            onClick={() => router.push("/focus")}
            className="mt-3 inline-flex items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
          >
            Go to Step 2
          </button>
        </div>
      )}
    </section>
  );

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

        {hasFocus ? (
          <>
            {renderFocusSummary()}
            {renderWeatherSection()}
          </>
        ) : (
          <>
            {renderWeatherSection()}
            {renderFocusSummary()}
          </>
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
              <p className="text-sm text-slate-600">See your daily energy</p>
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
