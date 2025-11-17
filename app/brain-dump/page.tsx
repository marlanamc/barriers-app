'use client';

import { useState, useEffect } from 'react';
import { Brain, Plus, ArrowRight, X } from 'lucide-react';
import { useSupabaseUser } from '@/lib/useSupabaseUser';
import { getCheckinByDate } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';

interface BrainDumpThought {
  id: string;
  text: string;
  createdAt: Date;
}

export default function BrainDumpPage() {
  const { user } = useSupabaseUser();
  const [loading, setLoading] = useState(true);
  const [thoughts, setThoughts] = useState<BrainDumpThought[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newThoughtText, setNewThoughtText] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadThoughts = async () => {
      try {
        setLoading(true);
        // For now, load from localStorage - we can add database support later
        const stored = localStorage.getItem(`brain-dump-${user.id}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setThoughts(parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
          })));
        }
      } catch (error) {
        console.error('Error loading brain dump:', error);
      } finally {
        setLoading(false);
      }
    };

    loadThoughts();
  }, [user]);

  const saveThoughts = (updatedThoughts: BrainDumpThought[]) => {
    if (!user) return;
    localStorage.setItem(`brain-dump-${user.id}`, JSON.stringify(updatedThoughts));
    setThoughts(updatedThoughts);
  };

  const handleAddThought = () => {
    if (!newThoughtText.trim()) return;

    const newThought: BrainDumpThought = {
      id: `thought-${Date.now()}`,
      text: newThoughtText.trim(),
      createdAt: new Date(),
    };

    saveThoughts([...thoughts, newThought]);
    setNewThoughtText('');
    setShowAddModal(false);
  };

  const handleDeleteThought = (thoughtId: string) => {
    saveThoughts(thoughts.filter(t => t.id !== thoughtId));
  };

  const handlePromoteThought = (thoughtId: string) => {
    // TODO: Open QuickAddModal with the thought text pre-filled
    // For now, just copy to clipboard
    const thought = thoughts.find(t => t.id === thoughtId);
    if (thought) {
      navigator.clipboard.writeText(thought.text);
      // You could also navigate to the command center with the text
      window.location.href = `/?promote=${encodeURIComponent(thought.text)}`;
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-slate-600 dark:text-slate-400">Loading brain dump...</p>
      </main>
    );
  }

  return (
    <>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#f5f5f5] via-[#fafafa] to-[#ffffff] pb-24 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
        {/* Background decoration */}
        <div
          className="pointer-events-none absolute inset-0 opacity-60 blur-[60px] dark:hidden"
          aria-hidden
        >
          <div className="absolute -top-32 left-[-10%] h-72 w-72 rounded-full bg-slate-200" />
          <div className="absolute -bottom-40 right-[-5%] h-96 w-96 rounded-full bg-slate-100" />
        </div>

        <div className="relative mx-auto flex min-h-screen max-w-2xl flex-col gap-4 px-4 pb-16 pt-6">
          {/* Header */}
          <div className="flex items-center gap-4 pl-12 sm:pl-14">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Brain Dump</h1>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {thoughts.length} {thoughts.length === 1 ? 'thought' : 'thoughts'} captured
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4 dark:border-pink-800/30 dark:bg-pink-900/20">
            <p className="text-sm text-pink-900 dark:text-pink-100">
              🧠 <strong>Your Brain Dump</strong> is for those racing thoughts, get them out of your head without pressure.
            </p>
          </div>

          {/* Thoughts list */}
          {thoughts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Brain className="h-16 w-16 text-pink-400 opacity-50 dark:text-pink-600" />
              <h2 className="mt-4 text-xl font-semibold text-slate-900 dark:text-slate-100">
                Your brain is clear
              </h2>
              <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
                Capture racing thoughts as they come - get them out of your head.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-600 to-pink-700 px-6 py-3 text-white shadow-lg transition hover:from-pink-700 hover:to-pink-800"
              >
                <Plus className="h-5 w-5" />
                Dump a Thought
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {thoughts.map((thought) => (
                <div
                  key={thought.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-slate-600"
                >
                  <p className="text-sm leading-relaxed text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                    {thought.text}
                  </p>
                  
                  <div className="mt-3 flex items-center justify-between opacity-0 transition group-hover:opacity-100">
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {thought.createdAt.toLocaleDateString()} {thought.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handlePromoteThought(thought.id)}
                        className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-600"
                        title="Promote to Today"
                      >
                        <ArrowRight className="h-3 w-3" />
                        Promote
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteThought(thought.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                        aria-label="Delete"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Add Item Button */}
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-24 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-600 to-pink-700 text-white shadow-[0_8px_24px_rgba(219,39,119,0.4)] transition hover:scale-105 hover:shadow-[0_12px_32px_rgba(219,39,119,0.5)]"
          aria-label="Add item to brain dump"
        >
          <Plus className="h-6 w-6" />
        </button>
      </main>

      {/* Simple Add Thought Modal */}
      {showAddModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setShowAddModal(false);
              setNewThoughtText('');
            }}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
            <div
              className="relative mt-32 w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Dump a Thought
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewThoughtText('');
                  }}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <textarea
                  value={newThoughtText}
                  onChange={(e) => setNewThoughtText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAddThought();
                    } else if (e.key === 'Escape') {
                      setShowAddModal(false);
                      setNewThoughtText('');
                    }
                  }}
                  placeholder="What's on your mind? Just dump it here..."
                  className="w-full min-h-[120px] rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 resize-none"
                  autoFocus
                />
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Press Cmd/Ctrl + Enter to save, or Escape to cancel
                </p>
              </div>

              {/* Footer */}
              <div className="flex gap-3 border-t border-slate-200 p-6 dark:border-slate-700">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewThoughtText('');
                  }}
                  className="flex-1 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddThought}
                  disabled={!newThoughtText.trim()}
                  className="flex-1 rounded-lg bg-pink-600 px-4 py-3 font-semibold text-white transition hover:bg-pink-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-pink-500 dark:hover:bg-pink-600"
                >
                  Dump It
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
