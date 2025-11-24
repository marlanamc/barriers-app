'use client';

import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { useThoughts } from '@/hooks/useThoughts';
import { LogbookEmpty } from '@/components/logbook/LogbookEmpty';
import { LogbookList } from '@/components/logbook/LogbookList';
import { AddThoughtModal } from '@/components/logbook/AddThoughtModal';

export default function LogbookPage() {
  const { user } = useSupabaseUser();
  const { thoughts, loading, addThought, archiveThought, convertThought } = useThoughts(user?.id);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleSaveThought = async (text: string) => {
    await addThought(text);
  };

  const handleConvertToTask = async (id: string) => {
    // For now, just mark as converted - later can integrate with task system
    await convertThought(id, 'task');
  };

  const handleConvertToNote = async (id: string) => {
    // For now, just mark as converted - later can integrate with notes
    await convertThought(id, 'note');
  };

  const handleArchive = async (id: string) => {
    await archiveThought(id);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-300 border-t-slate-600 mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-crimson">Loading...</p>
        </div>
      </main>
    );
  }

  const hasThoughts = thoughts.length > 0;

  return (
    <>
      <main className="relative min-h-screen pb-24">
        <div className="mx-auto max-w-lg px-4 pt-6">
          {/* Minimal header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-pink-500 dark:text-pink-400" />
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 font-cinzel">
                Logbook
              </h1>
            </div>
            {hasThoughts && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-crimson pl-7">
                {thoughts.length} {thoughts.length === 1 ? 'thought' : 'thoughts'} captured
              </p>
            )}
          </div>

          {/* Content */}
          {hasThoughts ? (
            <LogbookList
              thoughts={thoughts}
              onConvertToTask={handleConvertToTask}
              onConvertToNote={handleConvertToNote}
              onArchive={handleArchive}
            />
          ) : (
            <LogbookEmpty onAddThought={() => setShowAddModal(true)} />
          )}
        </div>

        {/* Floating Add Button - only show when there are thoughts */}
        {hasThoughts && (
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-24 right-6 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-lg transition hover:scale-105 hover:shadow-xl"
            aria-label="Capture a thought"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </main>

      {/* Add Thought Modal */}
      <AddThoughtModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveThought}
      />
    </>
  );
}
