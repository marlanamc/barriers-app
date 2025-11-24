'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Plus, X, Sparkles, Heart, TrendingUp } from 'lucide-react';
import { ModuleDefinition } from '@/lib/map-modules';
import type { StarlightWin } from '@/hooks/useMapData';

interface StarlightEditorProps {
  module: ModuleDefinition;
  initialWins: StarlightWin[];
  onAdd: (win: Omit<StarlightWin, 'id' | 'created_at'>) => Promise<boolean>;
  onRemove: (winId: string) => Promise<boolean>;
  saving: boolean;
}

type WinCategory = 'win' | 'gratitude' | 'progress';

const CATEGORIES: { key: WinCategory; label: string; icon: React.ReactNode; color: string }[] = [
  {
    key: 'win',
    label: 'Win',
    icon: <Sparkles className="h-4 w-4" />,
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  },
  {
    key: 'gratitude',
    label: 'Gratitude',
    icon: <Heart className="h-4 w-4" />,
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  },
  {
    key: 'progress',
    label: 'Progress',
    icon: <TrendingUp className="h-4 w-4" />,
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  },
];

export function StarlightEditor({
  module,
  initialWins,
  onAdd,
  onRemove,
  saving,
}: StarlightEditorProps) {
  const router = useRouter();
  const [wins, setWins] = useState<StarlightWin[]>(initialWins);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<WinCategory>('win');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setWins(initialWins);
  }, [initialWins]);

  const handleAdd = async () => {
    if (!description.trim()) return;

    setAdding(true);
    const success = await onAdd({
      description: description.trim(),
      category,
    });

    if (success) {
      setDescription('');
      setCategory('win');
      setShowAddForm(false);
    }
    setAdding(false);
  };

  const handleRemove = async (winId: string) => {
    await onRemove(winId);
  };

  const getCategoryInfo = (cat: WinCategory) => {
    return CATEGORIES.find(c => c.key === cat)!;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-cyan-50 pb-24 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/50 bg-white/80 px-4 py-4 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-900/80">
        <div className="mx-auto max-w-lg pl-10">
          <button
            onClick={() => router.push('/map')}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Map
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-lg px-4 py-6">
        {/* Module header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-hidden="true">
              {module.icon}
            </span>
            <div>
              <h1 className="font-cinzel text-xl font-semibold text-slate-900 dark:text-slate-100">
                {module.title}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {module.shortDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
          {module.fullDescription}
        </p>

        {/* Add new entry form */}
        {showAddForm ? (
          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What went well? What are you grateful for?"
              rows={3}
              className="mb-3 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              autoFocus
            />
            <div className="mb-3 flex gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition ${
                    category === cat.key
                      ? cat.color
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat.icon}
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setDescription('');
                  setCategory('win');
                }}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={!description.trim() || adding}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-700 disabled:bg-slate-300 disabled:text-slate-500"
              >
                {adding ? 'Adding...' : 'Add'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-cyan-500 dark:hover:text-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Add a win or gratitude
          </button>
        )}

        {/* Suggestions */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="flex w-full items-center justify-between rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
          >
            <span>Need ideas?</span>
            {showSuggestions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {showSuggestions && (
            <div className="mt-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
              <div className="flex flex-wrap gap-2">
                {module.suggestions.map((suggestion) => (
                  <span
                    key={suggestion}
                    className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600"
                  >
                    {suggestion}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Entries list */}
        {wins.length > 0 ? (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent entries
            </h3>
            {wins.map((win) => {
              const catInfo = getCategoryInfo(win.category);
              return (
                <div
                  key={win.id}
                  className="rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${catInfo.color}`}>
                          {catInfo.icon}
                          {catInfo.label}
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {formatDate(win.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {win.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemove(win.id)}
                      disabled={saving}
                      className="ml-2 rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl bg-white/50 p-6 text-center dark:bg-slate-800/50">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              No entries yet. Add your first win or gratitude!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
