"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCheckIn, MAX_FOCUS_ITEMS, type TaskAnchorType } from "@/lib/checkin-context";
import { CATEGORY_OPTIONS, getCategoryEmoji } from "@/lib/categories";
import { getBarrierTypes, saveCheckinWithFocus, getCheckinByDate, type BarrierType } from "@/lib/supabase";
import { anchorValueForDisplay, cleanAnchorInput } from "@/lib/anchors";
import { hasBarrierSelection } from "@/lib/barrier-helpers";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getTodayLocalDateString } from "@/lib/date-utils";
import { Pencil } from "lucide-react";

const whileSuggestions = [
  "while watching TV",
  "while listening to music",
  "while listening to a podcast",
  "while listening to an audiobook",
  "while waiting for laundry",
  "while talking to a friend",
];
const beforeSuggestions = [
  "before opening email",
  "before the kids wake up",
  "before leaving for work",
  "before scrolling social media",
];
const afterSuggestions = [
  "after lunch",
  "after a shower",
  "after walking the dog",
  "after dinner cleanup",
];

const anchorOptions: Array<{ type: TaskAnchorType; label: string }> = [
  { type: "at", label: "At…" },
  { type: "while", label: "While…" },
  { type: "before", label: "Before…" },
  { type: "after", label: "After…" },
];

const anchorTextLabels: Record<Exclude<TaskAnchorType, "at">, string> = {
  while: "Pair it with",
  before: "Before what?",
  after: "After what?",
};

const anchorPlaceholders: Record<Exclude<TaskAnchorType, "at">, string> = {
  while: "listening to music...",
  before: "the kids wake up...",
  after: "dinner cleanup...",
};

const anchorSuggestionMap: Partial<Record<TaskAnchorType, string[]>> = {
  while: whileSuggestions,
  before: beforeSuggestions,
  after: afterSuggestions,
};

type BarrierGroupDefinition = {
  title: string;
  slugOrder: string[];
  description?: string;
};

type BarrierGroup = {
  title: string;
  description?: string;
  options: BarrierType[];
};

const barrierGroupDefinitions: BarrierGroupDefinition[] = [
  {
    title: "Energy & Motivation",
    slugOrder: ["low-energy", "no-motivation", "decision-fatigue"],
    description: "Body and brain fuel checks",
  },
  {
    title: "Focus & Overwhelm",
    slugOrder: ["stuck-frozen", "cant-focus", "overwhelm"],
    description: "Getting started or staying with it",
  },
  {
    title: "Time & Avoidance",
    slugOrder: ["no-time", "perfection-loop", "keep-avoiding-it"],
    description: "Schedules, loops, and slippery tasks",
  },
  {
    title: "Emotional & Relational",
    slugOrder: ["shame-guilt", "feeling-alone"],
    description: "Feelings and people dynamics",
  },
];

const barrierSlugAliases: Record<string, string> = {
  overwhelmed: "overwhelm",
  focus: "cant-focus",
  "time-pressure": "no-time",
  perfectionism: "perfection-loop",
};

function createBarrierSlugMap(barriers: BarrierType[]): Record<string, BarrierType> {
  const map = barriers.reduce<Record<string, BarrierType>>((acc, barrier) => {
    const slug = barrier.slug?.toLowerCase();
    if (slug) {
      acc[slug] = barrier;
    }
    return acc;
  }, {});

  Object.entries(barrierSlugAliases).forEach(([alias, canonical]) => {
    const aliasSlug = alias.toLowerCase();
    const canonicalSlug = canonical.toLowerCase();
    if (map[aliasSlug] && !map[canonicalSlug]) {
      map[canonicalSlug] = map[aliasSlug];
    } else if (!map[aliasSlug] && map[canonicalSlug]) {
      map[aliasSlug] = map[canonicalSlug];
    }
  });

  return map;
}

function buildBarrierGroups(
  barrierTypes: BarrierType[],
  slugMap: Record<string, BarrierType>
): BarrierGroup[] {
  if (!barrierTypes.length) return [];

  const used = new Set<string>();
  const groups: BarrierGroup[] = [];

  for (const definition of barrierGroupDefinitions) {
    const options = definition.slugOrder
      .map((slug) => {
        const key = slug.toLowerCase();
        const barrier = slugMap[key];
        if (barrier) {
          used.add(key);
          return barrier;
        }
        return null;
      })
      .filter(Boolean) as BarrierType[];

    if (options.length) {
      groups.push({
        title: definition.title,
        description: definition.description,
        options,
      });
    }
  }

  const remaining = barrierTypes
    .filter((barrier) => {
      const slug = barrier.slug?.toLowerCase();
      return slug ? !used.has(slug) : false;
    })
    .sort((a, b) => (a.label ?? "").localeCompare(b.label ?? ""));

  if (remaining.length) {
    groups.push({
      title: "More barriers",
      description: "Other things that might get in the way",
      options: remaining,
    });
  }

  return groups;
}

