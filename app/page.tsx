"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, CalendarPlus, CheckCircle2, Circle, LineChart, Plus, RotateCcw, Trash2 } from "lucide-react";
import { InternalWeatherSelector, internalWeatherOptions } from "@/components/InternalWeatherSelector";
import { AppWordmark } from "@/components/AppWordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useCheckIn, MAX_FOCUS_ITEMS, type FocusItemState, type WeatherSelection } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCategoryEmoji } from "@/lib/categories";
import { getPlannedItemsForDate, getCheckinByDate } from "@/lib/supabase";
import { appliesToDate } from "@/lib/recurrence";
import { getTodayLocalDateString } from "@/lib/date-utils";
import { anchorValueForDisplay } from "@/lib/anchors";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getTodayLabel() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());
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
    resetCheckIn,
  } = useCheckIn();
  const { user, loading, error } = useSupabaseUser();
  const [loadedPlanned, setLoadedPlanned] = useState(false);
  const [loadedCheckin, setLoadedCheckin] = useState(false);
  const [lastLoadedDate, setLastLoadedDate] = useState<string | null>(null);
  const [suppressAutoSelectWeather, setSuppressAutoSelectWeather] = useState(false);
  const [shouldScrollToWeather, setShouldScrollToWeather] = useState(false);
  const [isEditingWeather, setIsEditingWeather] = useState(false);
  const weatherSectionRef = useRef<HTMLDivElement>(null);
  const lastLoadedDateRef = useRef<string | null>(null);

  const greeting = useMemo(() => getGreeting(), []);
  const todayLabel = useMemo(() => getTodayLabel(), []);

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

  // Initial check on mount - if we have stale data from a previous day, reset
  useEffect(() => {
    const today = getTodayLocalDateString();
    if (lastLoadedDate && lastLoadedDate !== today) {
      resetCheckIn();
      setLoadedCheckin(false);
      setLoadedPlanned(false);
      setLastLoadedDate(null);
      lastLoadedDateRef.current = null;
    }
  }, []); // Run only once on mount

  // Check if date has changed (new day) and reset state if needed
  useEffect(() => {
    const checkDateChange = () => {
      const currentDate = getTodayLocalDateString();

      // If we've loaded a check-in before and the date has changed, reset everything
      if (lastLoadedDateRef.current && lastLoadedDateRef.current !== currentDate) {
        resetCheckIn(); // This clears weather, forecastNote, focusItems, and resets checkinDate
        setLoadedCheckin(false);
        setLoadedPlanned(false);
        setLastLoadedDate(null);
        lastLoadedDateRef.current = null;
      }
    };

    // Check periodically (every minute) to catch date changes
    const interval = setInterval(checkDateChange, 60000);

    return () => clearInterval(interval);
  }, [resetCheckIn]); // Only depend on stable resetCheckIn

  // Load today's checkin first (it takes priority as saved data), then load planned items if no checkin exists
  useEffect(() => {
    if (!user?.id || loadedCheckin) return;

    const cancelled = { current: false };
    const today = getTodayLocalDateString();

    // Set loadedCheckin immediately to prevent duplicate loads
    setLoadedCheckin(true);
    setLastLoadedDate(today);
    lastLoadedDateRef.current = today;

    getCheckinByDate(user.id, today)
      .then((checkin) => {
        if (cancelled.current) return;
        
        // Double-check that the check-in is actually for today
        const currentDate = getTodayLocalDateString();
        if (checkin && checkin.checkin_date !== currentDate) {
          // This check-in is not for today, don't load it
          loadPlannedItemsIfNeeded(user.id, currentDate, cancelled);
          return;
        }
        
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
    if (shouldScrollToWeather && weatherSectionRef.current) {
      // Small delay to ensure DOM has updated
      const timer = setTimeout(() => {
        weatherSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        setShouldScrollToWeather(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldScrollToWeather, weather, isEditingWeather]);

  useEffect(() => {
    if (!weather) {
      setIsEditingWeather(false);
      setSuppressAutoSelectWeather(false);
    }
  }, [weather]);

  // All hooks must be called before any conditional returns
  const activeFocusItems = useMemo(() => focusItems.filter((item) => !item.completed), [focusItems]);
  const completedFocusItems = useMemo(() => focusItems.filter((item) => item.completed), [focusItems]);
  const hasFocus = useMemo(() => focusItems.length > 0, [focusItems.length]);
  const hasWeather = useMemo(() => Boolean(weather), [weather]);
  const showCompactWeather = hasWeather && !isEditingWeather; // Hide summary while editing
  const shouldShowWeatherSection = !hasWeather || isEditingWeather;

  const handleAdjustWeather = () => {
    if (isEditingWeather) {
      setIsEditingWeather(false);
      setSuppressAutoSelectWeather(false);
      setShouldScrollToWeather(false);
      return;
    }

    setIsEditingWeather(true);
    setSuppressAutoSelectWeather(true);
    setShouldScrollToWeather(true);
  };

  const handleSelectWeather = (option: WeatherSelection) => {
    setWeather(option);
    setSuppressAutoSelectWeather(false);
    if (isEditingWeather) {
      setIsEditingWeather(false);
      setShouldScrollToWeather(false);
    }
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
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{todayLabel}</h2>
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Energy level</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What kind of day does it feel like inside?</h3>
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
    <section className="space-y-3 rounded-3xl border border-white/30 bg-pink-50 p-5 shadow-sm dark:border-slate-700/30 dark:bg-slate-800/80">
      {showCompactWeather && weather && (
        <>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{todayLabel}</h2>
          <div className="gradient-energy-panel rounded-2xl border border-white/40 px-4 py-3 text-sm text-slate-900 shadow-sm dark:border-slate-600/40 dark:text-slate-100">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="flex flex-wrap items-center gap-2 text-base font-semibold">
              <span className="text-2xl leading-none">{weather.icon}</span>
              <span>{weather.label}</span>
              <span className="text-sm font-normal text-slate-500 dark:text-slate-300">— {weather.description}</span>
            </p>
            <button
              type="button"
              onClick={handleAdjustWeather}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:bg-white dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Change
            </button>
          </div>
        </div>
        </>
      )}

      <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-400">
        <span>What matters today</span>
        <span>
          {activeFocusItems.length}/{MAX_FOCUS_ITEMS}
        </span>
      </div>

      {hasFocus ? (
        <>
          <ul className="space-y-2">
            {activeFocusItems
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((item) => {
                const anchorDisplayValue = anchorValueForDisplay(item.anchorType, item.anchorValue);
                const anchorType = item.anchorType && anchorDisplayValue ? item.anchorType : null;
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border border-white/40 bg-white/70 px-3 py-2 text-sm dark:border-slate-600/40 dark:bg-slate-700/50"
                  >
                    <button
                      type="button"
                      onClick={() => updateFocusItem(item.id, { completed: true })}
                      className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-cyan-200 hover:text-cyan-600 dark:hover:border-cyan-500 dark:hover:text-cyan-300"
                      aria-label="Mark focus as done"
                    >
                      <Circle className="h-4 w-4" />
                    </button>
                    <div className="flex-1 space-y-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
                        <span className="text-lg leading-none">{getCategoryEmoji(item.categories[0]) || "•"}</span>
                        <span>{item.description}</span>
                      </p>
                      {anchorType && anchorDisplayValue && (
                        <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                          {anchorType} {anchorDisplayValue}
                        </p>
                      )}
                      {item.categories.length > 0 && (
                        <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                          {item.categories.join(" • ")}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFocusItem(item.id)}
                      className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-600 dark:hover:text-rose-400"
                      aria-label="Delete focus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
          </ul>

          {completedFocusItems.length > 0 && (
            <div className="space-y-2 border-t border-dashed border-slate-200 pt-3 dark:border-slate-600">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Completed today</p>
              <ul className="space-y-1">
                {completedFocusItems
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => {
                    const anchorDisplayValue = anchorValueForDisplay(item.anchorType, item.anchorValue);
                    const anchorType = item.anchorType && anchorDisplayValue ? item.anchorType : null;
                    return (
                      <li
                        key={item.id}
                        className="flex items-start gap-3 rounded-2xl border border-transparent bg-slate-50/80 px-3 py-2 text-sm dark:bg-slate-700/30"
                      >
                        <button
                          type="button"
                          onClick={() => updateFocusItem(item.id, { completed: false })}
                          className="rounded-full border border-transparent p-1 text-emerald-500 transition hover:border-emerald-200 dark:hover:border-emerald-700"
                          aria-label="Mark focus as not done"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-slate-500 line-through dark:text-slate-400">{item.description}</p>
                          {anchorType && anchorDisplayValue && (
                            <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-300">
                              {anchorType} {anchorDisplayValue}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFocusItem(item.id)}
                          className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-600 dark:hover:text-rose-400"
                          aria-label="Delete completed focus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={() => router.push("/focus")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600/50 dark:bg-slate-700/40 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Open focus & supports
          </button>
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/40 bg-white/70 p-4 text-center text-sm text-slate-600 dark:border-slate-700/40 dark:bg-slate-800/50 dark:text-slate-400">
          <p>Nothing added yet. Drop today&rsquo;s focus when you&rsquo;re ready.</p>
          <button
            type="button"
            onClick={() => router.push("/focus")}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600/60 dark:bg-slate-700/40 dark:text-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add focus
          </button>
        </div>
      )}
    </section>
  );

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-start justify-between">
          <div>
            <AppWordmark className="text-base font-semibold" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{greeting}</h1>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {hasFocus ? (
          <>
            {renderFocusSummary()}
            {shouldShowWeatherSection && renderWeatherSection()}
          </>
        ) : (
          <>
            {shouldShowWeatherSection && renderWeatherSection()}
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
