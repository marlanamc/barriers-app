"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlanning } from "@/lib/planning-context";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";
import { buildAnchorPhrase, cleanAnchorInput } from "@/lib/anchors";
import { getCategoryEmoji } from "@/lib/categories";
import type { TaskAnchorType } from "@/lib/planning-context";

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

  const currentItem = plannedItems[currentItemIndex];
  const isLastItem = currentItemIndex === plannedItems.length - 1;

  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

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
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700">
              What feels hard about this? (optional)
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              {barrierTypes.map((barrier) => {
                const isSelected = selectedBarrier?.id === barrier.id;
                return (
                  <button
                    key={barrier.id}
                    type="button"
                    onClick={() =>
                      setSelectedBarrier(isSelected ? null : { id: barrier.id, slug: barrier.slug })
                    }
                    className={`rounded-2xl border px-4 py-3 text-left transition ${
                      isSelected
                        ? "border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200"
                        : "border-white/40 bg-white/70 hover:border-emerald-200"
                    }`}
                  >
                    <span className="text-lg">{barrier.icon}</span>
                    <p className="font-semibold text-slate-900">{barrier.label}</p>
                  </button>
                );
              })}
            </div>

            <input
              type="text"
              value={customBarrier}
              onChange={(e) => setCustomBarrier(e.target.value)}
              placeholder="Or describe your own barrier..."
              className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
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
                    onClick={() =>
                      setSelectedAnchorType(isSelected ? null : option.type)
                    }
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
              <input
                type="time"
                value={anchorTime}
                onChange={(e) => setAnchorTime(e.target.value)}
                className="w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
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
