'use client';

import { LineChart, Calendar, Activity, TrendingUp, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { usePatterns, DailyReflect } from '@/hooks/usePatterns';
import { PageBackground } from '@/components/PageBackground';

// Signal labels for display
const NERVOUS_SYSTEM_SIGNALS: Record<string, string> = {
  'jaw_tight': 'Jaw tight',
  'shoulders_raised': 'Shoulders raised',
  'stomach_tight': 'Stomach tight',
  'eyes_tired': 'Eyes tired',
  'mind_racing': 'Mind racing',
  'zoning_out': 'Zoning out',
  'heavy_body': 'Heavy/sluggish',
  'restless': 'Restless/fidgety',
  'calm_neutral': 'Calm/neutral',
};

// Day type config
const DAY_TYPE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  'a_little': { label: 'Got things done', emoji: '✓', color: 'emerald' },
  'not_much': { label: 'Struggled', emoji: '~', color: 'amber' },
  'running_on_empty': { label: 'Survival mode', emoji: '○', color: 'violet' },
};

// Helper to format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Helper to get day of week
function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('en-US', { weekday: 'short' });
}

export default function PatternsPage() {
  const { user } = useAuth();
  const { data, loading, error } = usePatterns(user?.id);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <PageBackground symbol="ocean-currents" />
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-200 dark:border-emerald-800 border-t-emerald-600 dark:border-t-emerald-400 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-crimson">Loading patterns...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <PageBackground symbol="ocean-currents" />
        <div className="relative z-10 text-center max-w-sm">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  const hasData = data && data.totalDays > 0;

  return (
    <>
      <PageBackground symbol="ocean-currents" />
      <main className="relative min-h-screen pb-24">

      <div className="relative mx-auto max-w-lg px-4 pt-6">
        {/* Header - offset for side panel */}
        <div className="mb-6 pl-12 sm:pl-14">
          <div className="flex items-center gap-2 mb-1">
            <LineChart className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
            <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-cinzel">
              Patterns
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson">
            Gentle insights from your reflections
          </p>
        </div>

        {!hasData ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {/* Weekly Overview */}
            <WeeklyOverview reflects={data.weeklyReflects} />

            {/* Body Signal Patterns */}
            <SignalPatterns signals={data.signalCounts} totalDays={data.totalDays} />

            {/* Day Type Breakdown */}
            <DayTypeBreakdown dayTypes={data.dayTypeCounts} totalDays={data.totalDays} />

            {/* Recent Reflections */}
            <RecentReflections reflects={data.allReflects.slice(0, 10)} />
          </div>
        )}
      </div>
    </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-100 dark:border-slate-700 p-8 text-center">
      <div className="mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-4 inline-flex">
        <TrendingUp className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 font-cinzel mb-2">
        No patterns yet
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 font-crimson mb-4">
        Complete your first evening reflection to start seeing patterns.
      </p>
      <Link
        href="/reflect"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-sm font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors"
      >
        Start Reflecting
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function WeeklyOverview({ reflects }: { reflects: DailyReflect[] }) {
  // Generate last 7 days
  const days: { date: string; dayLabel: string; reflect: DailyReflect | null }[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const reflect = reflects.find(r => r.reflect_date === dateStr) || null;

    days.push({
      date: dateStr,
      dayLabel: getDayOfWeek(dateStr),
      reflect,
    });
  }

  return (
    <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-100 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          This Week
        </h3>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {days.map(({ date, dayLabel, reflect }) => {
          const dayType = reflect?.bandwidth;
          const config = dayType ? DAY_TYPE_CONFIG[dayType] : null;

          return (
            <div key={date} className="text-center">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1.5 font-crimson">
                {dayLabel}
              </p>
              <div
                className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium transition-colors ${
                  config
                    ? config.color === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : config.color === 'amber'
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      : 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                    : 'bg-slate-100 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500'
                }`}
              >
                {config ? config.emoji : '—'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900/40"></span>
          <span className="text-slate-600 dark:text-slate-400">Got things done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-amber-100 dark:bg-amber-900/40"></span>
          <span className="text-slate-600 dark:text-slate-400">Struggled</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-violet-100 dark:bg-violet-900/40"></span>
          <span className="text-slate-600 dark:text-slate-400">Survival mode</span>
        </div>
      </div>
    </section>
  );
}

function SignalPatterns({ signals, totalDays }: { signals: { signal: string; count: number; label: string }[]; totalDays: number }) {
  if (signals.length === 0) {
    return null;
  }

  // Show top 5 signals
  const topSignals = signals.slice(0, 5);

  return (
    <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-100 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          Body Signal Patterns
        </h3>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson mb-3">
        Most common signals over {totalDays} day{totalDays === 1 ? '' : 's'}
      </p>

      <div className="space-y-3">
        {topSignals.map(({ signal, count, label }) => {
          const percentage = Math.round((count / totalDays) * 100);

          return (
            <div key={signal}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-crimson">
                  {label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {count} day{count === 1 ? '' : 's'}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 dark:from-emerald-500 dark:to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DayTypeBreakdown({ dayTypes, totalDays }: { dayTypes: { type: string; count: number; label: string; color: string }[]; totalDays: number }) {
  if (dayTypes.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-100 dark:border-slate-700 p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel">
          Day Type Breakdown
        </h3>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson mb-3">
        How your days have gone
      </p>

      <div className="space-y-3">
        {dayTypes.map(({ type, count, label, color }) => {
          const percentage = Math.round((count / totalDays) * 100);

          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-crimson">
                  {label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {percentage}% ({count})
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    color === 'emerald'
                      ? 'bg-emerald-400 dark:bg-emerald-500'
                      : color === 'amber'
                      ? 'bg-amber-400 dark:bg-amber-500'
                      : 'bg-violet-400 dark:bg-violet-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function RecentReflections({ reflects }: { reflects: DailyReflect[] }) {
  if (reflects.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-emerald-100 dark:border-slate-700 p-5 shadow-sm">
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200 font-cinzel mb-3">
        Recent Reflections
      </h3>

      <div className="space-y-3">
        {reflects.map((reflect) => {
          const dayType = reflect.bandwidth;
          const config = dayType ? DAY_TYPE_CONFIG[dayType] : null;
          const signalCount = reflect.nervous_system_signals?.length || 0;

          return (
            <div
              key={reflect.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"
            >
              {/* Day type indicator */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                  config
                    ? config.color === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : config.color === 'amber'
                      ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                      : 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300'
                    : 'bg-slate-100 dark:bg-slate-600 text-slate-400'
                }`}
              >
                {config ? config.emoji : '—'}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-200">
                  {formatDate(reflect.reflect_date)}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {config ? config.label : 'No rating'}
                  {signalCount > 0 && ` • ${signalCount} signal${signalCount === 1 ? '' : 's'}`}
                </p>
              </div>

              {/* Tomorrow prep indicator */}
              {reflect.tomorrow_prep && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  +prep
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
