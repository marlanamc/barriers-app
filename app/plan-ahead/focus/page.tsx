"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePlanning } from "@/lib/planning-context";
import { DEFAULT_CATEGORY_OPTIONS, getCategoryEmoji, getCategoryOptions } from "@/lib/categories";
import { getRecurrenceDescription } from "@/lib/recurrence";
import { useAuth } from "@/components/AuthProvider";

export default function PlanAheadFocusPage() {
  const router = useRouter();
  const { user } = useAuth();
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
  const [categoryOptions, setCategoryOptions] = useState(DEFAULT_CATEGORY_OPTIONS);

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

  useEffect(() => {
    if (user?.id) {
      getCategoryOptions(user.id).then(setCategoryOptions);
    }
  }, [user?.id]);

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
            className="rounded-full border border-blue-200/60 bg-blue-50/80 p-2 text-blue-700/70 transition hover:-translate-y-0.5 dark:border-white/40 dark:bg-white/70 dark:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-teal-500 dark:text-emerald-600">Plan Ahead</p>
            <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-900">Add focus items</h1>
            <p className="text-sm text-slate-500 dark:text-slate-600">{recurrenceInfo}</p>
          </div>
        </header>

        <section className="rounded-3xl border border-lavender-200/50 bg-white/95 p-6 backdrop-blur dark:border-white/20 dark:bg-white/80">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-slate-700" htmlFor="focus-text">
                Focus item
              </label>
              <textarea
                id="focus-text"
                rows={2}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Take morning meds, pack gym bag, prep lunch..."
                className="mt-2 w-full rounded-2xl border border-blue-200/50 bg-white/90 px-4 py-3 text-slate-700 placeholder:text-slate-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:border-white/40 dark:bg-white/80 dark:text-slate-900 dark:focus:border-emerald-300 dark:focus:ring-emerald-100"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-700">Category tags (optional)</p>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                {categoryOptions.map((option) => {
                  const active = tags.includes(option.label);
                  return (
                    <button
                      type="button"
                      key={option.label}
                      onClick={() => toggleTag(option.label)}
                      className={`rounded-full px-4 py-1.5 font-medium transition ${
                        active
                          ? "bg-teal-100 text-teal-700 dark:bg-emerald-100 dark:text-emerald-800"
                          : "bg-white/80 text-slate-600 hover:bg-blue-50/80 dark:bg-white/70 dark:hover:bg-white"
                      }`}
                    >
                      {option.emoji && <span className="mr-1">{option.emoji}</span>}
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
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-teal-200 bg-white/90 px-4 py-3 font-semibold text-teal-600 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-200 dark:bg-white/80 dark:text-emerald-700 dark:hover:bg-emerald-50"
            >
              <Plus className="h-5 w-5" />
              Add focus item
            </button>
          </div>
        </section>

        {plannedItems.length > 0 && (
          <section className="space-y-3">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-600">
              {plannedItems.length} {plannedItems.length === 1 ? 'item' : 'items'} planned
            </p>
            {plannedItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-3xl border border-blue-200/40 bg-blue-50/80 p-5 shadow-sm dark:border-white/30 dark:bg-white/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-700 flex items-center gap-2 dark:text-slate-900">
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
                            className="rounded-full bg-lavender-100/80 px-3 py-1 text-slate-600 dark:bg-slate-100 dark:text-slate-600"
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
                    className="rounded-full bg-white/80 p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-500 dark:bg-white/70 dark:hover:bg-rose-50 dark:hover:text-rose-600"
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
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-400 px-6 py-4 text-lg font-semibold text-white transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            Next: Add Barriers (Optional)
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={handleSkip}
            disabled={plannedItems.length === 0}
            className="w-full rounded-2xl border border-blue-200/60 bg-white/90 px-6 py-3 font-semibold text-slate-600 transition hover:bg-blue-50/80 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-300 dark:bg-white/70 dark:text-slate-700 dark:hover:bg-white"
          >
            Skip barriers and save
          </button>
        </div>
      </div>
    </main>
  );
}
