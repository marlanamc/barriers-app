"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCheckIn } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import {
  getBarrierTypes,
  getTipsForBarrierTypes,
  saveCheckinWithFocus,
  type BarrierType,
  type BarrierTipMessage,
} from "@/lib/supabase";

export default function GentleSupportScreen() {
  const router = useRouter();
  const { weather, forecastNote, focusItems, resetCheckIn } = useCheckIn();
  const { user, loading: authLoading, error: authError } = useSupabaseUser();
  const [barrierTypes, setBarrierTypes] = useState<BarrierType[]>([]);
  const [tipsBySlug, setTipsBySlug] = useState<Record<string, BarrierTipMessage>>({});
  const [loadingTips, setLoadingTips] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (!weather) {
      router.replace("/");
    } else if (!focusItems.length) {
      router.replace("/focus");
    }
  }, [done, focusItems.length, router, weather]);

  useEffect(() => {
    let mounted = true;

    async function loadTips() {
      setLoadingTips(true);
      const types = await getBarrierTypes();
      if (!mounted) return;
      setBarrierTypes(types);

      const slugSet = new Set(
        focusItems
          .map((item) => item.barrier?.barrierTypeSlug)
          .filter(Boolean) as string[]
      );

      if (!slugSet.size) {
        setLoadingTips(false);
        return;
      }

      const relevantTypes = types.filter((type) => slugSet.has(type.slug));
      const tips = await getTipsForBarrierTypes(relevantTypes);
      if (!mounted) return;

      const map: Record<string, BarrierTipMessage> = {};
      tips.forEach((tip) => {
        map[tip.slug] = tip;
      });

      setTipsBySlug(map);
      setLoadingTips(false);
    }

    loadTips();

    return () => {
      mounted = false;
    };
  }, [focusItems]);

  const barrierBySlug = useMemo(() => {
    return barrierTypes.reduce<Record<string, BarrierType>>((acc, type) => {
      acc[type.slug] = type;
      return acc;
    }, {});
  }, [barrierTypes]);

  if (!weather || !focusItems.length) {
    return null;
  }

  const canSave = Boolean(user) && !saving && focusItems.every((item) => {
    const barrier = item.barrier;
    if (!barrier) return false;
    return Boolean(barrier.barrierTypeSlug) || Boolean(barrier.custom?.trim());
  });

  async function handleSave() {
    if (!user || !canSave || !weather) return;
    setSaving(true);
    setSaveError(null);

    try {
      await saveCheckinWithFocus({
        userId: user.id,
        internalWeather: weather,
        forecastNote,
        focusItems: focusItems.map((item) => ({
          id: item.id,
          description: item.description,
          categories: item.categories,
          sortOrder: item.sortOrder,
          barrier: item.barrier || null,
        })),
      });
      setDone(true);
      resetCheckIn();
      setTimeout(() => router.push("/calendar"), 1200);
    } catch (error: any) {
      console.error(error);
      setSaveError(error.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/barriers"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600">Step 4</p>
            <h1 className="text-2xl font-bold text-slate-900">Gentle support</h1>
            <p className="text-sm text-slate-600">Soft reminders matched to each barrier.</p>
          </div>
        </header>

        <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{weather.icon}</div>
            <div>
              <p className="text-sm uppercase tracking-wide text-slate-500">Internal weather</p>
              <p className="text-xl font-semibold text-slate-900">{weather.label}</p>
              <p className="text-sm text-slate-600">{weather.description}</p>
            </div>
          </div>
          {forecastNote && (
            <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {forecastNote}
            </p>
          )}
        </section>

        <section className="space-y-4">
          {focusItems.map((item) => {
            const slug = item.barrier?.barrierTypeSlug;
            const friendlyBarrier = slug ? barrierBySlug[slug] : null;
            const tip = slug ? tipsBySlug[slug] : null;
            return (
              <div
                key={item.id}
                className="space-y-3 rounded-3xl border border-white/30 bg-white/80 p-6 shadow-sm"
              >
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Focus</p>
                  <p className="text-lg font-semibold text-slate-900">{item.description}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-800">Barrier</p>
                  <p>
                    {friendlyBarrier?.icon && <span className="mr-1">{friendlyBarrier.icon}</span>}
                    {friendlyBarrier?.label || item.barrier?.custom || "Custom reflection"}
                  </p>
                  {item.barrier?.custom && (
                    <p className="mt-1 text-slate-500">{item.barrier.custom}</p>
                  )}
                </div>

                <div className="rounded-2xl border border-dashed border-cyan-100 bg-white px-4 py-4 text-slate-700">
                  <div className="mb-2 flex items-center gap-2 text-cyan-600">
                    <Sparkles className="h-4 w-4" />
                    Gentle support
                  </div>
                  {loadingTips ? (
                    <p className="text-sm text-slate-500">Finding a tip...</p>
                  ) : (
                    <p className="text-sm leading-relaxed">
                      {tip?.message ||
                        "Offer yourself one small kindness. You can pause, breathe, and return when it feels lighter."}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {authError && (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {authError}. Saving may require configuring Supabase credentials.
          </p>
        )}

        {saveError && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{saveError}</p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving && <Loader2 className="h-5 w-5 animate-spin" />}
          {done ? "Saved" : "Save check-in"}
          {done && <Check className="h-5 w-5" />}
        </button>
      </div>
    </main>
  );
}
