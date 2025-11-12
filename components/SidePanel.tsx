'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { CalendarDays, LineChart, CalendarPlus, Moon, Sun, LogOut, X, Settings } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from './AuthProvider';

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

  const navigationItems = [
    {
      href: '/calendar',
      label: 'Calendar',
      description: 'See your daily energy',
      icon: CalendarDays,
      iconColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
    },
    {
      href: '/patterns',
      label: 'Patterns',
      description: 'Notice gentle trends',
      icon: LineChart,
      iconColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
    },
    {
      href: '/plan-ahead',
      label: 'Plan Ahead',
      description: 'Set up future or recurring items',
      icon: CalendarPlus,
      iconColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
    },
    {
      href: '/settings',
      label: 'Settings',
      description: 'Energy schedule & preferences',
      icon: Settings,
      iconColor: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
    },
  ];

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
        className={`fixed right-0 top-0 z-50 h-full w-80 transform bg-white/95 shadow-2xl backdrop-blur-lg transition-transform duration-300 ease-in-out dark:bg-slate-900/95 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Menu</h2>
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
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center gap-4 rounded-2xl border p-4 shadow-sm transition hover:shadow-md ${
                      isActive
                        ? 'border-cyan-300 bg-cyan-50 dark:border-cyan-700 dark:bg-cyan-900/20'
                        : 'border-white/30 bg-white/70 dark:border-slate-700/30 dark:bg-slate-800/70 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`rounded-full p-3 ${item.iconColor}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.description}</p>
                    </div>
                  </Link>
                );
              })}
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

