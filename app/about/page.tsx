'use client';

import type { EnergyLevel } from '@/lib/capacity';
import { ENERGY_CAPACITY, COMPLEXITY_COST, MAX_FOCUS_ITEMS, getCapacityRangeText } from '@/lib/capacity';

const energyLevels: Array<{ key: EnergyLevel; label: string; color: string }> = [
  { key: 'sparky', label: 'Sparky', color: 'bg-yellow-400' },
  { key: 'steady', label: 'Steady', color: 'bg-green-400' },
  { key: 'flowing', label: 'Flowing', color: 'bg-blue-400' },
  { key: 'foggy', label: 'Foggy', color: 'bg-purple-400' },
  { key: 'resting', label: 'Resting', color: 'bg-slate-400' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8 dark:from-slate-900 dark:to-slate-800">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
            About your energy model
          </p>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Energy Levels & Capacity</h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            A quick reference for how your energy levels translate into task capacity and planning guidance.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Energy Levels & Capacity
          </h2>
          <div className="space-y-3">
            {energyLevels.map((level) => {
              const capacity = ENERGY_CAPACITY[level.key];
              return (
                <div
                  key={level.key}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/50"
                >
                  <div className={`h-4 w-4 rounded-full ${level.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{level.label}</p>
                      <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                        {capacity} pts
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                      {getCapacityRangeText(level.key)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
            <h3 className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              Task Complexity Costs
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Quick task</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{COMPLEXITY_COST.quick} pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Medium task</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{COMPLEXITY_COST.medium} pts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Deep task</span>
                <span className="font-semibold text-purple-600 dark:text-purple-400">{COMPLEXITY_COST.deep} pts</span>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800/30 dark:bg-cyan-900/20">
            <p className="text-xs text-cyan-900 dark:text-cyan-100">
              💡 Max {MAX_FOCUS_ITEMS} focus items per day regardless of energy. Life tasks have no capacity cost.
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800/30 dark:bg-cyan-900/20">
          <h3 className="mb-2 font-semibold text-cyan-900 dark:text-cyan-100">
            💙 Why This Matters
          </h3>
          <ul className="space-y-1 text-sm text-cyan-800 dark:text-cyan-200">
            <li>• Your timeline will show your current energy automatically</li>
            <li>• Plan hard tasks during peak hours, not crash times</li>
            <li>• Low energy isn't laziness - it's your biology</li>
            <li>• Evening flow = light tasks only (cooking, tidying)</li>
            <li>• Deep sleep flow = rest activities (reading, bath, no screens)</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
