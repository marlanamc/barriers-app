"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCheckIn } from "@/lib/checkin-context";
import { getBarrierTypes, type BarrierType } from "@/lib/supabase";

export default function BarrierScreen() {
  const router = useRouter();
  const { focusItems, setBarrierForFocusItem } = useCheckIn();
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);

  useEffect(() => {
    if (!focusItems.length) {
      router.replace("/focus");
    }
  }, [focusItems.length, router]);

  useEffect(() => {
    getBarrierTypes().then(setBarrierTypes);
  }, []);

  const canProceed = useMemo(() =>
    focusItems.length > 0 && focusItems.every((item) => {
      const barrier = item.barrier;
      if (!barrier) return false;
      return Boolean(barrier.barrierTypeSlug) || Boolean(barrier.custom?.trim());
    }),
  [focusItems]
  );

  if (!focusItems.length) {
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
            <p className="text-sm uppercase tracking-wide text-cyan-600">Step 3</p>
            <h1 className="text-2xl font-bold text-slate-900">What feels hard?</h1>
            <p className="text-sm text-slate-600">Match each focus with a barrier or short note.</p>
          </div>
        </header>

        <section className="space-y-4">
          {focusItems.map((item) => {
            const selectedSlug = item.barrier?.barrierTypeSlug || "";
            const custom = item.barrier?.custom || "";
            return (
              <div
                key={item.id}
                className="space-y-4 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-sm"
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Focus</p>
                  <p className="text-lg font-semibold text-slate-900">{item.description}</p>
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
                        custom: event.target.value,
                      })
                    }
                    placeholder="Overwhelmed, low energy, waiting on a reply..."
                    className="mt-2 w-full rounded-2xl border border-white/40 bg-white/80 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  />
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
