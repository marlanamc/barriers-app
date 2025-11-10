"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { updatePlannedItem, getPlannedItems, type PlannedItemWithBarrier } from "@/lib/supabase";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { CATEGORY_OPTIONS, getCategoryEmoji } from "@/lib/categories";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";
import { anchorValueForDisplay, cleanAnchorInput } from "@/lib/anchors";
import type { TaskAnchorType } from "@/lib/checkin-context";

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

export default function EditPlannedItemPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { user } = useSupabaseUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plannedItem, setPlannedItem] = useState<PlannedItemWithBarrier | null>(null);
  
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [recurrenceType, setRecurrenceType] = useState<"once" | "daily" | "weekly" | "monthly">("once");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState<string | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [selectedBarrierId, setSelectedBarrierId] = useState<string | null>(null);
  const [customBarrier, setCustomBarrier] = useState("");
  const [anchorType, setAnchorType] = useState<TaskAnchorType | null>(null);
  const [anchorValue, setAnchorValue] = useState("");

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

  useEffect(() => {
    if (!user?.id || !itemId) return;

    const loadItem = async () => {
      try {
        const items = await getPlannedItems(user.id);
        const item = items.find((i) => i.id === itemId);
        
        if (!item) {
          setError('Planned item not found');
          setLoading(false);
          return;
        }

        setPlannedItem(item);
        setDescription(item.description);
        setCategories(item.categories || []);
        setRecurrenceType(item.recurrence_type as "once" | "daily" | "weekly" | "monthly");
        setStartDate(item.start_date);
        setEndDate(item.end_date || null);
        setHasEndDate(!!item.end_date);
        setRecurrenceDays(item.recurrence_days || []);
        setSelectedBarrierId(item.barrier_type_id || null);
        setCustomBarrier(item.custom_barrier || "");
        setAnchorType((item.anchor_type as TaskAnchorType) || null);
        setAnchorValue(item.anchor_value || "");
      } catch (err) {
        console.error('Error loading planned item:', err);
        setError('Failed to load planned item');
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [user?.id, itemId]);

  const toggleTag = (tag: string) => {
    setCategories((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const toggleDay = (dayIndex: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const handleEndDateToggle = (checked: boolean) => {
    setHasEndDate(checked);
    if (!checked) {
      setEndDate(null);
    }
  };

  const barrierBySlug = createBarrierSlugMap(barrierTypes);
  const barrierGroups = buildBarrierGroups(barrierTypes, barrierBySlug);
  const selectedBarrier = selectedBarrierId
    ? barrierTypes.find((b) => b.id === selectedBarrierId)
    : null;

  const handleSave = async () => {
    if (!user || !description.trim()) {
      setError('Description is required');
      return;
    }

    if (recurrenceType === 'weekly' && recurrenceDays.length === 0) {
      setError('Please select at least one day of the week');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await updatePlannedItem(itemId, {
        description: description.trim(),
        categories,
        recurrence_type: recurrenceType,
        start_date: startDate,
        end_date: hasEndDate ? endDate : null,
        recurrence_days: recurrenceType === 'weekly' ? recurrenceDays : null,
        barrier_type_id: selectedBarrierId,
        custom_barrier: customBarrier.trim() || null,
        anchor_type: anchorType,
        anchor_value: anchorValue.trim() || null,
      });

      router.push('/plan-ahead');
    } catch (err) {
      console.error('Error updating planned item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update planned item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-slate-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (error && !plannedItem) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-6">
        <div className="mx-auto max-w-3xl">
          <p className="text-rose-600">{error}</p>
          <Link href="/plan-ahead" className="mt-4 inline-block text-emerald-600 hover:underline">
            ← Back to Plan Ahead
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/plan-ahead"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-600">Plan Ahead</p>
            <h1 className="text-2xl font-bold text-slate-900">Edit Planned Item</h1>
          </div>
        </header>

        <section className="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur">
          {/* Description */}
          <div>
            <label className="text-sm font-semibold text-slate-700" htmlFor="description">
              Focus item
            </label>
            <textarea
              id="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What do you want to focus on?"
              className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Categories */}
          <div>
            <p className="text-sm font-semibold text-slate-700">Category tags</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {CATEGORY_OPTIONS.map((option) => {
                const active = categories.includes(option.label);
                return (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => toggleTag(option.label)}
                    className={`rounded-full px-4 py-1.5 font-medium transition ${
                      active
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-white/70 text-slate-600 hover:bg-white"
                    }`}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recurrence Type */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">Schedule type</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['once', 'daily', 'weekly', 'monthly'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setRecurrenceType(type)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    recurrenceType === type
                      ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200'
                      : 'border-white/40 bg-white/70 hover:border-emerald-200'
                  }`}
                >
                  <p className="font-semibold text-slate-900 capitalize">{type}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700" htmlFor="start-date">
              {recurrenceType === 'once' ? 'Date' : 'Start date'}
            </label>
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Day Selection for Weekly */}
          {recurrenceType === 'weekly' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Which days?</label>
              <div className="flex flex-wrap gap-2">
                {dayNames.map((day, index) => {
                  const isSelected = recurrenceDays.includes(index);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(index)}
                      className={`min-w-[60px] rounded-full px-4 py-2 font-medium transition ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-white/70 text-slate-600 hover:bg-white'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* End Date Option */}
          {recurrenceType !== 'once' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  id="has-end-date"
                  type="checkbox"
                  checked={hasEndDate}
                  onChange={(e) => handleEndDateToggle(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="has-end-date" className="text-sm font-semibold text-slate-700">
                  Set an end date
                </label>
              </div>

              {hasEndDate && (
                <input
                  type="date"
                  value={endDate || ''}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              )}
            </div>
          )}

          {/* Barriers */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              What feels hard? (optional)
            </label>
            <div className="space-y-3">
              {barrierGroups.map((group) => (
                <div
                  key={group.title}
                  className="rounded-2xl border border-white/30 bg-white/70 p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {group.title}
                  </p>
                  <div className="mt-2 space-y-2">
                    {group.options.map((barrier) => {
                      const meta = getBarrierDisplayMeta(barrier);
                      const active = selectedBarrierId === barrier.id;
                      return (
                        <button
                          type="button"
                          key={barrier.id}
                          onClick={() => setSelectedBarrierId(active ? null : barrier.id || null)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                            active
                              ? "border-emerald-400 bg-emerald-50/80"
                              : "border-white/40 bg-white/70 hover:border-emerald-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xl leading-none">{meta.emoji}</span>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                              {meta.helperText && (
                                <p className="text-xs text-slate-500">{meta.helperText}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <textarea
              value={customBarrier}
              onChange={(e) => setCustomBarrier(e.target.value)}
              placeholder="Add your own words about what feels hard..."
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Anchors */}
          <div className="space-y-3 rounded-2xl border border-dashed border-emerald-100 bg-emerald-50/50 px-4 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Anchor it to something? (optional)</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              {anchorOptions.map(({ type, label }) => {
                const active = anchorType === type;
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => {
                      if (active) {
                        setAnchorType(null);
                        setAnchorValue("");
                      } else {
                        setAnchorType(type);
                        if (type === "at") {
                          setAnchorValue(new Date().toTimeString().slice(0, 5));
                        } else {
                          setAnchorValue("");
                        }
                      }
                    }}
                    className={`rounded-full px-4 py-1.5 font-semibold transition ${
                      active
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-slate-600 hover:bg-emerald-100"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {anchorType === "at" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pick a time
                </label>
                <input
                  type="time"
                  value={anchorValue}
                  onChange={(e) => setAnchorValue(e.target.value)}
                  className="w-full rounded-2xl border-2 border-emerald-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            )}

            {anchorType && anchorType !== "at" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {anchorTextLabels[anchorType]}
                </label>
                <input
                  type="text"
                  value={anchorValue}
                  onChange={(e) => setAnchorValue(cleanAnchorInput(anchorType, e.target.value))}
                  placeholder={anchorPlaceholders[anchorType]}
                  className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
                {anchorSuggestionMap[anchorType] && (
                  <div className="flex flex-wrap gap-2 text-xs">
                    {anchorSuggestionMap[anchorType]!.map((suggestion) => (
                      <button
                        type="button"
                        key={suggestion}
                        onClick={() => setAnchorValue(cleanAnchorInput(anchorType, suggestion))}
                        className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !description.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Check className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </section>
      </div>
    </main>
  );
}

