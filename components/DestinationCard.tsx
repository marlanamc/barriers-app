'use client';

import { Target, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface DestinationCardProps {
  destination?: string | null;
  onEdit?: () => void;
}

export function DestinationCard({ destination, onEdit }: DestinationCardProps) {
  if (!destination) {
    return (
      <button
        onClick={onEdit}
        className="w-full bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-2xl p-4 border border-sky-200/60 dark:border-sky-700/40 hover:border-sky-300 dark:hover:border-sky-600 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 dark:from-sky-600 dark:to-cyan-600 flex items-center justify-center shadow-sm">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sky-900 dark:text-sky-100">
              Set your Destination
            </p>
            <p className="text-xs text-sky-600 dark:text-sky-400">
              What are you working toward?
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-sky-400 flex-shrink-0" />
        </div>
      </button>
    );
  }

  return (
    <Link
      href="/map/destination"
      className="block w-full bg-gradient-to-r from-sky-50 to-cyan-50 dark:from-sky-900/20 dark:to-cyan-900/20 rounded-2xl p-4 border border-sky-200/60 dark:border-sky-700/40 hover:border-sky-300 dark:hover:border-sky-600 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 dark:from-sky-600 dark:to-cyan-600 flex items-center justify-center shadow-sm flex-shrink-0">
          <Target className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-sky-600 dark:text-sky-400 mb-1">
            Destination
          </p>
          <p className="text-sm font-medium text-sky-900 dark:text-sky-100 leading-snug">
            {destination}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-sky-400 flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}
