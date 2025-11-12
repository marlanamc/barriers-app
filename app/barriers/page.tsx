"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCheckIn, type TaskAnchorType } from "@/lib/checkin-context";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";
import { buildAnchorPhrase, cleanAnchorInput, getMergedAnchorSuggestions, defaultAnchorSuggestionMap } from "@/lib/anchors";
import { getCategoryEmoji } from "@/lib/categories";
import { hasBarrierSelection } from "@/lib/barrier-helpers";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

// Default suggestions - will be merged with user presets
const whileSuggestions = defaultAnchorSuggestionMap.while || [];
const beforeSuggestions = defaultAnchorSuggestionMap.before || [];
const afterSuggestions = defaultAnchorSuggestionMap.after || [];
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

export default function BarrierScreen() {
  const router = useRouter();
  const { focusItems, setBarrierForFocusItem, setAnchorForFocusItem } = useCheckIn();
  const { user } = useSupabaseUser();
  const activeFocusItems = focusItems.filter((item) => !item.completed);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [expandedAnchors, setExpandedAnchors] = useState<Record<string, boolean>>({});
  const [mergedAnchorSuggestions, setMergedAnchorSuggestions] = useState<Partial<Record<TaskAnchorType, string[]>>>({
    while: whileSuggestions,
    before: beforeSuggestions,
    after: afterSuggestions,
  });
  const barrierBySlug = useMemo(() => {
    return barrierTypes.reduce<Record<string, BarrierType>>((acc, barrier) => {
      acc[barrier.slug] = barrier;
      return acc;
    }, {});
  }, [barrierTypes]);

  useEffect(() => {
    if (!activeFocusItems.length) {
      router.replace("/focus");
    }
  }, [activeFocusItems.length, router]);

  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

  // Load user anchor presets and merge with defaults
  useEffect(() => {
    if (!user?.id) return;
    
    const loadMergedSuggestions = async () => {
      try {
        const [whileMerged, beforeMerged, afterMerged] = await Promise.all([
          getMergedAnchorSuggestions('while', user.id),
          getMergedAnchorSuggestions('before', user.id),
          getMergedAnchorSuggestions('after', user.id),
        ]);
        setMergedAnchorSuggestions({
          while: whileMerged,
          before: beforeMerged,
          after: afterMerged,
        });
      } catch (error) {
        console.error('Error loading merged anchor suggestions:', error);
      }
    };
    
    loadMergedSuggestions();
  }, [user?.id]);

  const canProceed = useMemo(
    () =>
      activeFocusItems.length > 0 &&
      activeFocusItems.every((item) => {
        return hasBarrierSelection(item.barrier);
      }),
    [activeFocusItems]
  );

  if (!activeFocusItems.length) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/focus"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-600/40 dark:bg-slate-800/70 dark:text-slate-300"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Barriers</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">What feels hard?</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Match each focus with a barrier or short note.</p>
          </div>
        </header>

        <section className="space-y-4">
          {activeFocusItems.map((item) => {
            const selectedSlug = item.barrier?.barrierTypeSlug || "";
            const fallbackBarrier = selectedSlug ? barrierBySlug[selectedSlug] : null;
            const selectedBarrierId = item.barrier?.barrierTypeId || fallbackBarrier?.id || null;
            const custom = item.barrier?.custom || "";
            const anchorSelected = item.anchorType;
            const anchorValue = item.anchorValue || "";
            const contextualType =
              anchorSelected && anchorSelected !== "at" ? anchorSelected : null;
            const contextPlaceholder = contextualType
              ? `${contextualType} ${anchorPlaceholders[contextualType]}`
              : "";
            const contextLabel = contextualType ? anchorTextLabels[contextualType] : "";
            const contextSuggestions = contextualType
              ? (mergedAnchorSuggestions[contextualType] ?? [])
              : [];

            const handleAnchorType = (type: TaskAnchorType) => {
              if (type === anchorSelected) return;
              // Set current time as default when "at" is selected
              const defaultValue = type === "at" 
                ? new Date().toTimeString().slice(0, 5) // HH:MM format
                : "";
              setAnchorForFocusItem(item.id, {
                anchorType: type,
                anchorValue: defaultValue,
              });
            };

            const handleAnchorValue = (value: string) => {
              if (!anchorSelected) return;
              const nextValue =
                anchorSelected === "at" ? value : cleanAnchorInput(anchorSelected, value);
              setAnchorForFocusItem(item.id, {
                anchorType: anchorSelected,
                anchorValue: nextValue,
              });
            };

            const categoryEmoji = getCategoryEmoji(item.categories[0]);
            const anchorPhrase =
              anchorSelected && anchorValue
                ? buildAnchorPhrase(item.description, anchorSelected, anchorValue)
                : "";
            
            // Auto-expand if anchor is already selected
            const isAnchorExpanded = expandedAnchors[item.id] ?? Boolean(anchorSelected);
            
            return (
              <div
                key={item.id}
                className="space-y-4 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-sm dark:border-slate-600/40 dark:bg-slate-800/60"
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Focus</p>
                  <p className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {item.categories[0] && (
                      <span className="text-2xl leading-none">
                        {getCategoryEmoji(item.categories[0])}
                      </span>
                    )}
                    <span>{item.description}</span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={`barrier-select-${item.id}`}>
                    What feels hard?
                  </label>
                  <select
                    id={`barrier-select-${item.id}`}
                    value={selectedSlug}
                    onChange={(event) =>
                      setBarrierForFocusItem(item.id, {
                        barrierTypeSlug: event.target.value || undefined,
                        barrierTypeId: event.target.value ? barrierBySlug[event.target.value]?.id ?? null : null,
                        custom,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-600/50 dark:bg-slate-700/60 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                  >
                    <option value="">Pick a barrier</option>
                    {barrierTypes.map((barrier) => (
                      <option key={barrier.id} value={barrier.slug}>
                        {barrier.icon ? `${barrier.icon} ` : ""}{barrier.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={`barrier-note-${item.id}`}>
                    Or describe what&rsquo;s in the way
                  </label>
                  <textarea
                    id={`barrier-note-${item.id}`}
                    rows={2}
                    value={custom}
                    onChange={(event) =>
                      setBarrierForFocusItem(item.id, {
                        barrierTypeSlug: selectedSlug || undefined,
                        barrierTypeId: selectedBarrierId,
                        custom: event.target.value,
                      })
                    }
                    placeholder="Overwhelmed, low energy, waiting on a reply..."
                    className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-600/50 dark:bg-slate-700/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/50 px-4 py-3 dark:border-cyan-600/40 dark:bg-cyan-900/20">
                  <button
                    type="button"
                    onClick={() => setExpandedAnchors(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {anchorSelected ? "Anchor: " + anchorPhrase : "Link to time or rhythm? (optional)"}
                      </p>
                      {!anchorSelected && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">at, while, before, after</p>
                      )}
                    </div>
                    {isAnchorExpanded ? (
                      <ChevronUp className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    )}
                  </button>
                  
                  {isAnchorExpanded && (
                    <div className="space-y-3 pt-2 border-t border-cyan-200/50 dark:border-cyan-700/30">
                      <div className="flex flex-wrap gap-2 text-sm">
                        {anchorOptions.map(({ type, label }) => {
                          const active = anchorSelected === type;
                          return (
                            <button
                              type="button"
                              key={type}
                              onClick={() => handleAnchorType(type)}
                              className={`rounded-full px-3 py-1.5 font-semibold transition ${
                                active
                                  ? "bg-cyan-600 text-white shadow dark:bg-cyan-500"
                                  : "bg-white text-slate-600 hover:bg-cyan-100 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700/60"
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                        {anchorSelected && (
                          <button
                            type="button"
                            onClick={() => setAnchorForFocusItem(item.id, null)}
                            className="rounded-full border border-transparent px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-200 dark:text-slate-400 dark:hover:border-slate-600"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {anchorSelected === "at" && (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            Pick a time
                          </label>
                          <input
                            type="time"
                            value={anchorValue}
                            onChange={(event) => handleAnchorValue(event.target.value)}
                            className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-cyan-600/50 dark:bg-slate-800/60 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                            placeholder="Select time"
                          />
                        </div>
                      )}

                      {contextualType && (
                        <div className="space-y-2">
                          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                            {contextLabel}
                          </label>
                          <input
                            type="text"
                            value={anchorValue}
                            onChange={(event) => handleAnchorValue(event.target.value)}
                            placeholder={contextPlaceholder}
                            className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-600/50 dark:bg-slate-700/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                          />
                          {contextSuggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 text-xs">
                              {contextSuggestions.slice(0, 4).map((suggestion) => (
                                <button
                                  type="button"
                                  key={`${contextualType}-${suggestion}`}
                                  onClick={() => handleAnchorValue(suggestion)}
                                  className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700 dark:border-slate-600/50 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-cyan-400 dark:hover:text-cyan-200"
                                >
                                  {suggestion}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        <button
          type="button"
          onClick={() => router.push("/gentle-support")}
          disabled={!canProceed}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:hover:bg-slate-600"
        >
          Next: Gentle Support
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </main>
  );
}
