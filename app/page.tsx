"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, CalendarPlus, CheckCircle2, Circle, LineChart, RotateCcw, Trash2 } from "lucide-react";
import { InternalWeatherSelector, internalWeatherOptions } from "@/components/InternalWeatherSelector";
import { AppWordmark } from "@/components/AppWordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCheckIn, MAX_FOCUS_ITEMS, type FocusItemState, type WeatherSelection } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCategoryEmoji } from "@/lib/categories";
import { getPlannedItemsForDate, getCheckinByDate } from "@/lib/supabase";
import { appliesToDate } from "@/lib/recurrence";
import { getTodayLocalDateString } from "@/lib/date-utils";

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
    loadFocusItemsFromCheckin,
    updateFocusItem,
    removeFocusItem,
  } = useCheckIn();
  const { user, loading, error } = useSupabaseUser();
  const [loadedPlanned, setLoadedPlanned] = useState(false);
  const [loadedCheckin, setLoadedCheckin] = useState(false);
  const [suppressAutoSelectWeather, setSuppressAutoSelectWeather] = useState(false);
  const [shouldScrollToWeather, setShouldScrollToWeather] = useState(false);
  const weatherSectionRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const flowLabel = useMemo(() => getFlowLabel(), []);

  // Memoize the load planned items function to avoid recreating it on every render
  const loadPlannedItemsIfNeeded = useCallback(async (userId: string, date: string, cancelled: { current: boolean }) => {
    if (loadedPlanned || cancelled.current) return;
    
    try {
      const plannedItems = await getPlannedItemsForDate(userId, date);
      if (cancelled.current) return;
      
      const applicableItems = plannedItems.filter((item) =>
        appliesToDate(date, {
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
    } catch (err) {
      if (!cancelled.current) {
        console.error("Error loading planned items:", err);
      }
      setLoadedPlanned(true);
    }
  }, [loadedPlanned, loadPlannedItems]);

  // Load today's checkin first (it takes priority as saved data), then load planned items if no checkin exists
  useEffect(() => {
    if (!user?.id || loadedCheckin) return;

    const cancelled = { current: false };
    const today = getTodayLocalDateString();

    // Set loadedCheckin immediately to prevent duplicate loads
    setLoadedCheckin(true);

    getCheckinByDate(user.id, today)
      .then((checkin) => {
        if (cancelled.current) return;
        
        if (checkin) {
          // Restore weather if it exists
          if (checkin.internal_weather) {
            const weatherOption = internalWeatherOptions.find(
              (opt) => opt.key === checkin.internal_weather
            );

            if (weatherOption) {
              const weatherSelection: WeatherSelection = {
                key: weatherOption.key,
                label: weatherOption.label,
                description: weatherOption.description,
                icon: checkin.weather_icon || weatherOption.icon,
              };
              setWeather(weatherSelection);
            }
          }

          // Restore forecast note if it exists
          if (checkin.forecast_note) {
            setForecastNote(checkin.forecast_note);
          }

          // Restore focus items if they exist
          if (checkin.focus_items && checkin.focus_items.length > 0) {
            const restoredFocusItems: FocusItemState[] = checkin.focus_items.map((item) => {
              // Convert FocusItemWithRelations to FocusItemState
              // Get the first barrier (if any) from focus_barriers array
              const firstBarrier = item.focus_barriers && item.focus_barriers.length > 0 
                ? item.focus_barriers[0] 
                : null;

              return {
                id: item.id,
                description: item.description,
                categories: item.categories || [],
                sortOrder: item.sort_order,
                plannedItemId: null, // Saved check-ins don't preserve plannedItemId
                barrier: firstBarrier
                  ? {
                      barrierTypeId: firstBarrier.barrier_type_id ?? null,
                      barrierTypeSlug: firstBarrier.barrier_types?.slug ?? null,
                      custom: firstBarrier.custom_barrier ?? null,
                    }
                  : null,
                anchorType: (item.anchor_type as FocusItemState["anchorType"]) ?? null,
                anchorValue: item.anchor_value ?? null,
                completed: false, // Always restore as active items
              };
            });

            loadFocusItemsFromCheckin(restoredFocusItems);
            // If checkin has focus items, don't load planned items
            setLoadedPlanned(true);
          } else {
            // No checkin focus items, so load planned items
            loadPlannedItemsIfNeeded(user.id, today, cancelled);
          }
        } else {
          // No checkin exists, load planned items
          loadPlannedItemsIfNeeded(user.id, today, cancelled);
        }
      })
      .catch((err) => {
        if (!cancelled.current) {
          console.error("Error loading today's checkin:", err);
          // On error, still try to load planned items
          loadPlannedItemsIfNeeded(user.id, today, cancelled);
        }
      });

    return () => {
      cancelled.current = true;
    };
  }, [user?.id, loadedCheckin, loadPlannedItems, loadFocusItemsFromCheckin, loadPlannedItemsIfNeeded]); // setWeather and setForecastNote are stable from useState

  // Scroll to weather section when it appears after reset
  useEffect(() => {
    if (shouldScrollToWeather && !weather && weatherSectionRef.current) {
      // Small delay to ensure DOM has updated
      const timer = setTimeout(() => {
        weatherSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        setShouldScrollToWeather(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToWeather, weather]);

  // All hooks must be called before any conditional returns
  const activeFocusItems = useMemo(() => focusItems.filter((item) => !item.completed), [focusItems]);
  const completedFocusItems = useMemo(() => focusItems.filter((item) => item.completed), [focusItems]);
  const hasFocus = useMemo(() => focusItems.length > 0, [focusItems.length]);
  const hasWeather = useMemo(() => Boolean(weather), [weather]);
  const showCompactWeather = hasWeather; // Show weather whenever it's selected, even without focus items

  const handleResetWeather = () => {
    setWeather(null);
    setForecastNote(''); // Also clear the forecast note
    setSuppressAutoSelectWeather(true);
    setShouldScrollToWeather(true); // Trigger scroll after section appears
  };

  const handleSelectWeather = (option: WeatherSelection) => {
    setWeather(option);
    setSuppressAutoSelectWeather(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600 dark:text-slate-400">Warming up your companion...</p>
      </main>
    );
  }

  const renderWeatherSection = () => (
    <section ref={weatherSectionRef} className="space-y-4 rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur dark:border-slate-700/30 dark:bg-slate-800/70">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Energy level</p>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What kind of day does it feel like inside?</h2>
        <p className="text-slate-600 dark:text-slate-400">Tap the card that feels the closest match.</p>
      </div>

      <InternalWeatherSelector
        selectedKey={weather?.key}
        onSelect={handleSelectWeather}
        suppressAutoSelect={suppressAutoSelectWeather}
        onUserInteract={() => setSuppressAutoSelectWeather(false)}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300" htmlFor="forecast-note">
          How are your energy or focus levels today?
        </label>
        <textarea
          id="forecast-note"
          value={forecastNote}
          onChange={(event) => setForecastNote(event.target.value)}
          placeholder="Mentally foggy? Overstimulated? Drop a few words."
          className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700/30 dark:bg-slate-700/50 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/50"
          rows={3}
        />
      </div>

      {error && (
        <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          {error}. You can still explore the flow, but saving may not work until Supabase is configured.
        </p>
      )}

      <button
        type="button"
        onClick={() => router.push("/focus")}
        disabled={!weather}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        Next: What Matters Today
        <ArrowRight className="h-5 w-5" />
      </button>
    </section>
  );

  const renderFocusSummary = () => (
    <section className="space-y-4 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm dark:border-slate-700/30 dark:bg-slate-800/80">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Today&rsquo;s focus list</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">A soft snapshot of what matters.</p>
        </div>
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {activeFocusItems.length}/{MAX_FOCUS_ITEMS}
        </span>
      </div>

      {showCompactWeather && weather && (
        <div className="flex flex-col gap-2 rounded-2xl border border-cyan-200 bg-cyan-50/70 px-4 py-3 text-slate-900 sm:flex-row sm:items-center sm:justify-between dark:border-cyan-800/50 dark:bg-cyan-900/30 dark:text-slate-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Today&rsquo;s energy</p>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <span className="text-2xl">{weather.icon}</span>
              {weather.label}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300">{weather.description}</p>
          </div>
          <button
            type="button"
            onClick={handleResetWeather}
            className="inline-flex items-center gap-2 rounded-full border border-cyan-200 px-3 py-1 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-700/50 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
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
                <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-3 dark:bg-slate-700/50">
                  <button
                    type="button"
                    onClick={() => updateFocusItem(item.id, { completed: true })}
                    className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-cyan-200 hover:text-cyan-600 dark:hover:border-cyan-600 dark:hover:text-cyan-400"
                    aria-label="Mark focus as done"
                  >
                    <Circle className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span className="text-2xl leading-none">{getCategoryEmoji(item.categories[0]) || "•"}</span>
                      <span>{item.description}</span>
                    </p>
                    {item.categories.length > 0 && (
                      <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        {item.categories.join(" • ")}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFocusItem(item.id)}
                    className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-700 dark:hover:text-rose-400"
                    aria-label="Delete focus"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </li>
              ))}
          </ul>

          {completedFocusItems.length > 0 && (
            <div className="space-y-2 border-t border-white/40 dark:border-slate-700/50 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Completed today</p>
              <ul className="space-y-2">
                {completedFocusItems
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => (
                    <li key={item.id} className="flex items-center gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-slate-700/30">
                      <button
                        type="button"
                        onClick={() => updateFocusItem(item.id, { completed: false })}
                        className="rounded-full border border-transparent p-1 text-emerald-500 transition hover:border-emerald-200 dark:hover:border-emerald-700"
                        aria-label="Mark focus as not done"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-500 dark:text-slate-400 line-through">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFocusItem(item.id)}
                        className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-700 dark:hover:text-rose-400"
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
            className="flex w-full items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-800/50 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
          >
            Open focus & supports
          </button>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/40 bg-white/70 p-5 text-center dark:border-slate-700/50 dark:bg-slate-800/50">
          <p className="text-sm text-slate-600 dark:text-slate-400">No focus items yet. Add your focus when you&rsquo;re ready.</p>
          <button
            type="button"
            onClick={() => router.push("/focus")}
            className="mt-3 inline-flex items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100 dark:border-cyan-800/50 dark:bg-cyan-900/30 dark:text-cyan-300 dark:hover:bg-cyan-900/50"
          >
            Add focus
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{greeting}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm dark:bg-slate-800/70 dark:text-slate-300">
              {flowLabel}
            </div>
            <ThemeToggle />
          </div>
        </header>

        {hasFocus ? (
          <>
            {renderFocusSummary()}
            {!hasWeather && renderWeatherSection()}
          </>
        ) : (
          <>
            {!hasWeather && renderWeatherSection()}
            {renderFocusSummary()}
          </>
        )}

        <section className="space-y-3">
          <Link
            href="/calendar"
            className="group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm transition hover:bg-white hover:shadow-md dark:border-slate-700/30 dark:bg-slate-800/70 dark:hover:bg-slate-800"
          >
            <span className="rounded-full bg-cyan-100 p-3 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Calendar</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">See your daily energy</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 transition group-hover:translate-x-1" />
          </Link>

          <Link
            href="/patterns"
            className="group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm transition hover:bg-white hover:shadow-md dark:border-slate-700/30 dark:bg-slate-800/70 dark:hover:bg-slate-800"
          >
            <span className="rounded-full bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              <LineChart className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Patterns</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Notice gentle trends</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 transition group-hover:translate-x-1" />
          </Link>

          <Link
            href="/plan-ahead"
            className="group flex items-center gap-4 rounded-2xl border border-white/30 bg-white/70 p-4 shadow-sm transition hover:bg-white hover:shadow-md dark:border-slate-700/30 dark:bg-slate-800/70 dark:hover:bg-slate-800"
          >
            <span className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
              <CalendarPlus className="h-5 w-5" />
            </span>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">Plan Ahead</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Set up future or recurring items</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500 transition group-hover:translate-x-1" />
          </Link>
        </section>
      </div>
    </main>
  );
}
