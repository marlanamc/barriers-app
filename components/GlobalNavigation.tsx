'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { SidePanel } from './SidePanel';

export function GlobalNavigation() {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  return (
    <>
      {/* Floating Menu Button - Fixed position, always visible */}
      <button
        type="button"
        onClick={() => setIsSidePanelOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-full border border-white/40 bg-white/70 p-2 text-slate-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700/40 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Side Panel */}
      <SidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} />
    </>
  );
}

