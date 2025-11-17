"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, TrendingUp, Lightbulb, Calendar } from "lucide-react";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { getCheckinsForRange, type CheckinWithRelations } from "@/lib/supabase";
import { formatDateToLocalString } from "@/lib/date-utils";

interface BarrierPattern {
  barrierName: string;
  count: number;
  energyLevels: Record<string, number>;
  recentDates: string[];
}

const BARRIER_STRATEGIES: Record<string, { tip: string; action: string }> = {
  'too-vague': {
    tip: 'Break it into tiny, concrete steps',
    action: 'Ask yourself: What\'s the very first physical action?',
  },
  'boring': {
    tip: 'Add stimulation: music, body doubling, change location',
    action: 'Gamify it: race the clock, create mini-challenges',
  },
  'overwhelming': {
    tip: 'Break it into ridiculously small pieces',
    action: 'Do just one tiny part (not the whole thing)',
  },
  'boring-and-hard': {
    tip: 'Schedule during peak energy (not foggy/resting)',
    action: 'Use external accountability (body double, deadline)',
  },
  'requires-focus': {
    tip: 'Save for sparky/steady energy times',
    action: 'Eliminate distractions (phone away, close tabs)',
  },
  'anxiety-inducing': {
    tip: 'Start with the smallest possible version',
    action: 'Have a support person nearby or on call',
  },
  'decision-fatigue': {
    tip: 'Limit yourself to two choices',
    action: 'Flip a coin and work with whichever side lands first',
  },
  'no-motivation': {
    tip: 'Pair the task with comfort: music, warm drink',
    action: 'Set a small reward waiting after completion',
  },
};

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
        console.error('Error loading barrier insights:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load insights';
        setError(errorMessage);
        setCheckins([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  // Analyze barrier patterns
  const barrierPatterns = useMemo(() => {
    const barrierMap: Record<string, BarrierPattern> = {};

    checkins.forEach((checkin) => {
      const energyLevel = checkin.internal_weather || 'unknown';
      checkin.focus_items?.forEach((item) => {
        item.focus_barriers?.forEach((barrier) => {
          const barrierName = barrier.barrier_types?.label || barrier.custom_barrier || 'Other';
          
          if (!barrierMap[barrierName]) {
            barrierMap[barrierName] = {
              barrierName,
              count: 0,
              energyLevels: {},
              recentDates: [],
            };
          }

          barrierMap[barrierName].count += 1;
          barrierMap[barrierName].energyLevels[energyLevel] = 
            (barrierMap[barrierName].energyLevels[energyLevel] || 0) + 1;
          
          if (checkin.checkin_date) {
            barrierMap[barrierName].recentDates.push(checkin.checkin_date);
          }
        });
      });
    });

    // Sort by frequency and limit to most recent dates
    return Object.values(barrierMap)
      .map(pattern => ({
        ...pattern,
        recentDates: [...new Set(pattern.recentDates)].slice(-5).reverse(),
      }))
      .sort((a, b) => b.count - a.count);
  }, [checkins]);

  // Find most common energy level for each barrier
  const getMostCommonEnergy = (pattern: BarrierPattern): string | null => {
    const entries = Object.entries(pattern.energyLevels);
    if (!entries.length) return null;
    return entries.sort((a, b) => b[1] - a[1])[0][0];
  };

  // Get strategy for barrier
  const getBarrierStrategy = (barrierName: string) => {
    // Try to match barrier name to strategy
    const normalized = barrierName.toLowerCase().replace(/\s+/g, '-');
    return BARRIER_STRATEGIES[normalized] || {
      tip: 'Notice when this barrier appears',
      action: 'Try breaking the task into smaller pieces',
    };
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600 dark:text-slate-400" role="status" aria-live="polite">
          Analyzing your barriers...
        </p>
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
              className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-400"
              aria-label="Go back to home"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <p className="text-sm uppercase tracking-wide text-amber-600 dark:text-amber-400">Barrier Insights</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Barrier Insights</h1>
            </div>
          </header>
          <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 dark:bg-rose-900/30 dark:border-rose-700/50" role="alert">
            <p className="text-sm font-medium text-rose-800 dark:text-rose-200 mb-2">Unable to load insights</p>
            <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600"
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
            <p className="text-sm uppercase tracking-wide text-amber-600 dark:text-amber-400">Insights</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Barrier Insights</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Last 30 days of barrier patterns</p>
          </div>
        </header>

        {barrierPatterns.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-white/40 bg-white/60 p-8 text-center text-slate-600 dark:border-slate-600/40 dark:bg-slate-800/60 dark:text-slate-400">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
            <p className="mb-2 font-medium">No barriers tracked yet.</p>
            <p className="text-sm">Start identifying barriers when planning your focus items to see insights here!</p>
          </section>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/20 bg-white/80 p-4 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Barriers</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {barrierPatterns.reduce((sum, p) => sum + p.count, 0)}
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/80 p-4 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80">
                <p className="text-sm text-slate-600 dark:text-slate-400">Unique Types</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {barrierPatterns.length}
                </p>
              </div>
            </div>

            {/* Barrier Patterns */}
            <div className="space-y-4">
              {barrierPatterns.map((pattern, index) => {
                const mostCommonEnergy = getMostCommonEnergy(pattern);
                const strategy = getBarrierStrategy(pattern.barrierName);
                const maxCount = barrierPatterns[0]?.count || 1;
                const widthPercent = (pattern.count / maxCount) * 100;

                return (
                  <section
                    key={pattern.barrierName}
                    className="rounded-3xl border border-white/20 bg-white/80 p-6 backdrop-blur dark:border-slate-600/40 dark:bg-slate-800/80"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                            {pattern.barrierName}
                          </h2>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {pattern.count} {pattern.count === 1 ? 'time' : 'times'}
                          </span>
                          {mostCommonEnergy && (
                            <span className="flex items-center gap-1">
                              <span>Most common when:</span>
                              <span className="font-medium capitalize">{mostCommonEnergy}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Frequency Bar */}
                    <div className="mb-4 space-y-1">
                      <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Strategy */}
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/40 dark:bg-amber-900/20">
                      <div className="mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Strategy</p>
                      </div>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                        💡 {strategy.tip}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        → {strategy.action}
                      </p>
                    </div>

                    {/* Recent occurrences */}
                    {pattern.recentDates.length > 0 && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span>Recent:</span>
                        <span className="font-medium">
                          {pattern.recentDates.slice(0, 3).map(date => {
                            const d = new Date(date);
                            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }).join(', ')}
                        </span>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {/* Insight Summary */}
            {barrierPatterns.length > 0 && (
              <section className="rounded-3xl border border-cyan-200 bg-cyan-50/50 p-6 dark:border-cyan-800/40 dark:bg-cyan-900/20">
                <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                  Key Insight
                </h2>
                {barrierPatterns[0] && (
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Your most common barrier is <strong>{barrierPatterns[0].barrierName}</strong>, appearing{' '}
                    {barrierPatterns[0].count} {barrierPatterns[0].count === 1 ? 'time' : 'times'} in the last 30 days.
                    {getMostCommonEnergy(barrierPatterns[0]) && (
                      <> It often appears when your energy is <strong className="capitalize">{getMostCommonEnergy(barrierPatterns[0])}</strong>.</>
                    )}
                  </p>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
