'use client';

import { Ship } from 'lucide-react';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useMapData } from '@/hooks/useMapData';
import { MAP_SECTIONS, MAP_MODULES } from '@/lib/map-modules';
import { MapModuleCard } from '@/components/map/MapModuleCard';

export default function MapPage() {
  const { user, loading: userLoading } = useSupabaseUser();
  const { hasContent, loading: dataLoading } = useMapData(user?.id);

  const loading = userLoading || dataLoading;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <Ship className="mx-auto h-8 w-8 animate-pulse text-cyan-600 dark:text-cyan-400" />
          <p className="mt-3 text-slate-600 dark:text-slate-400">Loading your map...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-cyan-50 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <p className="text-slate-600 dark:text-slate-400">Please sign in to view your map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-cyan-50 pb-24 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/50 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="mx-auto max-w-lg pl-10">
          <div className="flex items-center gap-3">
            <Ship className="h-6 w-6 text-cyan-600 dark:text-cyan-400" />
            <div>
              <h1 className="font-cinzel text-lg font-semibold text-slate-900 dark:text-slate-100">
                Captain&apos;s Map
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your foundation, tools, and growth
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Map Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="space-y-6">
          {MAP_SECTIONS.map((section) => (
            <section key={section.id}>
              {/* Section Header */}
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {section.title}
              </h2>

              {/* Module Cards Grid */}
              <div
                className={`grid gap-3 ${
                  section.modules.length === 1
                    ? 'grid-cols-1'
                    : section.modules.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-3'
                }`}
              >
                {section.modules.map((moduleKey) => {
                  const module = MAP_MODULES[moduleKey];
                  if (!module) return null;

                  // Get the hasContent status for this module
                  const moduleHasContent = hasContent[moduleKey as keyof typeof hasContent] ?? false;

                  return (
                    <MapModuleCard
                      key={moduleKey}
                      moduleKey={moduleKey}
                      iconName={module.iconName}
                      iconColor={module.iconColor}
                      title={module.title}
                      hasContent={moduleHasContent}
                      href={module.href}
                    />
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Footer message */}
        <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
          Fill these in anytime. Update them when your life changes.
        </p>
      </main>
    </div>
  );
}
