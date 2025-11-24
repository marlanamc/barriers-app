'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, ChevronUp, Save, Plus, X, Star } from 'lucide-react';
import { ModuleDefinition } from '@/lib/map-modules';
import type { LifeVestTool } from '@/hooks/useMapData';

interface LifeVestEditorProps {
  module: ModuleDefinition;
  initialTools: LifeVestTool[];
  onSave: (tools: Omit<LifeVestTool, 'id'>[]) => Promise<boolean>;
  saving: boolean;
}

const CATEGORIES = [
  { key: 'sensory', label: 'Sensory', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200' },
  { key: 'breathing', label: 'Breathing', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200' },
  { key: 'movement', label: 'Movement', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200' },
  { key: 'social', label: 'Social', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200' },
];

interface ToolFormData {
  name: string;
  description: string;
  category: string;
  quick_access: boolean;
}

export function LifeVestEditor({
  module,
  initialTools,
  onSave,
  saving,
}: LifeVestEditorProps) {
  const router = useRouter();
  const [tools, setTools] = useState<LifeVestTool[]>(initialTools);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<ToolFormData>({
    name: '',
    description: '',
    category: '',
    quick_access: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setTools(initialTools);
  }, [initialTools]);

  const handleAddTool = () => {
    if (!formData.name.trim()) return;

    const newTool: LifeVestTool = {
      id: `temp-${Date.now()}`,
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      category: formData.category || null,
      quick_access: formData.quick_access,
      sort_order: tools.length,
    };

    setTools([...tools, newTool]);
    setFormData({ name: '', description: '', category: '', quick_access: false });
    setShowAddForm(false);
  };

  const handleRemoveTool = (toolId: string) => {
    setTools(tools.filter(t => t.id !== toolId));
  };

  const handleToggleQuickAccess = (toolId: string) => {
    setTools(tools.map(t =>
      t.id === toolId ? { ...t, quick_access: !t.quick_access } : t
    ));
  };

  const handleAddSuggestion = (name: string) => {
    if (tools.some(t => t.name.toLowerCase() === name.toLowerCase())) return;

    const newTool: LifeVestTool = {
      id: `temp-${Date.now()}`,
      name,
      description: null,
      category: null,
      quick_access: false,
      sort_order: tools.length,
    };

    setTools([...tools, newTool]);
  };

  const handleSave = async () => {
    const toolsToSave = tools.map((t, index) => ({
      name: t.name,
      description: t.description,
      category: t.category,
      quick_access: t.quick_access,
      sort_order: index,
    }));

    const success = await onSave(toolsToSave);
    if (success) {
      setSaved(true);
      setTimeout(() => {
        router.push('/map');
      }, 500);
    }
  };

  const hasChanges = JSON.stringify(tools.map(t => ({
    name: t.name,
    description: t.description,
    category: t.category,
    quick_access: t.quick_access,
  }))) !== JSON.stringify(initialTools.map(t => ({
    name: t.name,
    description: t.description,
    category: t.category,
    quick_access: t.quick_access,
  })));

  const getCategoryColor = (category: string | null | undefined) => {
    return CATEGORIES.find(c => c.key === category)?.color || 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
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

        {/* Current tools */}
        {tools.length > 0 && (
          <div className="mb-4 space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {tool.name}
                    </span>
                    {tool.category && (
                      <span className={`rounded-full px-2 py-0.5 text-xs ${getCategoryColor(tool.category)}`}>
                        {tool.category}
                      </span>
                    )}
                  </div>
                  {tool.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {tool.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleToggleQuickAccess(tool.id)}
                    className={`rounded-full p-1.5 ${
                      tool.quick_access
                        ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                        : 'text-slate-300 hover:bg-slate-100 dark:text-slate-600 dark:hover:bg-slate-700'
                    }`}
                    title={tool.quick_access ? 'Remove from quick access' : 'Add to quick access'}
                  >
                    <Star className={`h-4 w-4 ${tool.quick_access ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveTool(tool.id)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30"
                    aria-label={`Remove ${tool.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add tool form */}
        {showAddForm ? (
          <div className="mb-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tool name..."
              className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              autoFocus
            />
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description (optional)..."
              className="mb-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
            <div className="mb-3 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setFormData({
                    ...formData,
                    category: formData.category === cat.key ? '' : cat.key,
                  })}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    formData.category === cat.key
                      ? cat.color
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={formData.quick_access}
                  onChange={(e) => setFormData({ ...formData, quick_access: e.target.checked })}
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                />
                Quick access
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setFormData({ name: '', description: '', category: '', quick_access: false });
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTool}
                  disabled={!formData.name.trim()}
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm text-white hover:bg-cyan-700 disabled:bg-slate-300 disabled:text-slate-500"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 hover:border-cyan-400 hover:text-cyan-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-cyan-500 dark:hover:text-cyan-400"
          >
            <Plus className="h-4 w-4" />
            Add a tool
          </button>
        )}

        {/* Suggestions */}
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
                  .filter((s) => !tools.some(t => t.name.toLowerCase() === s.toLowerCase()))
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
