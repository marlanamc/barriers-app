"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCheckIn, type TaskAnchorType, type TaskAnchor } from "@/lib/checkin-context";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";
import { buildAnchorPhrase, buildMultipleAnchorsPhrase, cleanAnchorInput, getMergedAnchorSuggestions, defaultAnchorSuggestionMap, anchorLabel } from "@/lib/anchors";
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
  const { focusItems, setBarrierForFocusItem, setAnchorForFocusItem, addAnchorToFocusItem, removeAnchorFromFocusItem, setAnchorsForFocusItem } = useCheckIn();
  const { user } = useSupabaseUser();
  const activeFocusItems = focusItems.filter((item) => !item.completed);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [expandedAnchors, setExpandedAnchors] = useState<Record<string, boolean>>({});
  const [addingAnchor, setAddingAnchor] = useState<Record<string, boolean>>({});
  const [newAnchorType, setNewAnchorType] = useState<Record<string, TaskAnchorType | null>>({});
  const [newAnchorValue, setNewAnchorValue] = useState<Record<string, string>>({});
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

            // Auto-expand if anchor is already selected
            const isAnchorExpanded = expandedAnchors[item.id] ?? Boolean(item.anchors && item.anchors.length > 0);
            
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
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        {item.anchors && item.anchors.length > 0 ? "Anchors: " + buildMultipleAnchorsPhrase(item.anchors) : "Link to time or rhythm? (optional)"}
                      </p>
                      {(!item.anchors || item.anchors.length === 0) && (
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
                      {/* Display existing anchors */}
                      {item.anchors && item.anchors.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Current Anchors</p>
                          <div className="flex flex-wrap gap-2">
                            {item.anchors.map((anchor, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 rounded-full bg-cyan-600 px-3 py-1.5 text-sm font-semibold text-white dark:bg-cyan-500"
                              >
                                <span>{anchorLabel(anchor.type, anchor.value)}</span>
                                <button
                                  type="button"
                                  onClick={() => removeAnchorFromFocusItem(item.id, index)}
                                  className="rounded-full hover:bg-cyan-700 dark:hover:bg-cyan-600 p-0.5"
                                  aria-label="Remove anchor"
                                >
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add new anchor */}
                      {!addingAnchor[item.id] ? (
                        <button
                          type="button"
                          onClick={() => setAddingAnchor(prev => ({ ...prev, [item.id]: true }))}
                          className="w-full rounded-2xl border border-dashed border-cyan-300 bg-white/50 px-4 py-2 text-sm font-semibold text-cyan-700 transition hover:bg-white dark:border-cyan-600/50 dark:bg-slate-800/40 dark:text-cyan-400 dark:hover:bg-slate-800/60"
                        >
                          + Add {item.anchors && item.anchors.length > 0 ? "Another" : "an"} Anchor
                        </button>
                      ) : (
                        <div className="space-y-3 rounded-2xl border border-cyan-200 bg-white p-3 dark:border-cyan-700/50 dark:bg-slate-800/60">
                          <div className="flex flex-wrap gap-2 text-sm">
                            {anchorOptions.map(({ type, label }) => {
                              const active = newAnchorType[item.id] === type;
                              return (
                                <button
                                  type="button"
                                  key={type}
                                  onClick={() => {
                                    setNewAnchorType(prev => ({ ...prev, [item.id]: type }));
                                    setNewAnchorValue(prev => ({ ...prev, [item.id]: type === "at" ? new Date().toTimeString().slice(0, 5) : "" }));
                                  }}
                                  className={`rounded-full px-3 py-1.5 font-semibold transition ${
                                    active
                                      ? "bg-cyan-600 text-white shadow dark:bg-cyan-500"
                                      : "bg-white text-slate-600 hover:bg-cyan-100 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-600/60"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          {newAnchorType[item.id] === "at" && (
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                Pick a time
                              </label>
                              <input
                                type="time"
                                value={newAnchorValue[item.id] || ""}
                                onChange={(e) => setNewAnchorValue(prev => ({ ...prev, [item.id]: e.target.value }))}
                                className="w-full rounded-2xl border-2 border-cyan-200 bg-white px-4 py-3 text-lg font-medium text-slate-900 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-cyan-600/50 dark:bg-slate-700/60 dark:text-slate-100 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                              />
                            </div>
                          )}

                          {newAnchorType[item.id] && newAnchorType[item.id] !== "at" && (
                            <div className="space-y-2">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {anchorTextLabels[newAnchorType[item.id] as Exclude<TaskAnchorType, "at">]}
                              </label>
                              <input
                                type="text"
                                value={newAnchorValue[item.id] || ""}
                                onChange={(e) => setNewAnchorValue(prev => ({ ...prev, [item.id]: cleanAnchorInput(newAnchorType[item.id]!, e.target.value) }))}
                                placeholder={anchorPlaceholders[newAnchorType[item.id] as Exclude<TaskAnchorType, "at">]}
                                className="w-full rounded-2xl border border-cyan-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-cyan-600/50 dark:bg-slate-700/60 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/40"
                              />
                              {newAnchorType[item.id] && mergedAnchorSuggestions[newAnchorType[item.id] as Exclude<TaskAnchorType, "at">] && (
                                <div className="flex flex-wrap gap-2 text-xs">
                                  {(mergedAnchorSuggestions[newAnchorType[item.id] as Exclude<TaskAnchorType, "at">] || []).slice(0, 4).map((suggestion) => (
                                    <button
                                      type="button"
                                      key={suggestion}
                                      onClick={() => setNewAnchorValue(prev => ({ ...prev, [item.id]: suggestion }))}
                                      className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-slate-600 transition hover:border-cyan-300 hover:text-cyan-700 dark:border-cyan-700/50 dark:bg-slate-700/60 dark:text-slate-200 dark:hover:border-cyan-600 dark:hover:text-cyan-200"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const type = newAnchorType[item.id];
                                const value = newAnchorValue[item.id];
                                if (type && value) {
                                  addAnchorToFocusItem(item.id, { type, value });
                                  setAddingAnchor(prev => ({ ...prev, [item.id]: false }));
                                  setNewAnchorType(prev => ({ ...prev, [item.id]: null }));
                                  setNewAnchorValue(prev => ({ ...prev, [item.id]: "" }));
                                }
                              }}
                              disabled={!newAnchorType[item.id] || !newAnchorValue[item.id]}
                              className="flex-1 rounded-2xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-cyan-500 dark:hover:bg-cyan-600"
                            >
                              Add Anchor
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAddingAnchor(prev => ({ ...prev, [item.id]: false }));
                                setNewAnchorType(prev => ({ ...prev, [item.id]: null }));
                                setNewAnchorValue(prev => ({ ...prev, [item.id]: "" }));
                              }}
                              className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-300 dark:hover:bg-slate-600/60"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Clear all anchors button */}
                      {item.anchors && item.anchors.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setAnchorsForFocusItem(item.id, [])}
                          className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        >
                          Clear all anchors
                        </button>
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
