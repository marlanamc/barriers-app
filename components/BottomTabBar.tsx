'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, BarChart3, Settings } from 'lucide-react';

const TABS = [
  {
    id: 'today',
    label: 'Today',
    icon: Home,
    path: '/',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar',
  },
  {
    id: 'insights',
    label: 'Insights',
    icon: BarChart3,
    path: '/patterns',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-800/80">
      <div className="mx-auto flex max-w-lg">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);

          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className={`flex flex-1 flex-col items-center gap-1 py-3 transition ${
                active
                  ? 'text-cyan-600 dark:text-cyan-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Icon className={`h-6 w-6 ${active ? 'fill-current' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
