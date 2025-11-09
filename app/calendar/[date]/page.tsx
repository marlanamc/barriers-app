"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCheckinByDate, type CheckinWithRelations } from "@/lib/supabase";

export default function CalendarDetailPage() {
  const params = useParams();
  const date = params.date as string;
  const { user, loading: authLoading } = useSupabaseUser();
  const [checkin, setCheckin] = useState<CheckinWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user || !date) return;
      setLoading(true);
      const data = await getCheckinByDate(user.id, date);
      setCheckin(data);
      setLoading(false);
    }

    load();
  }, [date, user]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600">Loading your check-in...</p>
      </main>
    );
  }

  const displayDate = new Date(date).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/calendar"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600">Daily detail</p>
            <h1 className="text-2xl font-bold text-slate-900">{displayDate}</h1>
          </div>
        </header>

        {checkin ? (
          <div className="space-y-4">
            <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{checkin.weather_icon}</div>
                <div>
                  <p className="text-sm uppercase tracking-wide text-slate-500">Internal weather</p>
                  <p className="text-xl font-semibold text-slate-900">{checkin.internal_weather}</p>
                  {checkin.forecast_note && (
                    <p className="text-sm text-slate-600">{checkin.forecast_note}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="space-y-3">
              {checkin.focus_items.map((item) => {
                const barrier = item.focus_barriers[0];
                return (
                  <div key={item.id} className="rounded-3xl border border-white/30 bg-white/80 p-5 shadow-sm">
                    <p className="text-base font-semibold text-slate-900">{item.description}</p>
                    {item.categories.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        {item.categories.map((category) => (
                          <span key={category} className="rounded-full bg-slate-100 px-3 py-1">
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                    {barrier && (
                      <div className="mt-3 text-sm text-slate-600">
                        <p className="font-semibold text-slate-700">Barrier</p>
                        <p>
                          {barrier.barrier_types?.icon && <span className="mr-1">{barrier.barrier_types.icon}</span>}
                          {barrier.barrier_types?.label || barrier.custom_barrier}
                        </p>
                        {barrier.custom_barrier && (
                          <p className="text-xs text-slate-500">{barrier.custom_barrier}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </section>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/40 bg-white/60 p-6 text-center">
            <p className="text-slate-600">No check-in found for this day.</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Start today&rsquo;s flow
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
