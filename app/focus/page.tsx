"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCheckIn, MAX_FOCUS_ITEMS } from "@/lib/checkin-context";

const categoryOptions = ["Body", "Home", "Work", "Relationships", "Admin", "Play"];

export default function FocusScreen() {
  const router = useRouter();
  const { focusItems, addFocusItem, removeFocusItem } = useCheckIn();
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = () => {
    if (!text.trim()) return;
    addFocusItem(text, tags);
    setText("");
    setTags([]);
  };

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
            <p className="text-sm uppercase tracking-wide text-cyan-600">Step 2</p>
            <h1 className="text-2xl font-bold text-slate-900">What matters today?</h1>
            <p className="text-sm text-slate-600">Capture up to three gentle focus points.</p>
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
                {categoryOptions.map((category) => {
                  const active = tags.includes(category);
                  return (
                    <button
                      type="button"
                      key={category}
                      onClick={() => toggleTag(category)}
                      className={`rounded-full px-4 py-1.5 font-medium transition ${
                        active
                          ? "bg-cyan-100 text-cyan-800"
                          : "bg-white/70 text-slate-600 hover:bg-white"
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={!text.trim() || focusItems.length >= MAX_FOCUS_ITEMS}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-cyan-200 bg-white/80 px-4 py-3 font-semibold text-cyan-700 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Add focus
              <span className="text-sm text-cyan-500">{focusItems.length}/{MAX_FOCUS_ITEMS}</span>
            </button>
          </div>
        </section>

        {focusItems.length > 0 && (
          <section className="space-y-3">
            {focusItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-3xl border border-white/30 bg-white/80 p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold text-slate-900">{item.description}</p>
                    {item.categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                        {item.categories.map((category) => (
                          <span
                            key={category}
                            className="rounded-full bg-slate-100 px-3 py-1 text-slate-600"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFocusItem(item.id)}
                    className="rounded-full bg-white/70 p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <button
          type="button"
          onClick={() => router.push("/barriers")}
          disabled={focusItems.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next: What Feels Hard?
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </main>
  );
}
