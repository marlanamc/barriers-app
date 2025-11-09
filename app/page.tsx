"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowRight, CalendarDays, LineChart } from "lucide-react";
import { InternalWeatherSelector } from "@/components/InternalWeatherSelector";
import { useCheckIn } from "@/lib/checkin-context";
import { useSupabaseUser } from "@/lib/useSupabaseUser";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const { weather, setWeather, forecastNote, setForecastNote } = useCheckIn();
  const { loading, error } = useSupabaseUser();

  const greeting = useMemo(() => getGreeting(), []);

  const handleNext = () => {
    if (!weather) return;
    router.push("/focus");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <p className="text-slate-600">Warming up your companion...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-16 pt-6">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-500">Barrier Companion</p>
            <h1 className="text-3xl font-bold text-slate-900">{greeting}</h1>
          </div>
          <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
            Morning Flow
          </div>
        </header>

        <section className="space-y-4 rounded-3xl border border-white/20 bg-white/70 p-6 backdrop-blur">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-cyan-600">Step 1</p>
            <h2 className="text-2xl font-bold text-slate-900">What&rsquo;s the weather inside today?</h2>
            <p className="text-slate-600">Tap the card that feels the closest match.</p>
          </div>

          <InternalWeatherSelector selectedKey={weather?.key} onSelect={setWeather} />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="forecast-note">
              Want to describe the forecast?
            </label>
            <textarea
              id="forecast-note"
              value={forecastNote}
              onChange={(event) => setForecastNote(event.target.value)}
              placeholder="Mentally foggy? Overstimulated? Drop a few words."
              className="w-full rounded-2xl border border-white/30 bg-white/70 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100"
              rows={3}
            />
          </div>

          {error && (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {error}. You can still explore the flow, but saving may not work until Supabase is configured.
            </p>
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={!weather}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next: What Matters Today
            <ArrowRight className="h-5 w-5" />
          </button>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href="/calendar"
            className="group rounded-3xl border border-white/30 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white"
          >
            <div className="mb-2 flex items-center gap-3 text-slate-600">
              <span className="rounded-full bg-cyan-100 p-2 text-cyan-700">
                <CalendarDays className="h-5 w-5" />
              </span>
              Calendar
            </div>
            <p className="text-lg font-semibold text-slate-900">See your daily weather</p>
            <p className="text-sm text-slate-600">Tap any day to review focus items and notes.</p>
          </Link>

          <Link
            href="/patterns"
            className="group rounded-3xl border border-white/30 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white"
          >
            <div className="mb-2 flex items-center gap-3 text-slate-600">
              <span className="rounded-full bg-indigo-100 p-2 text-indigo-700">
                <LineChart className="h-5 w-5" />
              </span>
              Patterns
            </div>
            <p className="text-lg font-semibold text-slate-900">Notice gentle trends</p>
            <p className="text-sm text-slate-600">Which internal weather shows up the most?</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