type BarrierCompanionMeta = {
  label: string;
  emoji: string;
};

const barrierCompanionOverrides: Record<string, BarrierCompanionMeta> = {
  "low-energy": { label: "Low Energy", emoji: "🪫" },
  "no-motivation": { label: "Low Motivation", emoji: "😴" },
  "decision-fatigue": { label: "Decision Fatigue", emoji: "💭" },
  "stuck-frozen": { label: "Stuck / Frozen", emoji: "🧊" },
  "cant-focus": { label: "Can't Stay Focused", emoji: "🎯" },
  overwhelm: { label: "Overwhelmed", emoji: "🌀" },
  "no-time": { label: "No Time", emoji: "⏰" },
  "keep-avoiding-it": { label: "Keep Avoiding It", emoji: "📅" },
  "perfection-loop": { label: "Perfection Loop", emoji: "🔄" },
  "shame-guilt": { label: "Shame / Guilt", emoji: "💔" },
  "waiting-on-someone": { label: "Waiting on Someone", emoji: "💬" },
  "feeling-alone": { label: "Feeling Alone", emoji: "🧍" },
};

type BarrierDisplayMeta = {
  label: string;
  emoji: string;
  helperText?: string;
};

function getBarrierDisplayMeta(barrier: BarrierType): BarrierDisplayMeta {
  const slug = barrier.slug?.toLowerCase() ?? "";
  const override = barrierCompanionOverrides[slug];
  const label = override?.label ?? barrier.label ?? "Barrier";
  const emoji = override?.emoji ?? barrier.icon ?? "🌀";
  const helperText = barrier.description ?? undefined;
  return { label, emoji, helperText };
}

const evergreenFocusIdeas = [
  "Send the email you keep delaying",
  "Stretch between calls",
  "Reset the kitchen table",
  "Do a two-minute tidy",
  "Step outside for fresh air",
  "Switch the laundry",
  "Clear your inbox backlog",
  "Prep tomorrow's clothes",
  "Refill your water bottle",
  "Brain dump everything swirling",
  "Text the doctor or therapist",
  "Review your finances quickly",
];

const weekdayFocusIdeas: Record<number, string[]> = {
  0: ["Plan your week", "Prep breakfasts", "Lay out meds for the week"],
  1: ["Sketch the week's top 3", "Check the calendar for surprises", "Refresh your task list"],
  2: ["Batch similar errands", "Follow up on pending messages"],
  3: ["Tackle a midweek tidy", "Do a quick calendar audit"],
  4: ["Prep for tomorrow's meetings", "Send end-of-week updates"],
  5: ["Reset shared spaces", "Do a laundry run", "Pay upcoming bills"],
  6: ["Plan something restorative", "Tidy up before the week kicks off"],
};

type FocusTimeBucket = "morning" | "afternoon" | "evening" | "night";

const timeOfDayFocusIdeas: Record<FocusTimeBucket, string[]> = {
  morning: ["Take meds + water", "Review today's calendar", "Light stretch before screens"],
  afternoon: ["Step outside for five minutes", "Knock out one admin task", "Tidy your workspace"],
  evening: ["Lay out tomorrow's clothes", "Run the dishwasher", "Write tomorrow's top 3"],
  night: ["Put phone on the charger", "Set the coffee maker", "Do a quick gratitude jot"],
};

