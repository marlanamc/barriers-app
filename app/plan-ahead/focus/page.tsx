"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlanning } from "@/lib/planning-context";
import { CATEGORY_OPTIONS, getCategoryEmoji } from "@/lib/categories";
import { getRecurrenceDescription } from "@/lib/recurrence";

export default function PlanAheadFocusPage() {
  const router = useRouter();
  const {
    recurrenceType,
    startDate,
    endDate,
    recurrenceDays,
    plannedItems,
    addPlannedItem,
    removePlannedItem,
  } = usePlanning();

  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const recurrenceInfo = getRecurrenceDescription({
    recurrenceType,
    startDate,
    endDate,
    recurrenceDays: recurrenceType === 'weekly' ? recurrenceDays : null,
  });

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = () => {
    if (!text.trim()) return;
    addPlannedItem(text, tags);
    setText("");
    setTags([]);
  };

  const handleNext = () => {
    if (plannedItems.length === 0) {
      alert('Please add at least one focus item');
      return;
    }
    router.push('/plan-ahead/barriers');
  };

  const handleSkip = () => {
    if (plannedItems.length === 0) {
      alert('Please add at least one focus item');
      return;
    }
    // Skip barriers and go straight to save
    router.push('/plan-ahead/save');
  };

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
            <h1 className="text-2xl font-bold text-slate-900">Add focus items</h1>
            <p className="text-sm text-slate-600">{recurrenceInfo}</p>
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
                placeholder="Take morning meds, pack gym bag, prep lunch..."
                className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-700">Category tags (optional)</p>
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

            <button
              type="button"
              onClick={handleAdd}
              disabled={!text.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-emerald-200 bg-white/80 px-4 py-3 font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Add focus item
            </button>
          </div>
        </section>

        {plannedItems.length > 0 && (
          <section className="space-y-3">
            <p className="text-sm font-medium text-slate-600">
              {plannedItems.length} {plannedItems.length === 1 ? 'item' : 'items'} planned
            </p>
            {plannedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-3xl border border-white/30 bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900 flex items-center gap-2">
                      {item.categories[0] && (
                        <span className="text-xl leading-none">{getCategoryEmoji(item.categories[0])}</span>
                      )}
                      <span>{item.description}</span>
                    </p>
                    {item.categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        {item.categories.map((category) => (
                          <span
                            key={category}
                            className="rounded-full bg-slate-100 px-3 py-1 text-slate-600"
                          >
                            {getCategoryEmoji(category)} {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlannedItem(item.id)}
                    className="rounded-full bg-white/70 p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleNext}
            disabled={plannedItems.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next: Add Barriers (Optional)
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={plannedItems.length === 0}
            className="w-full rounded-2xl border border-slate-300 bg-white/70 px-6 py-3 font-semibold text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Skip barriers and save
          </button>
        </div>
      </div>
    </main>
  );
}
