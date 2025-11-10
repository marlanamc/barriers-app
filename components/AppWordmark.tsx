'use client';

import clsx from 'clsx';

interface AppWordmarkProps {
  className?: string;
}

export function AppWordmark({ className }: AppWordmarkProps) {
  return (
    <span
      className={clsx(
        'inline-flex flex-wrap items-baseline gap-1 font-semibold tracking-tight text-lg',
        className
      )}
    >
      <span className="text-slate-900">ADHD</span>
      <span className="text-pink-500">Barrier</span>
      <span className="text-slate-900">Tracker</span>
    </span>
  );
}
