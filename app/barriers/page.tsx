"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCheckIn, type TaskAnchorType } from "@/lib/checkin-context";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";
import { buildAnchorPhrase, cleanAnchorInput } from "@/lib/anchors";
import { getCategoryEmoji } from "@/lib/categories";
import { hasBarrierSelection } from "@/lib/barrier-helpers";

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

export default function BarrierScreen() {
  const router = useRouter();
  const { focusItems, setBarrierForFocusItem, setAnchorForFocusItem } = useCheckIn();
  const activeFocusItems = focusItems.filter((item) => !item.completed);
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
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

  const canProceed = useMemo(
    () =>
      activeFocusItems.length > 0 &&
      activeFocusItems.every((item) => {
        const hasBarrier = hasBarrierSelection(item.barrier);
        const hasAnchor = Boolean(item.anchorType && item.anchorValue?.trim());
        return hasBarrier && hasAnchor;
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
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600">Barriers</p>
            <h1 className="text-2xl font-bold text-slate-900">What feels hard?</h1>
            <p className="text-sm text-slate-600">Match each focus with a barrier or short note.</p>
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
              ? anchorSuggestionMap[contextualType] ?? []
              : [];

            const handleAnchorType = (type: TaskAnchorType) => {
              if (type === anchorSelected) return;
              setAnchorForFocusItem(item.id, {
                anchorType: type,
                anchorValue: "",
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
            return (
              <div
                key={item.id}
                className="space-y-4 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-sm"
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Focus</p>
                  <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    {item.categories[0] && (
                      <span className="text-2xl leading-none">
                        {getCategoryEmoji(item.categories[0])}
                      </span>
                    )}
                    <span>{item.description}</span>
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor={`barrier-select-${item.id}`}>
                    Common barrier
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
                    className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="">Pick a barrier (optional)</option>
                    {barrierTypes.map((barrier) => (
                      <option key={barrier.id} value={barrier.slug}>
                        {barrier.icon ? `${barrier.icon} ` : ""}{barrier.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor={`barrier-note-${item.id}`}>
                    Describe what&rsquo;s in the way
                  </label>
                  <textarea
                    id={`barrier-note-${item.id}`}
                    rows={3}
                    value={custom}
                    onChange={(event) =>
                      setBarrierForFocusItem(item.id, {
                        barrierTypeSlug: selectedSlug || undefined,
                        barrierTypeId: selectedBarrierId,
                        custom: event.target.value,
                      })
                    }
                    placeholder="Overwhelmed, low energy, waiting on a reply..."
                    className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  />
                </div>

                <div className="space-y-3 rounded-2xl border border-dashed border-cyan-100 bg-cyan-50/50 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">When could you do this, or what could you pair it with?</p>
                    <p className="text-xs text-slate-500">Link it to time or rhythm (at, while, before, after) so it feels less heavy.</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm">
                    {anchorOptions.map(({ type, label }) => {
                      const active = anchorSelected === type;
                      return (
                        <button
                          type="button"
                          key={type}
                          onClick={() => handleAnchorType(type)}
                          className={`rounded-full px-4 py-1.5 font-semibold transition ${
                            active
                              ? "bg-cyan-600 text-white shadow"
                              : "bg-white text-slate-600 hover:bg-cyan-100"
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
                        className="rounded-full border border-transparent px-3 py-1 text-xs font-medium text-slate-500 hover:border-slate-200"
                      >
                        Clear
                      </button>
                    )}
                  </div>

                  {anchorSelected === "at" && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pick a time
                      </label>
                      <input
                        type="time"
                        value={anchorValue}
                        onChange={(event) => handleAnchorValue(event.target.value)}
                        className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-slate-900 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      />
                    </div>
                  )}

                  {contextualType && (
                    <div className="space-y-3">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {contextLabel}
                      </label>
                      <input
                        type="text"
                        value={anchorValue}
                        onChange={(event) => handleAnchorValue(event.target.value)}
                        placeholder={contextPlaceholder}
                        className="w-full rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                      />
                      {contextSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {contextSuggestions.map((suggestion) => (
                            <button
                              type="button"
                              key={`${contextualType}-${suggestion}`}
                              onClick={() => handleAnchorValue(suggestion)}
                              className="rounded-full border border-white/60 bg-white/80 px-3 py-1 text-slate-600 transition hover:border-cyan-200 hover:text-cyan-700"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {anchorPhrase && (
                    <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      {categoryEmoji && <span className="text-xl leading-none">{categoryEmoji}</span>}
                      <span>{anchorPhrase}</span>
                    </p>
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next: Gentle Support
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </main>
  );
}
