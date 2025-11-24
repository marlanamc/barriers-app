'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Save, Plus, X } from 'lucide-react';
import { ModuleDefinition } from '@/lib/map-modules';

interface ListModuleEditorProps {
  module: ModuleDefinition;
  initialItems: string[];
  initialNotes?: string;
  onSave: (items: string[], notes?: string) => Promise<boolean>;
  saving: boolean;
}

export function ListModuleEditor({
  module,
  initialItems,
  initialNotes = '',
  onSave,
  saving,
}: ListModuleEditorProps) {
  const router = useRouter();
  const [items, setItems] = useState<string[]>(initialItems);
  const [notes, setNotes] = useState(initialNotes);
  const [newItem, setNewItem] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saved, setSaved] = useState(false);

  // Update when initial values change
  useEffect(() => {
    setItems(initialItems);
    setNotes(initialNotes);
  }, [initialItems, initialNotes]);

  const handleAddItem = () => {
    const trimmed = newItem.trim();
    if (trimmed && !items.includes(trimmed)) {
      setItems([...items, trimmed]);
      setNewItem('');
    }
  };

  const handleRemoveItem = (item: string) => {
    setItems(items.filter(i => i !== item));
  };

  const handleAddSuggestion = (suggestion: string) => {
    if (!items.includes(suggestion)) {
      setItems([...items, suggestion]);
    }
  };

  const handleSave = async () => {
    const success = await onSave(items, notes.trim() || undefined);
    if (success) {
      setSaved(true);
      setTimeout(() => {
        router.push('/map');
      }, 500);
    }
  };

  const hasChanges =
    JSON.stringify(items) !== JSON.stringify(initialItems) ||
    notes !== initialNotes;

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

        {/* Prompt question */}
        <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {module.promptQuestion}
        </label>

        {/* Current items */}
        {items.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {items.map((item) => (
              <span
                key={item}
                className="flex items-center gap-1 rounded-full bg-cyan-100 px-3 py-1 text-sm text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item)}
                  className="ml-1 rounded-full p-0.5 hover:bg-cyan-200 dark:hover:bg-cyan-800"
                  aria-label={`Remove ${item}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add new item */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddItem();
              }
            }}
            placeholder="Add an item..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          <button
            type="button"
            onClick={handleAddItem}
            disabled={!newItem.trim()}
            className="flex items-center justify-center rounded-xl bg-cyan-600 px-4 text-white hover:bg-cyan-700 disabled:bg-slate-300 disabled:text-slate-500 dark:disabled:bg-slate-700"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Suggestions accordion */}
        <div className="mt-4">
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
                {module.suggestions
                  .filter((s) => !items.includes(s))
                  .map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleAddSuggestion(suggestion)}
                      className="rounded-full bg-white px-3 py-1 text-xs text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-cyan-50 hover:text-cyan-700 hover:ring-cyan-200 dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-cyan-900/30 dark:hover:text-cyan-400"
                    >
                      + {suggestion}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional notes */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional thoughts..."
            rows={2}
            className="w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        {/* Save button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
              saved
                ? 'bg-emerald-500 text-white'
                : hasChanges
                ? 'bg-cyan-600 text-white hover:bg-cyan-700 active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
            } ${saving ? 'opacity-50' : ''}`}
          >
            {saving ? (
              'Saving...'
            ) : saved ? (
              'Saved!'
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
