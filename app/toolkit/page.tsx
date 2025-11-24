'use client';

import { Ship, ChevronRight, Star, Target, Anchor, Heart, Users, Sparkles, Map } from 'lucide-react';
import Link from 'next/link';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useMapData } from '@/hooks/useMapData';
import { useFuelCheck } from '@/hooks/useFuelCheck';

export default function ToolkitPage() {
  const { user, loading: userLoading } = useSupabaseUser();
  const { data, hasContent, loading: mapLoading } = useMapData(user?.id);
  const { fuelStatus, fuelPercentage, toggleFuel, loading: fuelLoading } = useFuelCheck(user?.id);

  const loading = userLoading || mapLoading || fuelLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-cyan-50 to-white dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
        <div className="text-center">
          <Ship className="mx-auto h-8 w-8 animate-pulse text-amber-500 dark:text-amber-400" />
          <p className="mt-3 text-sky-600/70 dark:text-sky-300/70">Loading your cabin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 via-cyan-50 to-white dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
        <div className="text-center">
          <p className="text-sky-600/70 dark:text-sky-300/70">Please sign in to view your cabin</p>
        </div>
      </div>
    );
  }

  // Get recent starlight win
  const recentWin = data.starlight?.[0];

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-sky-50 via-cyan-50 to-white dark:from-[#0a1628] dark:via-[#0f2847] dark:to-[#1a3a5c]">
      {/* Ocean background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-200/30 via-transparent to-transparent dark:from-sky-800/30" />
        {/* Subtle wave pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent dark:from-[#0a1628]/50" />
      </div>

      {/* Header */}
      <header className="relative pt-8 px-4 pb-6 z-10">
        <div className="mx-auto max-w-lg pl-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ship className="h-7 w-7 text-amber-500 dark:text-amber-400" />
              <div>
                <h1 className="font-cinzel text-xl font-bold text-amber-900 dark:text-amber-100">
                  Captain&apos;s Cabin
                </h1>
                <p className="text-xs text-sky-600 dark:text-sky-300">
                  Daily check-in & reminders
                </p>
              </div>
            </div>
            <div className="rounded-full bg-slate-900/10 dark:bg-white/10 px-3 py-1 text-xs text-sky-700 dark:text-sky-200 backdrop-blur-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-lg px-4 space-y-6">

        {/* Fuel Check Panel */}
        <section className="rounded-2xl bg-white/80 dark:bg-sky-950/40 p-5 backdrop-blur-sm ring-1 ring-sky-200 dark:ring-sky-500/20 shadow-sm dark:shadow-none">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-cinzel text-sm font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-200">
              Fuel Check
            </h2>
            <div className="flex items-center gap-2">
              <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${fuelPercentage}%` }}
                />
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-300">{fuelPercentage}%</span>
            </div>
          </div>

          <div className="flex gap-2">
            {[
              { key: 'water' as const, icon: '💧', label: 'Water' },
              { key: 'food' as const, icon: '🍽️', label: 'Food' },
              { key: 'meds' as const, icon: '💊', label: 'Meds' },
              { key: 'movement' as const, icon: '🚶', label: 'Move' },
              { key: 'sleep' as const, icon: '😴', label: 'Sleep' },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => toggleFuel(item.key)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 transition-all ${
                  fuelStatus[item.key]
                    ? 'bg-emerald-100 dark:bg-emerald-500/20 ring-1 ring-emerald-400 dark:ring-emerald-500/50'
                    : 'bg-sky-100 dark:bg-sky-900/30 hover:bg-sky-200 dark:hover:bg-sky-800/40'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Your Compass - Identity Highlights */}
        <section className="rounded-2xl bg-white/80 dark:bg-sky-950/40 p-5 backdrop-blur-sm ring-1 ring-sky-200 dark:ring-sky-500/20 shadow-sm dark:shadow-none">
          <h2 className="mb-4 font-cinzel text-sm font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-200">
            Your Compass
          </h2>

          <div className="space-y-3">
            {/* North Star */}
            <Link
              href="/map/north-star"
              className="flex items-center gap-3 rounded-xl bg-sky-100 dark:bg-sky-900/30 p-4 transition-all hover:bg-sky-200 dark:hover:bg-sky-800/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-500/20">
                <Star className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sky-600 dark:text-sky-300">North Star</p>
                {hasContent.north_star && data.toolkit?.north_star ? (
                  <p className="truncate text-sm text-slate-700 dark:text-slate-200">{data.toolkit.north_star}</p>
                ) : (
                  <p className="text-sm text-sky-500/60 dark:text-sky-400/60">Set up in Map →</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-sky-500/50 dark:text-sky-400/50" />
            </Link>

            {/* Destination */}
            <Link
              href="/map/destination"
              className="flex items-center gap-3 rounded-xl bg-sky-100 dark:bg-sky-900/30 p-4 transition-all hover:bg-sky-200 dark:hover:bg-sky-800/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                <Target className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sky-600 dark:text-sky-300">Destination</p>
                {hasContent.destination && (data.destination as { text?: string })?.text ? (
                  <p className="truncate text-sm text-slate-700 dark:text-slate-200">{(data.destination as { text: string }).text}</p>
                ) : (
                  <p className="text-sm text-sky-500/60 dark:text-sky-400/60">Set up in Map →</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-sky-500/50 dark:text-sky-400/50" />
            </Link>

            {/* Anchor */}
            <Link
              href="/map/anchor"
              className="flex items-center gap-3 rounded-xl bg-sky-100 dark:bg-sky-900/30 p-4 transition-all hover:bg-sky-200 dark:hover:bg-sky-800/40"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-500/20">
                <Anchor className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-sky-600 dark:text-sky-300">Anchor Question</p>
                {hasContent.anchor && data.toolkit?.anchor_question ? (
                  <p className="truncate text-sm text-slate-700 dark:text-slate-200">{data.toolkit.anchor_question}</p>
                ) : (
                  <p className="text-sm text-sky-500/60 dark:text-sky-400/60">Set up in Map →</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-sky-500/50 dark:text-sky-400/50" />
            </Link>
          </div>
        </section>

        {/* Quick Access */}
        <section className="rounded-2xl bg-white/80 dark:bg-sky-950/40 p-5 backdrop-blur-sm ring-1 ring-sky-200 dark:ring-sky-500/20 shadow-sm dark:shadow-none">
          <h2 className="mb-4 font-cinzel text-sm font-semibold uppercase tracking-wider text-sky-700 dark:text-sky-200">
            Quick Access
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Life Vest */}
            <Link
              href="/map/life-vest"
              className="rounded-xl bg-sky-100 dark:bg-sky-900/30 p-4 transition-all hover:bg-sky-200 dark:hover:bg-sky-800/40"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-500/20">
                <Heart className="h-5 w-5 text-rose-500 dark:text-rose-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Life Vest</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data.life_vest.length} {data.life_vest.length === 1 ? 'tool' : 'tools'} ready
              </p>
            </Link>

            {/* Crew */}
            <Link
              href="/map/crew"
              className="rounded-xl bg-sky-100 dark:bg-sky-900/30 p-4 transition-all hover:bg-sky-200 dark:hover:bg-sky-800/40"
            >
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Crew</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {data.crew.length} {data.crew.length === 1 ? 'contact' : 'contacts'}
              </p>
            </Link>
          </div>

          {/* Recent Win */}
          {recentWin && (
            <Link
              href="/map/starlight"
              className="mt-3 flex items-center gap-3 rounded-xl bg-amber-100 dark:bg-amber-500/10 p-3 transition-all hover:bg-amber-200 dark:hover:bg-amber-500/20"
            >
              <Sparkles className="h-4 w-4 text-amber-500 dark:text-amber-400" />
              <p className="flex-1 truncate text-sm text-amber-700 dark:text-amber-200">
                {recentWin.description}
              </p>
            </Link>
          )}
        </section>

        {/* View Full Map Link */}
        <Link
          href="/map"
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 p-4 text-sm font-medium text-white shadow-lg shadow-cyan-500/30 dark:shadow-cyan-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Map className="h-5 w-5" />
          View Full Map
        </Link>
      </main>
    </div>
  );
}
