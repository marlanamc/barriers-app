"use client";

import { useEffect, useState, useMemo } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlanning } from "@/lib/planning-context";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";
import { buildAnchorPhrase, cleanAnchorInput } from "@/lib/anchors";
import { getCategoryEmoji } from "@/lib/categories";
import type { TaskAnchorType } from "@/lib/planning-context";

// Barrier group definitions matching focus page
type BarrierGroupDefinition = {
  title: string;
  slugOrder: string[];
  description: string;
};

type BarrierGroup = {
  title: string;
  description: string;
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

const anchorOptions: Array<{ type: TaskAnchorType; label: string }> = [
  { type: "at", label: "At…" },
  { type: "while", label: "While…" },
  { type: "before", label: "Before…" },
  { type: "after", label: "After…" },
];

const anchorPlaceholders: Record<Exclude<TaskAnchorType, "at">, string> = {
  while: "listening to music...",
  before: "the kids wake up...",
  after: "dinner cleanup...",
};

export default function PlanAheadBarriersPage() {
  const router = useRouter();
  const { plannedItems, setBarrierForItem, setAnchorForItem } = usePlanning();

  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [selectedBarrier, setSelectedBarrier] = useState<{ id: string; slug: string } | null>(null);
  const [customBarrier, setCustomBarrier] = useState("");
  const [selectedAnchorType, setSelectedAnchorType] = useState<TaskAnchorType | null>(null);
  const [anchorTime, setAnchorTime] = useState("");
  const [anchorText, setAnchorText] = useState("");
  const [justSelectedBarrier, setJustSelectedBarrier] = useState<string | null>(null);

  const currentItem = plannedItems[currentItemIndex];
  const isLastItem = currentItemIndex === plannedItems.length - 1;

  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

  const barrierBySlug = useMemo(() => createBarrierSlugMap(barrierTypes), [barrierTypes]);
  const barrierGroups = useMemo(
    () => buildBarrierGroups(barrierTypes, barrierBySlug),
    [barrierTypes, barrierBySlug]
  );

  // Get selected barrier info for summary
  const selectedBarrierInfo = useMemo(() => {
    if (!selectedBarrier) return null;
    const barrier = barrierTypes.find((b) => b.id === selectedBarrier.id);
    if (!barrier) return null;
    const meta = getBarrierDisplayMeta(barrier);
    const group = barrierGroups.find((g) => g.options.some((o) => o.id === barrier.id));
    return { barrier, meta, groupTitle: group?.title };
  }, [selectedBarrier, barrierTypes, barrierGroups]);

  // Load existing data when changing items
  useEffect(() => {
    if (!currentItem) return;

    if (currentItem.barrier?.barrierTypeSlug) {
      const matchingBarrier = barrierTypes.find((barrier) => barrier.slug === currentItem.barrier?.barrierTypeSlug);
      if (matchingBarrier) {
        setSelectedBarrier({ id: matchingBarrier.id, slug: matchingBarrier.slug });
      } else if (currentItem.barrier?.barrierTypeId) {
        setSelectedBarrier({ id: currentItem.barrier.barrierTypeId, slug: currentItem.barrier.barrierTypeSlug });
      } else {
        setSelectedBarrier(null);
      }
    } else {
      setSelectedBarrier(null);
    }
    setCustomBarrier(currentItem.barrier?.custom || "");
    setSelectedAnchorType(currentItem.anchorType || null);

    // Parse existing anchor value
    if (currentItem.anchorType === "at" && currentItem.anchorValue) {
      setAnchorTime(currentItem.anchorValue);
    } else if (currentItem.anchorValue) {
      setAnchorText(currentItem.anchorValue);
    } else {
      setAnchorTime("");
      setAnchorText("");
    }
  }, [currentItemIndex, currentItem, barrierTypes]);

  const isCurrentBarrier = (barrier: BarrierType) => {
    if (!selectedBarrier) return false;
    const slug = barrier.slug?.toLowerCase();
    if (slug && selectedBarrier.slug) {
      return slug === selectedBarrier.slug.toLowerCase();
    }
    return barrier.id === selectedBarrier.id;
  };

  const toggleBarrierSelection = (barrier: BarrierType) => {
    if (isCurrentBarrier(barrier)) {
      setSelectedBarrier(null);
    } else {
      setSelectedBarrier({ id: barrier.id, slug: barrier.slug });
      // Add selection animation feedback
      setJustSelectedBarrier(barrier.id);
      setTimeout(() => setJustSelectedBarrier(null), 300);
    }
  };

  const handleNext = () => {
    // Save current item's barrier and anchor
    const barrier =
      selectedBarrier || customBarrier.trim()
        ? {
            barrierTypeSlug: selectedBarrier?.slug ?? null,
            barrierTypeId: selectedBarrier?.id ?? null,
            custom: customBarrier.trim() || null,
          }
        : null;

    setBarrierForItem(currentItem.id, barrier);

    const anchor =
      selectedAnchorType
        ? {
            anchorType: selectedAnchorType,
            anchorValue:
              selectedAnchorType === "at"
                ? anchorTime
                : cleanAnchorInput(selectedAnchorType, anchorText),
          }
        : null;

    setAnchorForItem(currentItem.id, anchor);

    if (isLastItem) {
      // Go to save page
      router.push('/plan-ahead/save');
    } else {
      // Move to next item
      setCurrentItemIndex((prev) => prev + 1);
      // Reset form for next item
      setSelectedBarrier(null);
      setCustomBarrier("");
      setSelectedAnchorType(null);
      setAnchorTime("");
      setAnchorText("");
    }
  };

  const handleSkip = () => {
    // Skip this item's barriers/anchors
    if (isLastItem) {
      router.push('/plan-ahead/save');
    } else {
      setCurrentItemIndex((prev) => prev + 1);
      setSelectedBarrier(null);
      setCustomBarrier("");
      setSelectedAnchorType(null);
      setAnchorTime("");
      setAnchorText("");
    }
  };

  if (!currentItem) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600">No items to configure</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/plan-ahead/focus"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-emerald-600">
              Plan Ahead · Item {currentItemIndex + 1} of {plannedItems.length}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">What might feel hard?</h1>
            <p className="text-sm text-slate-600">Add barriers and anchors (optional)</p>
          </div>
        </header>

        {/* Current Focus Item */}
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
            {currentItem.categories[0] && (
              <span className="text-xl leading-none">{getCategoryEmoji(currentItem.categories[0])}</span>
            )}
            <span>{currentItem.description}</span>
          </p>
        </section>

        <section className="space-y-6 rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur">
          {/* Barrier Selection */}
          <div className="space-y-4">
            <div>
            <label className="text-sm font-semibold text-slate-700">
              What feels hard about this? (optional)
            </label>
              {/* Summary line */}
              {selectedBarrierInfo && (
                <p className="mt-1 text-xs text-slate-600">
                  You've chosen <span className="font-semibold">"{selectedBarrierInfo.meta.label}"</span>
                  {selectedBarrierInfo.groupTitle && (
                    <> from <span className="font-medium">{selectedBarrierInfo.groupTitle}</span></>
                  )}
                </p>
              )}
            </div>

            {/* Barrier groups with pills */}
            <div className="space-y-4">
              {barrierGroups.length > 0 ? (
                barrierGroups.map((group) => {
                  // Category color coding with subtle tints
                  const groupColors: Record<string, { bg: string; border: string }> = {
                    "Energy & Motivation": {
                      bg: "bg-amber-50/30 dark:bg-amber-900/10",
                      border: "border-amber-200/30 dark:border-amber-700/20",
                    },
                    "Focus & Overwhelm": {
                      bg: "bg-sky-50/30 dark:bg-sky-900/10",
                      border: "border-sky-200/30 dark:border-sky-700/20",
                    },
                    "Time & Avoidance": {
                      bg: "bg-violet-50/30 dark:bg-violet-900/10",
                      border: "border-violet-200/30 dark:border-violet-700/20",
                    },
                    "Emotional & Relational": {
                      bg: "bg-rose-50/30 dark:bg-rose-900/10",
                      border: "border-rose-200/30 dark:border-rose-700/20",
                    },
                  };

                  const colors = groupColors[group.title] || {
                    bg: "bg-slate-50/20 dark:bg-slate-800/20",
                    border: "border-slate-200/20 dark:border-slate-600/20",
                  };

                  return (
                    <div
                      key={group.title}
                      className={`category-box rounded-2xl border p-3 ${colors.bg} ${colors.border}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-3">
                        {group.title}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((barrier) => {
                          const meta = getBarrierDisplayMeta(barrier);
                          const active = isCurrentBarrier(barrier);
                          const isJustSelected = justSelectedBarrier === barrier.id;
                          return (
                            <button
                              type="button"
                              key={barrier.id ?? barrier.slug ?? meta.label}
                              onClick={() => toggleBarrierSelection(barrier)}
                              aria-pressed={active}
                              className={`pill inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300 min-h-[44px] ${
                                active
                                  ? "selected bg-gradient-to-br from-[#74C8FF] to-[#8AEFFF] text-[#0B172A] font-semibold shadow-md"
                                  : "bg-white/80 text-slate-700 hover:bg-white/90 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-700/60"
                              }`}
                              style={{
                                animation: isJustSelected ? "microBounce 0.3s ease-in-out" : undefined,
                              }}
                            >
                              <span className="text-base leading-none">{meta.emoji}</span>
                              <span>{meta.label}</span>
                              {active && (
                                <CheckCircle2 
                                  className="h-4 w-4 flex-shrink-0 ml-0.5" 
                                  aria-hidden="true"
                                  style={{
                                    animation: "fadeIn 0.3s ease-in-out",
                                  }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loading barrier ideas from the ADHD First Aid Kit…
                </p>
              )}
            </div>

            <input
              type="text"
              value={customBarrier}
              onChange={(e) => setCustomBarrier(e.target.value)}
              placeholder="Or describe your own barrier..."
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-600/50 dark:bg-slate-700/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/40"
            />
          </div>

          {/* Anchor Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              Anchor it to something? (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {anchorOptions.map((option) => {
                const isSelected = selectedAnchorType === option.type;
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedAnchorType(null);
                        setAnchorTime("");
                      } else {
                        setSelectedAnchorType(option.type);
                        // Set current time as default when "at" is selected
                        if (option.type === "at") {
                          setAnchorTime(new Date().toTimeString().slice(0, 5)); // HH:MM format
                        } else {
                          setAnchorTime("");
                        }
                      }
                    }}
                    className={`rounded-full px-4 py-2 font-medium transition ${
                      isSelected
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-white/70 text-slate-600 hover:bg-white"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            {selectedAnchorType === "at" && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pick a time
                </label>
                <input
                  type="time"
                  value={anchorTime}
                  onChange={(e) => setAnchorTime(e.target.value)}
                  className="w-full rounded-2xl border-2 border-emerald-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Select time"
                />
                <p className="text-xs text-slate-500">
                  Tap to choose a time
                </p>
              </div>
            )}

            {selectedAnchorType && selectedAnchorType !== "at" && (
              <input
                type="text"
                value={anchorText}
                onChange={(e) => setAnchorText(e.target.value)}
                placeholder={anchorPlaceholders[selectedAnchorType]}
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            )}

            {selectedAnchorType && (
              <p className="text-sm text-slate-600">
                {buildAnchorPhrase(
                  currentItem.description,
                  selectedAnchorType,
                  selectedAnchorType === "at"
                    ? anchorTime
                    : cleanAnchorInput(selectedAnchorType, anchorText)
                )}
              </p>
            )}
          </div>
        </section>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
          >
            {isLastItem ? 'Save Plan' : `Next Item (${currentItemIndex + 2}/${plannedItems.length})`}
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            className="w-full rounded-2xl border border-slate-300 bg-white/70 px-6 py-3 font-semibold text-slate-700 transition hover:bg-white"
          >
            {isLastItem ? 'Skip and save' : 'Skip this item'}
          </button>
        </div>
      </div>
    </main>
  );
}
