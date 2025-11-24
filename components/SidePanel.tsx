'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Sunrise, CalendarRange, Brain, ListChecks, LineChart, CalendarDays, Moon, Sun, LogOut, X, Settings, Shield, Info, Clock } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from './AuthProvider';
import { AppWordmark } from './AppWordmark';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidePanel({ isOpen, onClose }: SidePanelProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close panel on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const handleLinkClick = () => {
    onClose();
  };

  // ADHD Support - Top priority
  const adhdSupport = [
    {
      href: '/barriers',
      label: 'Barriers',
      description: 'What makes things hard',
      icon: Shield,
      iconColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
    },
  ];

  // Smart Lists - Primary navigation
  const smartLists = [
    {
      href: '/',
      label: 'Today',
      description: 'Your focus for right now',
      icon: Home,
      iconColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
      count: 0, // Will be populated dynamically
    },
    {
      href: '/tomorrow',
      label: 'Tomorrow',
      description: 'Plan your next day',
      icon: Sunrise,
      iconColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      count: 0,
    },
    {
      href: '/upcoming',
      label: 'Next 7 Days',
      description: 'See what\'s ahead',
      icon: CalendarRange,
      iconColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
      count: 0,
    },
    {
      href: '/brain-dump',
      label: 'Brain Dump',
      description: 'Capture racing thoughts',
      icon: Brain,
      iconColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
      count: 0,
    },
    {
      href: '/for-later',
      label: 'For Later',
      description: 'Tasks saved for later',
      icon: Clock,
      iconColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
      count: 0,
    },
    {
      href: '/all-tasks',
      label: 'All Tasks',
      description: 'Everything in one place',
      icon: ListChecks,
      iconColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
      count: 0,
    },
  ];

  // Insights - Secondary navigation
  const insightItems = [
    {
      href: '/patterns',
      label: 'Patterns',
      description: 'Notice gentle trends',
      icon: LineChart,
      iconColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    },
    {
      href: '/reflect',
      label: 'Evening Reflect',
      description: 'End-of-day check-in',
      icon: Moon,
      iconColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300',
    },
    {
      href: '/calendar',
      label: 'Calendar',
      description: 'See your daily energy',
      icon: CalendarDays,
      iconColor: 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300',
    },
  ];

  // Settings
  const settingsItem = {
    href: '/settings',
    label: 'Settings',
    description: 'Energy schedule & preferences',
    icon: Settings,
    iconColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  const aboutItem = {
    href: '/about',
    label: 'About',
    description: 'Energy levels & capacity',
    icon: Info,
    iconColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity dark:bg-black/40"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Side Panel */}
      <div
        ref={panelRef}
        className={`fixed left-0 top-0 z-50 h-full w-80 transform bg-white/95 shadow-2xl backdrop-blur-lg transition-transform duration-300 ease-in-out dark:bg-slate-900/95 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
            <AppWordmark className="text-lg font-bold text-slate-900 dark:text-slate-100" />
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4">
            {/* ADHD Support Section */}
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                ADHD Support
              </h3>
              <div className="space-y-1">
                {adhdSupport.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`group flex items-center gap-3 rounded-xl p-3 transition ${
                        isActive
                          ? 'bg-cyan-100 dark:bg-cyan-900/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`rounded-lg p-2 ${item.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {item.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Smart Lists Section */}
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Smart Lists
              </h3>
              <div className="space-y-1">
                {smartLists.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href === '/' && pathname === '/command-center');
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`group flex items-center gap-3 rounded-xl p-3 transition ${
                        isActive
                          ? 'bg-cyan-100 dark:bg-cyan-900/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`rounded-lg p-2 ${item.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {item.label}
                        </p>
                      </div>
                      {item.count > 0 && (
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Insights Section */}
            <div className="mb-6">
              <h3 className="mb-2 px-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Insights
              </h3>
              <div className="space-y-1">
                {insightItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`group flex items-center gap-3 rounded-xl p-3 transition ${
                        isActive
                          ? 'bg-cyan-100 dark:bg-cyan-900/30'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className={`rounded-lg p-2 ${item.iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          isActive ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {item.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Settings */}
            <div>
              <div className="space-y-1">
                <Link
                  href={settingsItem.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center gap-3 rounded-xl p-3 transition ${
                    pathname === settingsItem.href
                      ? 'bg-cyan-100 dark:bg-cyan-900/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`rounded-lg p-2 ${settingsItem.iconColor}`}>
                    <settingsItem.icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${
                      pathname === settingsItem.href ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {settingsItem.label}
                    </p>
                  </div>
                </Link>
                <Link
                  href={aboutItem.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center gap-3 rounded-xl p-3 transition ${
                    pathname === aboutItem.href
                      ? 'bg-cyan-100 dark:bg-cyan-900/30'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <span className={`rounded-lg p-2 ${aboutItem.iconColor}`}>
                    <aboutItem.icon className="h-4 w-4" />
                  </span>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${
                      pathname === aboutItem.href ? 'text-cyan-700 dark:text-cyan-300' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {aboutItem.label}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </nav>

          {/* Footer with Theme Toggle and Sign Out */}
          <div className="border-t border-slate-200 p-4 dark:border-slate-700">
            <div className="space-y-2">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-xl border border-white/30 bg-white/70 px-4 py-3 shadow-sm transition hover:bg-white hover:shadow-md dark:border-slate-700/30 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="rounded-full bg-slate-100 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {theme === 'dark' ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </span>
                <span className="flex-1 text-left font-medium text-slate-900 dark:text-slate-100">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
              </button>

              {/* Sign Out */}
              {user && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/30 bg-white/70 px-4 py-3 shadow-sm transition hover:bg-white hover:shadow-md dark:border-slate-700/30 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                >
                  <span className="rounded-full bg-red-100 p-2 text-red-700 dark:bg-red-900/50 dark:text-red-300">
                    <LogOut className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-left font-medium text-slate-900 dark:text-slate-100">Sign Out</span>
                </button>
              )}

              {!user && (
                <button
                  type="button"
                  onClick={() => {
                    router.push('/auth/login');
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-white/30 bg-white/70 px-4 py-3 shadow-sm transition hover:bg-white hover:shadow-md dark:border-slate-700/30 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                >
                  <span className="rounded-full bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">
                    <LogOut className="h-5 w-5" />
                  </span>
                  <span className="flex-1 text-left font-medium text-slate-900 dark:text-slate-100">Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
