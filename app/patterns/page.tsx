"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCheckinsForRange, type CheckinWithRelations } from "@/lib/supabase";

export default function PatternsPage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const [checkins, setCheckins] = useState<CheckinWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 6);

      const data = await getCheckinsForRange(
        user.id,
        start.toISOString().split("T")[0],
        end.toISOString().split("T")[0]
      );
      setCheckins(data);
      setLoading(false);
    }

    load();
  }, [user]);

  const weatherCounts = useMemo(() => {
    return checkins.reduce<Record<string, { icon: string | null; count: number }>>((acc, checkin) => {
      const key = checkin.internal_weather;
      if (!acc[key]) {
        acc[key] = { icon: checkin.weather_icon, count: 0 };
      }
      acc[key].count += 1;
      return acc;
    }, {});
  }, [checkins]);

  const mostCommon = useMemo(() => {
    const entries = Object.entries(weatherCounts);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1].count - a[1].count)[0];
  }, [weatherCounts]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600">Looking for patterns...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600">Step 6</p>
            <h1 className="text-2xl font-bold text-slate-900">Patterns</h1>
            <p className="text-sm text-slate-600">Seven-day view of your internal weather.</p>
          </div>
        </header>

        {mostCommon ? (
          <section className="rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-cyan-600">Most common this week</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-5xl">{mostCommon[1].icon || "☁️"}</div>
              <div>
                <p className="text-3xl font-bold text-slate-900">{mostCommon[0]}</p>
                <p className="text-slate-500">{mostCommon[1].count} day(s)</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-3xl border border-dashed border-white/40 bg-white/60 p-6 text-center text-slate-600">
            No check-ins yet this week. Start with today&rsquo;s weather.
          </section>
        )}

        <section className="space-y-3 rounded-3xl border border-white/20 bg-white/80 p-6 shadow-sm">
          <div className="mb-2 flex items-center gap-2 text-slate-600">
            <TrendingUp className="h-4 w-4" />
            Week in review
          </div>
          {Object.entries(weatherCounts).length === 0 ? (
            <p className="text-sm text-slate-500">Log a few days to unlock this mini chart.</p>
          ) : (
            Object.entries(weatherCounts).map(([weatherName, info]) => {
              const max = Math.max(...Object.values(weatherCounts).map((value) => value.count));
              const width = `${(info.count / max) * 100}%`;
              return (
                <div key={weatherName} className="space-y-1">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>
                      {info.icon || "☁️"} {weatherName}
                    </span>
                    <span>{info.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-indigo-200" style={{ width }} />
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}
