'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useAuth } from './AuthProvider';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => router.push('/auth/login')}
        className="rounded-full border border-white/40 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700/40 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        Sign in
      </button>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700/40 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-semibold text-white">
          {userInitial}
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-white/20 bg-white/90 p-2 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/90">
          <div className="px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
            <p className="truncate font-medium">{user.email}</p>
          </div>
          <div className="border-t border-white/20 dark:border-white/10" />
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

