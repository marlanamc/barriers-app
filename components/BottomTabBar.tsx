'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Home, Calendar, Zap, Brain } from 'lucide-react';

const TABS = [
  {
    id: 'today',
    label: 'Today',
    icon: Home,
    path: '/',
  },
  {
    id: 'brain-dump',
    label: 'Dump',
    icon: Brain,
    path: '/brain-dump',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: Calendar,
    path: '/calendar',
  },
  {
    id: 'energy',
    label: 'Energy',
    icon: Zap,
    path: '/energy',
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
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] backdrop-blur-sm supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)] dark:border-slate-700 dark:bg-slate-800 dark:shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.3)]">
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