function getFocusTimeBucket(date: Date): FocusTimeBucket {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

function buildFocusPlaceholderText(date = new Date(), suggestionCount = 3): string {
  const dayIdeas = weekdayFocusIdeas[date.getDay()] ?? [];
  const bucketIdeas = timeOfDayFocusIdeas[getFocusTimeBucket(date)];
  const pool = Array.from(new Set([...dayIdeas, ...bucketIdeas, ...evergreenFocusIdeas]));
  if (pool.length === 0) return "Add what matters most right now...";

  let seed = date.getDate() + date.getMonth() * 31 + date.getDay() * 7 + date.getHours();
  if (seed === 0) seed = 1;

  const picks: string[] = [];
  const workingPool = [...pool];
  for (let i = 0; i < suggestionCount && workingPool.length > 0; i += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    const index = seed % workingPool.length;
    picks.push(workingPool.splice(index, 1)[0]);
  }

  return `${picks.join(", ")}...`;
}

export default function FocusScreen() {
  const router = useRouter();
  const {
    weather,
    forecastNote,
    focusItems,
    checkinDate,
    addFocusItem,
    removeFocusItem,
    updateFocusItem,
    setBarrierForFocusItem,
    setAnchorForFocusItem,
    loadFocusItemsFromCheckin,
    clearFocusItems,
    validationError,
    clearValidationError,
    clearLocalStorageForDate,
  } = useCheckIn();
  const { user } = useSupabaseUser();
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedFocusItems, setSavedFocusItems] = useState<typeof focusItems>([]);
  const [loadedSavedItems, setLoadedSavedItems] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const focusPlaceholder = useMemo(() => buildFocusPlaceholderText(new Date(), isMobile ? 2 : 3), [isMobile]);

  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

  // Load saved focus items from database (separate from draft items)
  // Only load if we don't have draft items (to avoid confusion)
  useEffect(() => {
    if (!user?.id || loadedSavedItems || focusItems.length > 0) return;
    
    const loadSavedItems = async () => {
      try {
        const today = checkinDate || getTodayLocalDateString();
        const checkin = await getCheckinByDate(user.id, today);
        
        if (checkin && checkin.focus_items && checkin.focus_items.length > 0) {
          const savedItems = checkin.focus_items.map((item) => {
            const firstBarrier = item.focus_barriers && item.focus_barriers.length > 0 
              ? item.focus_barriers[0] 
              : null;

            return {
              id: item.id,
              description: item.description,
              categories: item.categories || [],
              sortOrder: item.sort_order,
              plannedItemId: null,
              barrier: firstBarrier
                ? {
                    barrierTypeId: firstBarrier.barrier_type_id ?? null,
                    barrierTypeSlug: firstBarrier.barrier_types?.slug ?? null,
                    custom: firstBarrier.custom_barrier ?? null,
                  }
                : null,
              anchorType: (item.anchor_type as typeof focusItems[0]["anchorType"]) ?? null,
              anchorValue: item.anchor_value ?? null,
              completed: false,
            };
          });
          
          setSavedFocusItems(savedItems);
        }
      } catch (err) {
        console.error('Error loading saved focus items:', err);
      } finally {
        setLoadedSavedItems(true);
      }
    };
    
    loadSavedItems();
  }, [user?.id, checkinDate, loadedSavedItems, focusItems.length]);

  const barrierBySlug = useMemo(() => createBarrierSlugMap(barrierTypes), [barrierTypes]);
  const barrierGroups = useMemo(
    () => buildBarrierGroups(barrierTypes, barrierBySlug),
    [barrierTypes, barrierBySlug]
  );

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleAdd = () => {
    if (!text.trim()) return;
    addFocusItem(text, tags);
    // Only clear if no validation error occurred
    if (!validationError) {
      setText("");
      setTags([]);
    }
  };

  // Clear validation error when user starts typing
  useEffect(() => {
    if (validationError && text.trim()) {
      clearValidationError();
    }
  }, [text, validationError, clearValidationError]);

  const activeFocusItems = useMemo(() => focusItems.filter((item) => !item.completed), [focusItems]);
  const completedFocusItems = useMemo(() => focusItems.filter((item) => item.completed), [focusItems]);
  const activeCount = useMemo(() => activeFocusItems.length, [activeFocusItems.length]);
  const savedActiveItems = useMemo(() => savedFocusItems.filter((item) => !item.completed), [savedFocusItems]);
  
  // Function to load saved items into draft for editing
  const handleEditSavedItems = () => {
    // Load saved items into the draft context
    loadFocusItemsFromCheckin(savedFocusItems);
    // Clear saved items display (they're now in draft)
    setSavedFocusItems([]);
  };
  const barriersComplete = useMemo(() => {
    return Boolean(weather) && activeFocusItems.length > 0 && activeFocusItems.every((item) => hasBarrierSelection(item.barrier));
  }, [weather, activeFocusItems]);

  return (
    <main className="min-h-screen px-4 pb-16 pt-6 text-slate-900 dark:text-slate-100">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-100"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Focus level</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">What matters &amp; what feels hard?</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Add today&rsquo;s focus points, then note what feels hard (anchors optional).
            </p>
            {!weather && (
              <p className="mt-2 text-xs font-semibold text-amber-600 dark:text-amber-300">
                Set today&rsquo;s energy first so supports match the vibe.
              </p>
            )}
          </div>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200" htmlFor="focus-text">
                Focus item
              </label>
              <textarea
                id="focus-text"
                rows={2}
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
                placeholder={focusPlaceholder}
                className={`mt-2 w-full rounded-2xl border px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 dark:text-slate-100 dark:placeholder:text-slate-400 ${
                  validationError 
                    ? 'border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-rose-100 dark:border-rose-500/70 dark:bg-rose-500/10 dark:focus:border-rose-400 dark:focus:ring-rose-900/40' 
                    : 'border-white/40 bg-white/80 focus:border-cyan-300 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/60 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40'
                }`}
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "focus-error" : undefined}
              />
              {validationError && (
                <p id="focus-error" className="mt-2 text-sm text-rose-600 dark:text-rose-300" role="alert">
                  {validationError}
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Category tags</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {CATEGORY_OPTIONS.map((option) => {
                  const active = tags.includes(option.label);
                  return (
                    <button
                      type="button"
                      key={option.label}
                      onClick={() => toggleTag(option.label)}
                      className={`rounded-full px-4 py-1.5 font-medium transition ${
                        active
                          ? "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/30 dark:text-cyan-100"
                          : "bg-white/70 text-slate-600 hover:bg-white dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800"
                      }`}
                    >
                      <span className="mr-1">{option.emoji}</span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!text.trim() || activeCount >= MAX_FOCUS_ITEMS}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-200 bg-white/80 px-4 py-3 font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900/70 dark:text-cyan-200 dark:hover:bg-slate-800"
            >
              <Plus className="h-5 w-5" />
              Add focus
              <span className="text-sm text-cyan-500 dark:text-cyan-400">{activeCount}/{MAX_FOCUS_ITEMS}</span>
            </button>
          </div>
        </section>

        {/* Show saved focus items separately from draft items */}
        {savedActiveItems.length > 0 && focusItems.length === 0 && (
          <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Saved focus items</h2>
              <button
                type="button"
                onClick={handleEditSavedItems}
                className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>
            <ul className="space-y-2">
              {savedActiveItems
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((item) => {
                  const anchorDisplayValue = anchorValueForDisplay(item.anchorType, item.anchorValue);
                  const anchorType = item.anchorType && anchorDisplayValue ? item.anchorType : null;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                    >
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
                    </li>
                  );
                })}
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              These items are saved. Click "Edit" to modify them or add new ones below.
            </p>
          </section>
        )}

        {focusItems.length > 0 && (
          <section className="space-y-4">
            {activeFocusItems.length > 0 ? (
              <div className="space-y-4">
                {activeFocusItems
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => {
                    const selectedSlug = item.barrier?.barrierTypeSlug || "";
                    const normalizedSelectedSlug = selectedSlug.toLowerCase();
                    const fallbackBarrier = selectedSlug ? barrierBySlug[normalizedSelectedSlug] : null;
                    const selectedBarrierId = item.barrier?.barrierTypeId || fallbackBarrier?.id || null;
                    const resolvedBarrierSlug = fallbackBarrier?.slug ?? (selectedSlug || null);
                    const customBarrier = item.barrier?.custom || "";
                    const handleBarrierSelection = (barrier: BarrierType | null) => {
                      if (!barrier) {
                        setBarrierForFocusItem(item.id, {
                          barrierTypeSlug: null,
                          barrierTypeId: null,
                          custom: customBarrier,
                        });
                        return;
                      }
                      setBarrierForFocusItem(item.id, {
                        barrierTypeSlug: barrier.slug ?? null,
                        barrierTypeId: barrier.id ?? null,
                        custom: customBarrier,
                      });
                    };
                    const isCurrentBarrier = (barrier: BarrierType) => {
                      const slug = barrier.slug?.toLowerCase();
                      if (slug && normalizedSelectedSlug) {
                        return slug === normalizedSelectedSlug;
                      }
                      if (barrier.id && selectedBarrierId) {
                        return barrier.id === selectedBarrierId;
                      }
                      return false;
                    };
                    const toggleBarrierSelection = (barrier: BarrierType) => {
                      if (isCurrentBarrier(barrier)) {
                        handleBarrierSelection(null);
                      } else {
                        handleBarrierSelection(barrier);
                      }
                    };
                    const anchorSelected = item.anchorType;
                    const anchorValue = item.anchorValue || "";
                    const contextualType = anchorSelected && anchorSelected !== "at" ? anchorSelected : null;
                    const contextLabel = contextualType ? anchorTextLabels[contextualType] : "";
                    const contextPlaceholder = contextualType ? anchorPlaceholders[contextualType] : "";
                    const contextSuggestions = contextualType ? anchorSuggestionMap[contextualType] ?? [] : [];
                    const anchorDisplayValue = anchorValueForDisplay(anchorSelected, anchorValue);
                    const anchorSummaryType = anchorSelected && anchorDisplayValue ? anchorSelected : null;

                    return (
                      <div
                        key={item.id}
                        className={`space-y-4 rounded-3xl border p-5 shadow-sm transition-all duration-300 ${
                          justCompleted === item.id
                            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-700 dark:bg-emerald-900/20 scale-[1.02]'
                            : 'border-white/30 bg-white/80 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
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
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Circle className="h-5 w-5" />
                            )}
                          </button>
                          <div className="flex-1">
                            <p className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                              {item.categories[0] && (
                                <span className="text-xl leading-none">{getCategoryEmoji(item.categories[0])}</span>
                              )}
                              <span>{item.description}</span>
                            </p>
                            {item.categories.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                {item.categories.map((category) => (
                                  <span
                                    key={category}
                                    className="rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-100"
                                  >
                                    {getCategoryEmoji(category)} {category}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFocusItem(item.id)}
                            className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                            aria-label="Delete focus"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                            What feels hard? (needed before the next step)
                          </label>
                          <div className="space-y-3">
                            {barrierGroups.length > 0 ? (
                              barrierGroups.map((group) => (
                                <div
                                  key={group.title}
                                  className="rounded-2xl border border-white/30 bg-white/70 p-3 dark:border-slate-800 dark:bg-slate-900/40"
                                >
                                  <div className="flex items-baseline justify-between gap-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                      {group.title}
                                    </p>
                                    {group.description && (
                                      <p className="text-[11px] text-slate-400 dark:text-slate-400">{group.description}</p>
                                    )}
                                  </div>
                                  <div className="mt-2 space-y-2">
                                    {group.options.map((barrier) => {
                                      const meta = getBarrierDisplayMeta(barrier);
                                      const active = isCurrentBarrier(barrier);
                                      return (
                                        <button
                                          type="button"
                                          key={barrier.id ?? barrier.slug ?? meta.label}
                                          onClick={() => toggleBarrierSelection(barrier)}
                                          aria-pressed={active}
                                          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                                            active
                                              ? "border-cyan-400 bg-cyan-50/80 shadow-sm dark:border-cyan-500/60 dark:bg-cyan-500/10"
                                              : "border-white/40 bg-white/70 hover:border-cyan-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-cyan-500/40"
                                          }`}
                                        >
                                          <div className="flex items-start gap-3">
                                            <span className="text-xl leading-none">{meta.emoji}</span>
                                            <div className="flex-1">
                                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                {meta.label}
                                              </p>
                                              {meta.helperText && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{meta.helperText}</p>
                                              )}
                                            </div>
                                            {active && (
                                              <CheckCircle2 className="h-4 w-4 text-cyan-500 dark:text-cyan-400" aria-hidden="true" />
                                            )}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Loading barrier ideas from the ADHD First Aid Kit…
                              </p>
                            )}
                          </div>
                          <textarea
                            value={customBarrier}
                            onChange={(event) =>
                              setBarrierForFocusItem(item.id, {
                                barrierTypeSlug: resolvedBarrierSlug,
                                barrierTypeId: selectedBarrierId,
                                custom: event.target.value,
                              })
                            }
                            placeholder="Add your own words about what feels hard..."
                            className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                          />
                        </div>

                        <div className="space-y-3 rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/50 px-4 py-4 dark:border-cyan-900/40 dark:bg-cyan-900/10">
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Anchor it to something? (optional)
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              If it helps, link it to a time or rhythm so it feels lighter.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm">
                            {anchorOptions.map(({ type, label }) => {
                              const active = anchorSelected === type;
                              return (
                                <button
                                  type="button"
                                  key={type}
                                  onClick={() => {
                                    if (active) {
                                      setAnchorForFocusItem(item.id, null);
                                    } else {
                                      // Set current time as default when "at" is selected
                                      const defaultValue = type === "at" 
                                        ? new Date().toTimeString().slice(0, 5) // HH:MM format
                                        : "";
                                      setAnchorForFocusItem(item.id, {
                                        anchorType: type,
                                        anchorValue: defaultValue,
                                      });
                                    }
                                  }}
                                  className={`rounded-full px-4 py-1.5 font-semibold transition ${
                                    active
                                      ? "bg-cyan-600 text-white shadow dark:bg-cyan-500 dark:text-slate-900"
                                      : "bg-white text-slate-600 hover:bg-cyan-100 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          {anchorSelected === "at" && (
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Pick a time
                              </label>
                              <input
                                type="time"
                                value={anchorValue}
                                onChange={(event) =>
                                  setAnchorForFocusItem(item.id, {
                                    anchorType: "at",
                                    anchorValue: event.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-cyan-600 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                                placeholder="Select time"
                              />
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Tap to choose a time
                              </p>
                            </div>
                          )}

                          {contextualType && (
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {contextLabel}
                              </label>
                              <input
                                type="text"
                                value={anchorValue}
                                onChange={(event) =>
                                  setAnchorForFocusItem(item.id, {
                                    anchorType: contextualType,
                                    anchorValue: cleanAnchorInput(contextualType, event.target.value),
                                  })
                                }
                                placeholder={contextPlaceholder}
                                className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                              />
                              {contextSuggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {contextSuggestions.map((suggestion) => (
                                    <button
                                      type="button"
                                      key={`${item.id}-${suggestion}`}
                                      onClick={() =>
                                        setAnchorForFocusItem(item.id, {
                                          anchorType: contextualType,
                                          anchorValue: cleanAnchorInput(contextualType, suggestion),
                                        })
                                      }
                                      className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-200"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {anchorSummaryType && anchorDisplayValue && (
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              <span>{item.description}</span>{" "}
                              <span className="text-cyan-700 dark:text-cyan-400">{anchorSummaryType}</span>{" "}
                              <span>{anchorDisplayValue}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                All active items are done. Add more above if something new pops up.
              </p>
            )}

            {completedFocusItems.length > 0 && (
              <div className="space-y-2 border-t border-white/40 pt-4 dark:border-white/10">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Completed</p>
                <div className="space-y-2">
                  {completedFocusItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3 dark:border-emerald-500/40 dark:bg-emerald-500/10"
                    >
                      <button
                        type="button"
                        onClick={() => updateFocusItem(item.id, { completed: false })}
                        className="rounded-full border border-transparent p-1 text-emerald-500 transition hover:border-emerald-200 dark:text-emerald-300 dark:hover:border-emerald-400/50"
                        aria-label="Mark focus as not done"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <p className="flex-1 text-sm font-semibold text-slate-500 line-through dark:text-slate-400">
                        {item.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFocusItem(item.id)}
                        className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                        aria-label="Delete completed focus"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={async () => {
            if (!barriersComplete || !user || !weather) return;
            
            setSaving(true);
            setSaveError(null);
            
            try {
              const activeItems = focusItems.filter((item) => !item.completed);
              const date = checkinDate || getTodayLocalDateString();
              
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
                checkinDate: date,
              });
              
              // Clear localStorage after successful save (database is now source of truth)
              clearLocalStorageForDate(date);
              
              // Clear draft focus items from context (they're now saved in database)
              clearFocusItems();
              // Reset loaded flag so saved items will reload when user returns to this page
              setLoadedSavedItems(false);
              
              // Navigate to gentle support page
              router.push("/gentle-support");
            } catch (err) {
              console.error('Error saving check-in:', err);
              const errorMessage = err instanceof Error ? err.message : 'Failed to save check-in';
              setSaveError(errorMessage);
            } finally {
              setSaving(false);
            }
          }}
          disabled={!barriersComplete || saving || !user || !weather}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-cyan-500 dark:text-slate-900 dark:hover:bg-cyan-400"
        >
          {saving ? "Saving..." : "Next: Gentle Support"}
        </button>
        {saveError && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:bg-rose-900/30 dark:text-rose-300">
            {saveError}
          </p>
        )}
        {!barriersComplete && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            Set today&rsquo;s energy and add what feels hard for every focus to continue.
          </p>
        )}
      </div>
    </main>
  );
}
