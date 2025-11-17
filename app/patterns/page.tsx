"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp, AlertTriangle, Tag, Zap } from "lucide-react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCheckinsForRange, type CheckinWithRelations } from "@/lib/supabase";
import { formatDateToLocalString } from "@/lib/date-utils";

export default function PatternsPage() {
  const { user, loading: authLoading } = useSupabaseUser();
  const [checkins, setCheckins] = useState<CheckinWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      setLoading(true);
      setError(null);

      try {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29); // Last 30 days

        const data = await getCheckinsForRange(
          user.id,
          formatDateToLocalString(start),
          formatDateToLocalString(end)
        );
        setCheckins(data || []);
      } catch (err) {
        console.error('Error loading patterns:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load patterns';
        setError(errorMessage);
        setCheckins([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const weatherCounts = useMemo(() => {
    return checkins.reduce<Record<string, { icon: string | null; count: number }>>((acc, checkin) => {
      if (!checkin?.internal_weather) return acc;
      const key = checkin.internal_weather;
      if (!acc[key]) {
        acc[key] = { icon: checkin.weather_icon || null, count: 0 };
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

  // Barrier insights
  const barrierInsights = useMemo(() => {
    const barrierCounts: Record<string, number> = {};
    checkins.forEach((checkin) => {
      checkin.focus_items?.forEach((item) => {
        item.focus_barriers?.forEach((barrier) => {
          const name = barrier.barrier_types?.label || barrier.custom_barrier || 'Other';
          barrierCounts[name] = (barrierCounts[name] || 0) + 1;
        });
      });
    });
    return Object.entries(barrierCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [checkins]);

  // Category insights
  const categoryInsights = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    checkins.forEach((checkin) => {
      checkin.focus_items?.forEach((item) => {
        item.categories?.forEach((cat) => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      });
    });
    return Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [checkins]);

  // Productivity stats
  const productivityStats = useMemo(() => {
    const totalFocusItems = checkins.reduce(
      (sum, checkin) => sum + (checkin.focus_items?.length || 0),
      0
    );
    const totalDays = checkins.length;
    const avgPerDay = totalDays > 0 ? (totalFocusItems / totalDays).toFixed(1) : '0';

    return {
      totalFocusItems,
      totalDays,
      avgPerDay,
    };
  }, [checkins]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600" role="status" aria-live="polite">Looking for patterns...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen px-4 pb-16 pt-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <header className="flex items-center gap-4">
            <Link
              href="/"
              className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5"
              aria-label="Go back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm uppercase tracking-wide text-cyan-600">Patterns</p>
              <h1 className="text-2xl font-bold text-slate-900">Patterns</h1>
            </div>
          </header>
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6" role="alert">
            <p className="text-sm font-medium text-rose-800 mb-2">Unable to load patterns</p>
            <p className="text-sm text-rose-700">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 pb-24 pt-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <header className="flex items-center gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-400"
            aria-label="Go back to home"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-sm uppercase tracking-wide text-cyan-600 dark:text-cyan-400">Insights</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Patterns</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Last 30 days of check-in data</p>
          </div>
        </header>

        {checkins.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-white/40 bg-white/60 p-8 text-center text-slate-600 dark:border-slate-600/40 dark:bg-slate-800/60 dark:text-slate-400">
            <p className="mb-2">No check-ins yet.</p>
            <p className="text-sm">Start tracking your energy to see insights here!</p>
          </section>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/80 p-4 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <p className="text-sm text-slate-600 dark:text-slate-400">Check-ins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{productivityStats.totalDays}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/80 p-4 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <p className="text-sm text-slate-600 dark:text-slate-400">Focus Items</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{productivityStats.totalFocusItems}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/80 p-4 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg/Day</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{productivityStats.avgPerDay}</p>
              </div>
            </div>

            {/* Energy Patterns */}
            {mostCommon && (
              <section className="rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <div className="mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Energy Patterns</h2>
                </div>
                <div className="mb-4 flex items-center gap-4 rounded-2xl bg-cyan-50 p-4 dark:bg-cyan-900/20">
                  <div className="text-4xl">{mostCommon[1].icon || "☁️"}</div>
                  <div>
                    <p className="text-sm text-cyan-700 dark:text-cyan-300">Most Common</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{mostCommon[0]}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{mostCommon[1].count} days</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {Object.entries(weatherCounts).map(([weatherName, info]) => {
                    const max = Math.max(...Object.values(weatherCounts).map((value) => value.count));
                    const width = `${(info.count / max) * 100}%`;
                    return (
                      <div key={weatherName} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-700 dark:text-slate-300">
                            {info.icon || "☁️"} {weatherName}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">{info.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400" style={{ width }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top Categories */}
            {categoryInsights.length > 0 && (
              <section className="rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <div className="mb-4 flex items-center gap-2">
                  <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Top Focus Areas</h2>
                </div>
                <div className="space-y-2">
                  {categoryInsights.map(([category, count]) => {
                    const max = categoryInsights[0][1];
                    const width = `${(count / max) * 100}%`;
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{category}</span>
                          <span className="text-slate-600 dark:text-slate-400">{count} items</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-pink-400" style={{ width }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Top Barriers */}
            {barrierInsights.length > 0 && (
              <section className="rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Common Barriers</h2>
                </div>
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
                  These are the challenges you've identified most often
                </p>
                <div className="space-y-2">
                  {barrierInsights.map(([barrier, count]) => {
                    const max = barrierInsights[0][1];
                    const width = `${(count / max) * 100}%`;
                    return (
                      <div key={barrier} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{barrier}</span>
                          <span className="text-slate-600 dark:text-slate-400">{count}×</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                          <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400" style={{ width }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
