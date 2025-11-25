'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { getCustomTags, setCustomTags } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

interface CustomTagsEditorProps {
  onTagsChange?: () => void;
}

export function CustomTagsEditor({ onTagsChange }: CustomTagsEditorProps) {
  const { user } = useAuth();
  const [customTags, setCustomTagsState] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTagInput, setNewTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadCustomTags();
    }
  }, [user]);

  const loadCustomTags = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const tags = await getCustomTags(user.id);
      setCustomTagsState(tags);
    } catch (error) {
      console.error('Error loading custom tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!user || !newTagInput.trim()) return;
    
    const trimmed = newTagInput.trim();
    if (customTags.includes(trimmed)) {
      setNewTagInput('');
      return;
    }

    setSaving(true);
    try {
      const updatedTags = [...customTags, trimmed];
      await setCustomTags(user.id, updatedTags);
      setCustomTagsState(updatedTags);
      setNewTagInput('');
      onTagsChange?.();
    } catch (error) {
      console.error('Error adding custom tag:', error);
      alert('Failed to add tag. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = async (tagToDelete: string) => {
    if (!user) return;

    setSaving(true);
    try {
      const updatedTags = customTags.filter(tag => tag !== tagToDelete);
      await setCustomTags(user.id, updatedTags);
      setCustomTagsState(updatedTags);
      onTagsChange?.();
    } catch (error) {
      console.error('Error deleting custom tag:', error);
      alert('Failed to delete tag. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-slate-600 dark:text-slate-400">Loading tags...</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Enter tag name..."
            value={newTagInput}
            onChange={(e) => setNewTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newTagInput.trim()) {
                e.preventDefault();
                handleAddTag();
              }
            }}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-500 dark:focus:ring-cyan-900/50"
            disabled={saving}
          />
          <button
            type="button"
            onClick={handleAddTag}
            disabled={!newTagInput.trim() || customTags.includes(newTagInput.trim()) || saving}
            className="rounded-lg border border-cyan-300 bg-cyan-50 px-4 py-2 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-200 dark:hover:bg-cyan-900/40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {customTags.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <Tag className="mx-auto h-12 w-12 text-slate-400 mb-3" />
          <p className="text-slate-600 dark:text-slate-400">
            No custom tags yet. Add your first tag above!
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {customTags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-800 dark:bg-cyan-500/30 dark:text-cyan-100"
            >
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => handleDeleteTag(tag)}
                disabled={saving}
                className="rounded-full p-0.5 text-cyan-600 transition hover:bg-cyan-200 dark:text-cyan-200 dark:hover:bg-cyan-500/40"
                aria-label={`Delete ${tag}`}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

