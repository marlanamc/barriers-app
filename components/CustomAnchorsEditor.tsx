'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';
import { getAnchorPresets, setAnchorPresets } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import type { TaskAnchorType } from '@/lib/checkin-context';

interface CustomAnchorsEditorProps {
  onAnchorsChange?: () => void;
}

const anchorTypeLabels: Record<Exclude<TaskAnchorType, 'at'>, string> = {
  while: 'While',
  before: 'Before',
  after: 'After',
};

const anchorTypeDescriptions: Record<Exclude<TaskAnchorType, 'at'>, string> = {
  while: 'Things you do while doing something else',
  before: 'Things that happen before your task',
  after: 'Things that happen after your task',
};

export function CustomAnchorsEditor({ onAnchorsChange }: CustomAnchorsEditorProps) {
  const { user } = useAuth();
  const [presets, setPresets] = useState<Record<Exclude<TaskAnchorType, 'at'>, string[]>>({
    while: [],
    before: [],
    after: [],
  });
  const [loading, setLoading] = useState(true);
  const [newInputs, setNewInputs] = useState<Record<Exclude<TaskAnchorType, 'at'>, string>>({
    while: '',
    before: '',
    after: '',
  });
  const [saving, setSaving] = useState<Record<Exclude<TaskAnchorType, 'at'>, boolean>>({
    while: false,
    before: false,
    after: false,
  });

  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

  const loadPresets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [whilePresets, beforePresets, afterPresets] = await Promise.all([
        getAnchorPresets(user.id, 'while'),
        getAnchorPresets(user.id, 'before'),
        getAnchorPresets(user.id, 'after'),
      ]);
      setPresets({
        while: whilePresets,
        before: beforePresets,
        after: afterPresets,
      });
    } catch (error) {
      console.error('Error loading anchor presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPreset = async (type: Exclude<TaskAnchorType, 'at'>) => {
    if (!user || !newInputs[type].trim()) return;

    const trimmed = newInputs[type].trim();
    if (presets[type].includes(trimmed)) {
      setNewInputs((prev) => ({ ...prev, [type]: '' }));
      return;
    }

    setSaving((prev) => ({ ...prev, [type]: true }));
    try {
      const updatedPresets = [...presets[type], trimmed];
      await setAnchorPresets(user.id, type, updatedPresets);
      setPresets((prev) => ({ ...prev, [type]: updatedPresets }));
      setNewInputs((prev) => ({ ...prev, [type]: '' }));
      onAnchorsChange?.();
    } catch (error) {
      console.error('Error adding anchor preset:', error);
      alert('Failed to add preset. Please try again.');
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleDeletePreset = async (type: Exclude<TaskAnchorType, 'at'>, presetToDelete: string) => {
    if (!user) return;

    setSaving((prev) => ({ ...prev, [type]: true }));
    try {
      const updatedPresets = presets[type].filter((preset) => preset !== presetToDelete);
      await setAnchorPresets(user.id, type, updatedPresets);
      setPresets((prev) => ({ ...prev, [type]: updatedPresets }));
      onAnchorsChange?.();
    } catch (error) {
      console.error('Error deleting anchor preset:', error);
      alert('Failed to delete preset. Please try again.');
    } finally {
      setSaving((prev) => ({ ...prev, [type]: false }));
    }
  };

  if (loading) {
    return <div className="text-slate-600 dark:text-slate-400">Loading anchor presets...</div>;
  }

  return (
    <div className="space-y-6">
      {(['while', 'before', 'after'] as const).map((type) => (
        <div key={type} className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {anchorTypeLabels[type]}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {anchorTypeDescriptions[type]}
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder={`e.g., ${type === 'while' ? 'watching TV' : type === 'before' ? 'the kids wake up' : 'dinner cleanup'}`}
              value={newInputs[type]}
              onChange={(e) => setNewInputs((prev) => ({ ...prev, [type]: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newInputs[type].trim()) {
                  e.preventDefault();
                  handleAddPreset(type);
                }
              }}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/50"
              disabled={saving[type]}
            />
            <button
              type="button"
              onClick={() => handleAddPreset(type)}
              disabled={!newInputs[type].trim() || presets[type].includes(newInputs[type].trim()) || saving[type]}
              className="rounded-lg border border-cyan-300 bg-cyan-50 px-3 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-200 dark:hover:bg-cyan-900/40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {presets[type].length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No {anchorTypeLabels[type].toLowerCase()} presets yet. Add your first one above!
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {presets[type].map((preset) => (
                <div
                  key={preset}
                  className="flex items-center gap-2 rounded-full bg-cyan-100 px-3 py-1.5 text-sm font-medium text-cyan-800 dark:bg-cyan-500/30 dark:text-cyan-100"
                >
                  <span>{preset}</span>
                  <button
                    type="button"
                    onClick={() => handleDeletePreset(type, preset)}
                    disabled={saving[type]}
                    className="rounded-full p-0.5 text-cyan-600 transition hover:bg-cyan-200 dark:text-cyan-200 dark:hover:bg-cyan-500/40"
                    aria-label={`Delete ${preset}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}





