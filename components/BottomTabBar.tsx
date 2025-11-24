'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Compass, Gauge, Map, BookOpen, Sparkles } from 'lucide-react';

const TABS = [
  {
    id: 'compass',
    label: 'Compass',
    sublabel: 'plan the day',
    icon: Compass,
    path: '/',
    activeColor: 'text-sky-600 dark:text-cyan-400',
  },
  {
    id: 'cabin',
    label: 'Cabin',
    sublabel: 'check systems',
    icon: Gauge,
    path: '/toolkit',
    activeColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'map',
    label: 'Map',
    sublabel: 'long-term',
    icon: Map,
    path: '/map',
    activeColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'logbook',
    label: 'Logbook',
    sublabel: 'review day',
    icon: BookOpen,
    path: '/brain-dump',
    activeColor: 'text-pink-500 dark:text-pink-400',
  },
  {
    id: 'reflect',
    label: 'Reflect',
    sublabel: 'close the day',
    icon: Sparkles,
    path: '/reflect',
    activeColor: 'text-violet-600 dark:text-violet-400',
  },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const router = useRouter();

  // Don't show on auth or onboarding pages
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/onboarding')) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname?.startsWith(path);
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/60 bg-white/90 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] backdrop-blur-md supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] dark:border-slate-700 dark:bg-slate-900/90 dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition ${active
                ? tab.activeColor
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
            >
              <Icon className={`h-5 w-5 transition-all ${active ? 'scale-110 stroke-[2.5px]' : ''}`} />
              <span className="text-[10px] font-medium font-crimson leading-tight">{tab.label}</span>
              {active && (
                <span className="text-[8px] opacity-70 leading-tight">{tab.sublabel}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
