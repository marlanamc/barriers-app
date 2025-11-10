"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCheckIn, MAX_FOCUS_ITEMS, type TaskAnchorType } from "@/lib/checkin-context";
import { CATEGORY_OPTIONS, getCategoryEmoji } from "@/lib/categories";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";
import { buildAnchorPhrase, cleanAnchorInput } from "@/lib/anchors";

const whileSuggestions = [
  "while watching TV",
  "while listening to music",
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

export default function FocusScreen() {
  const router = useRouter();
  const {
    weather,
    focusItems,
    addFocusItem,
    removeFocusItem,
    updateFocusItem,
    setBarrierForFocusItem,
    setAnchorForFocusItem,
  } = useCheckIn();
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);

  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

  const barrierBySlug = useMemo(() => {
    return barrierTypes.reduce<Record<string, BarrierType>>((acc, barrier) => {
      acc[barrier.slug] = barrier;
      return acc;
    }, {});
  }, [barrierTypes]);

  const toggleTag = (tag: string) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleAdd = () => {
    if (!text.trim()) return;
    addFocusItem(text, tags);
    setText("");
    setTags([]);
  };

  const activeFocusItems = focusItems.filter((item) => !item.completed);
  const completedFocusItems = focusItems.filter((item) => item.completed);
  const activeCount = activeFocusItems.length;
  const barriersComplete =
    Boolean(weather) &&
    activeFocusItems.length > 0 &&
    activeFocusItems.every((item) => {
      const barrier = item.barrier;
      const hasBarrier = Boolean(barrier && (barrier.barrierTypeSlug || barrier.custom?.trim()));
      const hasAnchor = Boolean(item.anchorType && item.anchorValue?.trim());
      return hasBarrier && hasAnchor;
    });

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600">Steps 2 &amp; 3</p>
            <h1 className="text-2xl font-bold text-slate-900">What matters &amp; what feels hard?</h1>
            <p className="text-sm text-slate-600">Add today&rsquo;s focus points, then pair each with a barrier + anchor.</p>
            {!weather && (
              <p className="mt-2 text-xs font-semibold text-amber-600">
                Set today&rsquo;s energy first so supports match the vibe.
              </p>
            )}
          </div>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700" htmlFor="focus-text">
                Focus item
              </label>
              <textarea
                id="focus-text"
                rows={2}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Send the email, stretch, clear the kitchen table..."
                className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">Category tags</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {CATEGORY_OPTIONS.map((option) => {
                  const active = tags.includes(option.label);
                  return (
                    <button
                      type="button"
                      key={option.label}
                      onClick={() => toggleTag(option.label)}
                      className={`rounded-full px-4 py-1.5 font-medium transition ${
                        active ? "bg-cyan-100 text-cyan-800" : "bg-white/70 text-slate-600 hover:bg-white"
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-200 bg-white/80 px-4 py-3 font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Add focus
              <span className="text-sm text-cyan-500">{activeCount}/{MAX_FOCUS_ITEMS}</span>
            </button>
          </div>
        </section>

        {focusItems.length > 0 && (
          <section className="space-y-4">
            {activeFocusItems.length > 0 ? (
              <div className="space-y-4">
                {activeFocusItems
                  .slice()
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((item) => {
                    const selectedSlug = item.barrier?.barrierTypeSlug || "";
                    const fallbackBarrier = selectedSlug ? barrierBySlug[selectedSlug] : null;
                    const selectedBarrierId = item.barrier?.barrierTypeId || fallbackBarrier?.id || null;
                    const customBarrier = item.barrier?.custom || "";
                    const anchorSelected = item.anchorType;
                    const anchorValue = item.anchorValue || "";
                    const contextualType = anchorSelected && anchorSelected !== "at" ? anchorSelected : null;
                    const contextLabel = contextualType ? anchorTextLabels[contextualType] : "";
                    const contextPlaceholder = contextualType ? anchorPlaceholders[contextualType] : "";
                    const contextSuggestions = contextualType ? anchorSuggestionMap[contextualType] ?? [] : [];
                    const anchorSummary = anchorSelected && anchorValue
                      ? buildAnchorPhrase(item.description, anchorSelected, anchorValue)
                      : "";

                    return (
                      <div key={item.id} className="space-y-4 rounded-3xl border border-white/30 bg-white/80 p-5 shadow-sm">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            onClick={() => updateFocusItem(item.id, { completed: true })}
                            className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-cyan-200 hover:text-cyan-600"
                            aria-label="Mark focus as done"
                          >
                            <Circle className="h-5 w-5" />
                          </button>
                          <div className="flex-1">
                            <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                              {item.categories[0] && (
                                <span className="text-xl leading-none">{getCategoryEmoji(item.categories[0])}</span>
                              )}
                              <span>{item.description}</span>
                            </p>
                            {item.categories.length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                {item.categories.map((category) => (
                                  <span key={category} className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                                    {getCategoryEmoji(category)} {category}
                                  </span>
                                ))}
                              </div>
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
                        </div>

                        <div className="space-y-3">
                          <label className="text-sm font-semibold text-slate-700">What feels hard? (optional)</label>
                          <select
                            value={selectedSlug}
                            onChange={(event) =>
                              setBarrierForFocusItem(item.id, {
                                barrierTypeSlug: event.target.value || undefined,
                                barrierTypeId: event.target.value ? barrierBySlug[event.target.value]?.id ?? null : null,
                                custom: customBarrier,
                              })
                            }
                            className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                          >
                            <option value="">Pick a barrier (optional)</option>
                            {barrierTypes.map((barrier) => (
                              <option key={barrier.id} value={barrier.slug}>
                                {barrier.icon ? `${barrier.icon} ` : ""}
                                {barrier.label}
                              </option>
                            ))}
                          </select>
                          <textarea
                            value={customBarrier}
                            onChange={(event) =>
                              setBarrierForFocusItem(item.id, {
                                barrierTypeSlug: selectedSlug || undefined,
                                barrierTypeId: selectedBarrierId,
                                custom: event.target.value,
                              })
                            }
                            placeholder="Describe what feels hard about this focus..."
                            className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                          />
                        </div>

                        <div className="space-y-3 rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/50 px-4 py-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Anchor it to something?</p>
                            <p className="text-xs text-slate-500">Link it to a time or rhythm so it feels lighter.</p>
                          </div>
                          <div className="flex flex-wrap gap-3 text-sm">
                            {anchorOptions.map(({ type, label }) => {
                              const active = anchorSelected === type;
                              return (
                                <button
                                  type="button"
                                  key={type}
                                  onClick={() =>
                                    setAnchorForFocusItem(
                                      item.id,
                                      active
                                        ? null
                                        : {
                                            anchorType: type,
                                            anchorValue: "",
                                          }
                                    )
                                  }
                                  className={`rounded-full px-4 py-1.5 font-semibold transition ${
                                    active ? "bg-cyan-600 text-white shadow" : "bg-white text-slate-600 hover:bg-cyan-100"
                                  }`}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>

                          {anchorSelected === "at" && (
                            <input
                              type="time"
                              value={anchorValue}
                              onChange={(event) =>
                                setAnchorForFocusItem(item.id, {
                                  anchorType: "at",
                                  anchorValue: event.target.value,
                                })
                              }
                              className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-slate-900 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                            />
                          )}

                          {contextualType && (
                            <div className="space-y-2">
                              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                                className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
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
                                      className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
                                    >
                                      {suggestion}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {anchorSummary && (
                            <p className="text-sm font-semibold text-cyan-700">{anchorSummary}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-sm text-slate-500">All active items are done. Add more above if something new pops up.</p>
            )}

            {completedFocusItems.length > 0 && (
              <div className="space-y-2 border-t border-white/40 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Completed</p>
                <div className="space-y-2">
                  {completedFocusItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/60 px-4 py-3"
                    >
                      <button
                        type="button"
                        onClick={() => updateFocusItem(item.id, { completed: false })}
                        className="rounded-full border border-transparent p-1 text-emerald-500 transition hover:border-emerald-200"
                        aria-label="Mark focus as not done"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <p className="flex-1 text-sm font-semibold text-slate-500 line-through">
                        {item.description}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeFocusItem(item.id)}
                        className="rounded-full border border-transparent p-1 text-slate-400 transition hover:border-rose-200 hover:text-rose-600"
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
          onClick={() => router.push("/gentle-support")}
          disabled={!barriersComplete}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next: Gentle Support
        </button>
        {!barriersComplete && (
          <p className="text-center text-xs text-slate-500">
            Set today&rsquo;s energy and add a barrier + anchor for every focus to continue.
          </p>
        )}
      </div>
    </main>
  );
}
