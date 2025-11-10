"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CalendarDays, CalendarPlus, CheckCircle2, Circle, GripVertical, LineChart, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { InternalWeatherSelector, internalWeatherOptions } from "@/components/InternalWeatherSelector";
import { AppWordmark } from "@/components/AppWordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useCheckIn, MAX_FOCUS_ITEMS, type FocusItemState, type WeatherSelection } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCategoryEmoji } from "@/lib/categories";
import { getPlannedItemsForDate, getCheckinByDate, saveCheckinWithFocus } from "@/lib/supabase";
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

const weatherThemes: Record<
  string,
  {
    gradient: [string, string];
    darkGradient?: [string, string]; // Optional darker gradient for dark mode
    textColor: string;
    darkTextColor?: string; // Text color for dark mode
    subtleTextColor: string;
    darkSubtleTextColor?: string; // Subtle text color for dark mode
  }
> = {
  sparky: {
    gradient: ["#FF6B6B", "#FFE66D"],
    darkGradient: ["#CC5555", "#CCB855"], // Darker, more muted for dark mode
    textColor: "text-slate-900",
    darkTextColor: "text-white",
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-100",
  },
  steady: {
    gradient: ["#FFD580", "#FFF9E3"],
    darkGradient: ["#CCAA66", "#CCCCB3"], // Darker, more muted for dark mode
    textColor: "text-slate-900",
    darkTextColor: "text-slate-900", // Still readable on lighter gradient
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-700",
  },
  flowing: {
    gradient: ["#4ECDC4", "#95E1D3"],
    darkGradient: ["#3E9C94", "#75B1A3"], // Darker, more muted for dark mode
    textColor: "text-slate-900",
    darkTextColor: "text-white",
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-100",
  },
  foggy: {
    gradient: ["#9CBED7", "#D1E2EA"],
    darkGradient: ["#7C9EB7", "#B1C2DA"], // Darker, more muted for dark mode
    textColor: "text-slate-900",
    darkTextColor: "text-white",
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-100",
  },
  resting: {
    gradient: ["#B6B6D8", "#E0D5F2"],
    darkGradient: ["#9696B8", "#C0B5D2"], // Darker, more muted for dark mode
    textColor: "text-slate-900",
    darkTextColor: "text-white",
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-100",
  },
  // Legacy support for old weather keys
  clear: {
    gradient: ["#FFD580", "#FFF9E3"],
    darkGradient: ["#CCAA66", "#CCCCB3"],
    textColor: "text-slate-900",
    darkTextColor: "text-slate-900",
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-700",
  },
  cloudy: {
    gradient: ["#CDE3F5", "#F2F2F2"],
    darkGradient: ["#ADC3D5", "#D2D2D2"],
    textColor: "text-slate-900",
    darkTextColor: "text-slate-900",
    subtleTextColor: "text-slate-600",
    darkSubtleTextColor: "text-slate-600",
  },
  rainy: {
    gradient: ["#9CBED7", "#D1E2EA"],
    darkGradient: ["#7C9EB7", "#B1C2DA"],
    textColor: "text-slate-900",
    darkTextColor: "text-white",
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-100",
  },
  stormy: {
    gradient: ["#B38DCB", "#5D7AA2"],
    darkGradient: ["#936DAB", "#4D5A82"], // Slightly darker for dark mode
    textColor: "text-white",
    darkTextColor: "text-white",
    subtleTextColor: "text-indigo-100",
    darkSubtleTextColor: "text-indigo-200",
  },
  quiet: {
    gradient: ["#B6B6D8", "#E0D5F2"],
    darkGradient: ["#9696B8", "#C0B5D2"],
    textColor: "text-slate-900",
    darkTextColor: "text-white",
    subtleTextColor: "text-slate-700",
    darkSubtleTextColor: "text-slate-100",
  },
};

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
    reorderFocusItems,
    resetCheckIn,
    clearLocalStorageForDate,
  } = useCheckIn();
  const { user, loading, error } = useSupabaseUser();
  const [loadedPlanned, setLoadedPlanned] = useState(false);
  const [loadedCheckin, setLoadedCheckin] = useState(false);
  const [lastLoadedDate, setLastLoadedDate] = useState<string | null>(null);
  const [suppressAutoSelectWeather, setSuppressAutoSelectWeather] = useState(false);
  const [shouldScrollToWeather, setShouldScrollToWeather] = useState(false);
  const [isEditingWeather, setIsEditingWeather] = useState(false);
  const [savingEnergy, setSavingEnergy] = useState(false);
  const [saveEnergyError, setSaveEnergyError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const weatherSectionRef = useRef<HTMLDivElement>(null);
  const lastLoadedDateRef = useRef<string | null>(null);
  
  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark') || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches);
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', checkDarkMode);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', checkDarkMode);
    };
  }, []);

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
  // Only load if we don't already have check-in data set (once set, it stays stable for the day)
  useEffect(() => {
    if (!user?.id || loadedCheckin) return;

    const cancelled = { current: false };
    const today = getTodayLocalDateString();

    // If we already have check-in data (weather or focus items), don't reload from database
    // This ensures once the check-in is set, it stays stable for the day - users can still change it manually
    if (weather || focusItems.length > 0) {
      setLoadedCheckin(true);
      setLastLoadedDate(today);
      lastLoadedDateRef.current = today;
      // Still load planned items if we don't have focus items yet (user might have only set weather)
      if (!focusItems.length) {
        loadPlannedItemsIfNeeded(user.id, today, cancelled);
      }
      return;
    }

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
        
        // Only load if we still don't have check-in data (user might have set it while loading)
        // Use a function to get current state to avoid stale closure
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
          }
          
          // IMPORTANT: If a check-in exists (even with 0 items), don't load planned items
          // A check-in with 0 items means the user explicitly chose to have no focus items today
          setLoadedPlanned(true);
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
  }, [user?.id, loadedCheckin, loadPlannedItems, loadFocusItemsFromCheckin, loadPlannedItemsIfNeeded, weather, focusItems.length]); // Include weather and focusItems to check if already set

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
  const hasFocus = useMemo(() => activeFocusItems.length > 0, [activeFocusItems.length]);
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

  const handleSetEnergy = async () => {
    if (!user || !weather) return;
    
    setSavingEnergy(true);
    setSaveEnergyError(null);

    try {
      const checkinDate = getTodayLocalDateString();
      const activeItems = focusItems.filter((item) => !item.completed);
      
      await saveCheckinWithFocus({
        userId: user.id,
        internalWeather: weather,
        forecastNote: forecastNote || undefined,
        focusItems: activeItems.map((item) => ({
          id: item.id,
          description: item.description,
          categories: item.categories,
          sortOrder: item.sortOrder,
          plannedItemId: item.plannedItemId ?? null,
          anchorType: item.anchorType || null,
          anchorValue: item.anchorValue || null,
          barrier: item.barrier || null,
        })),
        checkinDate,
      });

      // Clear localStorage after successful save (database is now source of truth)
      clearLocalStorageForDate(checkinDate);

      // Close the weather section after saving
      setIsEditingWeather(false);
      setSuppressAutoSelectWeather(false);
      setShouldScrollToWeather(false);
    } catch (err) {
      console.error('Error saving energy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save energy level';
      setSaveEnergyError(errorMessage);
    } finally {
      setSavingEnergy(false);
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
        <p className="text-sm font-medium uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Energy type</p>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What kind of energy do you have right now?</h3>
        <p className="text-slate-600 dark:text-slate-400">Scroll to find yours—it selects automatically.</p>
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

      {saveEnergyError && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {saveEnergyError}
        </p>
      )}

      <button
        type="button"
        onClick={handleSetEnergy}
        disabled={!weather || savingEnergy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
      >
        {savingEnergy ? (
          <>
            <span className="animate-spin">⏳</span>
            Setting Energy...
          </>
        ) : (
          "Set Energy"
        )}
      </button>
    </section>
  );

  const renderFocusSummary = () => {
    const theme = weather?.key && weatherThemes[weather.key] ? weatherThemes[weather.key] : null;
    
    // Create lighter version of gradient by mixing with white (70% white, 30% original)
    const lightenColor = (hex: string, amount: number = 0.7): string => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      const newR = Math.round(r + (255 - r) * amount);
      const newG = Math.round(g + (255 - g) * amount);
      const newB = Math.round(b + (255 - b) * amount);
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
    };
    
    // Use dark gradient if available and in dark mode
    const activeGradient = theme && isDarkMode && theme.darkGradient 
      ? theme.darkGradient 
      : theme?.gradient;
    
    const cardBackground = activeGradient
      ? `linear-gradient(135deg, ${lightenColor(activeGradient[0], 0.7)} 0%, ${lightenColor(activeGradient[1], 0.7)} 100%)`
      : 'linear-gradient(135deg, #fef3f2 0%, #fef7f6 100%)'; // Default light pink fallback
    
    // Get gradient for the energy type badge
    const badgeGradient = theme && isDarkMode && theme.darkGradient
      ? theme.darkGradient
      : theme?.gradient;
    
    return (
    <section 
      className="space-y-3 rounded-3xl border border-white/30 p-5 shadow-sm dark:border-slate-700/30 dark:bg-slate-800/80"
      style={{ background: cardBackground }}
    >
      {showCompactWeather && weather && (
        <>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-900">{todayLabel}</h2>
          {theme && badgeGradient && (
              <div 
                className={`rounded-2xl border border-white/40 px-4 py-3 text-sm shadow-sm dark:border-slate-600/40 ${isDarkMode ? (theme.darkTextColor || 'text-white') : (theme.textColor || 'text-slate-900')}`}
                style={{
                  background: `linear-gradient(135deg, ${badgeGradient[0]} 0%, ${badgeGradient[1]} 100%)`
                }}
              >
                <div className="flex items-center justify-between gap-x-3 gap-y-1">
                  <p className={`flex flex-wrap items-center gap-2 text-base font-semibold ${isDarkMode ? (theme.darkTextColor || 'text-white') : (theme.textColor || 'text-slate-900')}`}>
                    <span className="text-2xl leading-none">{weather.icon}</span>
                    <span>{weather.label}</span>
                    <span className={`text-sm font-normal ${isDarkMode ? (theme.darkSubtleTextColor || 'text-slate-100') : (theme.subtleTextColor || 'text-slate-500')}`}>{weather.description}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleAdjustWeather}
                    className={`flex-shrink-0 rounded-full border border-slate-200 bg-white/60 p-2 transition hover:bg-white dark:border-slate-600 dark:bg-slate-700/60 dark:hover:bg-slate-700 ${
                      isDarkMode 
                        ? (theme?.darkTextColor === 'text-white' ? 'text-white border-white/40 bg-white/20 hover:bg-white/30' : 'text-slate-200')
                        : (theme?.textColor === 'text-white' ? 'text-white border-white/40 bg-white/20 hover:bg-white/30' : 'text-slate-600')
                    }`}
                    aria-label="Change energy type"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
          )}
        </>
      )}

      <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-3 text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-600 dark:text-slate-700">
        <span className="dark:text-slate-900">What matters today</span>
        <span className="dark:text-slate-900">
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
                const isDragging = draggedItemId === item.id;
                const isDragOver = dragOverItemId === item.id;
                return (
                  <li
                    key={item.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedItemId(item.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', item.id);
                      // Add visual feedback
                      if (e.dataTransfer) {
                        e.dataTransfer.effectAllowed = 'move';
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (draggedItemId !== item.id) {
                        setDragOverItemId(item.id);
                      }
                    }}
                    onDragLeave={() => {
                      setDragOverItemId(null);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedId = e.dataTransfer.getData('text/plain');
                      if (draggedId && draggedId !== item.id) {
                        reorderFocusItems(draggedId, item.id);
                      }
                      setDraggedItemId(null);
                      setDragOverItemId(null);
                    }}
                    onDragEnd={() => {
                      setDraggedItemId(null);
                      setDragOverItemId(null);
                    }}
                    className={`flex items-start gap-3 rounded-2xl border px-3 py-2 text-sm transition-all duration-300 cursor-move ${
                      justCompleted === item.id
                        ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/20 scale-[1.02]'
                        : isDragging
                        ? 'opacity-50 scale-95 border-cyan-300 dark:border-cyan-500'
                        : isDragOver
                        ? 'border-cyan-400 bg-cyan-50/50 dark:border-cyan-500 dark:bg-cyan-900/20 scale-[1.02]'
                        : 'border-white/40 bg-white/70 dark:border-slate-600 dark:bg-slate-800 hover:border-cyan-200 dark:hover:border-cyan-500'
                    }`}
                  >
                    <div className="flex items-center text-slate-300 dark:text-slate-500 cursor-move" aria-hidden="true">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <button
                      type="button"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={() => {
                        // Add celebration feedback
                        setJustCompleted(item.id);
                        updateFocusItem(item.id, { completed: true });
                        // Clear the celebration state after animation
                        setTimeout(() => setJustCompleted(null), 600);
                      }}
                      className={`rounded-full border border-transparent p-1 transition-all duration-300 ${
                        justCompleted === item.id
                          ? 'scale-125 text-emerald-500 border-emerald-200 dark:border-emerald-700'
                          : 'text-slate-400 hover:border-cyan-200 hover:text-cyan-600 dark:text-slate-400 dark:hover:border-cyan-500 dark:hover:text-cyan-300'
                      }`}
                      aria-label="Mark focus as done"
                    >
                      {justCompleted === item.id ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <div className="flex-1 space-y-1">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold leading-tight text-slate-900 dark:text-slate-100">
                        <span className="text-lg leading-none">{getCategoryEmoji(item.categories[0]) || "•"}</span>
                        <span>{item.description}</span>
                      </p>
                      {anchorType && anchorDisplayValue && (
                        <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                          {anchorType} {anchorDisplayValue}
                        </p>
                      )}
                      {item.categories.length > 0 && (
                        <p className="text-[0.65rem] uppercase tracking-wide text-slate-400 dark:text-slate-300">
                          {item.categories.join(" • ")}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={() => router.push(`/focus?edit=${item.id}`)}
                        className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-cyan-200 hover:text-cyan-600 dark:hover:border-cyan-600 dark:hover:text-cyan-400"
                        aria-label="Edit focus"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={async () => {
                          console.log('🗑️ Delete button clicked');
                          console.log('Item to delete:', { id: item.id, description: item.description, plannedItemId: item.plannedItemId });
                          console.log('Current focusItems count:', focusItems.length);
                          console.log('User:', user?.id, 'Weather:', weather?.key);
                          
                          // Get remaining items before removing
                          const remainingItems = focusItems
                            .filter((i) => i.id !== item.id && !i.completed)
                            .map((i) => ({
                              id: i.id,
                              description: i.description,
                              categories: i.categories,
                              sortOrder: i.sortOrder,
                              plannedItemId: i.plannedItemId ?? null,
                              anchorType: i.anchorType || null,
                              anchorValue: i.anchorValue || null,
                              barrier: i.barrier || null,
                            }));
                          
                          console.log('Remaining items after deletion:', remainingItems.length, remainingItems);
                          
                          // Remove from context
                          removeFocusItem(item.id);
                          console.log('✅ Item removed from context');
                          
                          // Save the deletion to the database
                          if (user && weather) {
                            try {
                              const checkinDate = getTodayLocalDateString();
                              console.log('💾 Saving deletion to database...', { 
                                userId: user.id, 
                                checkinDate, 
                                remainingItemsCount: remainingItems.length,
                                itemHadPlannedId: !!item.plannedItemId
                              });
                              
                              await saveCheckinWithFocus({
                                userId: user.id,
                                internalWeather: weather,
                                forecastNote: forecastNote || undefined,
                                focusItems: remainingItems,
                                checkinDate,
                              });
                              
                              console.log('✅ Deletion saved successfully to database');
                              
                              // Clear localStorage to prevent stale data from reloading
                              clearLocalStorageForDate(checkinDate);
                              console.log('✅ localStorage cleared');
                            } catch (err) {
                              console.error('❌ Error saving deletion:', err);
                              // Note: Item is already removed from context, but save failed
                              // User can refresh to see the item again if needed
                            }
                          } else {
                            console.warn('⚠️ Cannot save deletion - missing user or weather', { hasUser: !!user, hasWeather: !!weather });
                          }
                        }}
                        className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:hover:border-rose-600 dark:hover:text-rose-400"
                        aria-label="Delete focus"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
                          onClick={async () => {
                            // Get remaining items before removing
                            const remainingItems = focusItems
                              .filter((i) => i.id !== item.id && !i.completed)
                              .map((i) => ({
                                id: i.id,
                                description: i.description,
                                categories: i.categories,
                                sortOrder: i.sortOrder,
                                plannedItemId: i.plannedItemId ?? null,
                                anchorType: i.anchorType || null,
                                anchorValue: i.anchorValue || null,
                                barrier: i.barrier || null,
                              }));
                            
                            // Remove from context
                            removeFocusItem(item.id);
                            
                            // Save the deletion to the database
                            if (user && weather) {
                              try {
                                const checkinDate = getTodayLocalDateString();
                                await saveCheckinWithFocus({
                                  userId: user.id,
                                  internalWeather: weather,
                                  forecastNote: forecastNote || undefined,
                                  focusItems: remainingItems,
                                  checkinDate,
                                });
                                
                                // Clear localStorage to prevent stale data from reloading
                                clearLocalStorageForDate(checkinDate);
                              } catch (err) {
                                console.error('Error saving deletion:', err);
                              }
                            }
                          }}
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

          {activeFocusItems.length >= MAX_FOCUS_ITEMS ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-center text-sm text-amber-800 dark:border-amber-700/50 dark:bg-amber-900/20 dark:text-amber-200">
              <p className="font-medium">You already have enough on your hands</p>
              <p className="mt-1 text-xs">Focus on your current things or remove some for another day</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/focus")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600/50 dark:bg-slate-700/40 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Plus className="h-4 w-4" />
              Add Focus
            </button>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/40 bg-white/70 p-4 text-center text-sm text-slate-600 dark:border-slate-700/40 dark:bg-slate-800/50 dark:text-slate-400">
          <p>No items yet. Add focus item when you&rsquo;re ready.</p>
          <button
            type="button"
            onClick={() => router.push("/focus")}
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white dark:border-slate-600/60 dark:bg-slate-700/40 dark:text-slate-100"
          >
            <Plus className="h-4 w-4" />
            Add Focus
          </button>
        </div>
      )}
    </section>
    );
  };

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
          <div className="flex items-center gap-3 pt-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700"></div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Explore</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700"></div>
          </div>
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
