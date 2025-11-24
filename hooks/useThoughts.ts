'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Thought {
  id: string;
  user_id: string;
  text: string;
  created_at: string;
  status: 'open' | 'archived' | 'converted';
  converted_to: 'task' | 'note' | null;
  converted_item_id: string | null;
}

interface UseThoughtsReturn {
  thoughts: Thought[];
  loading: boolean;
  error: string | null;
  addThought: (text: string) => Promise<Thought | null>;
  archiveThought: (id: string) => Promise<boolean>;
  convertThought: (id: string, convertTo: 'task' | 'note', convertedItemId?: string) => Promise<boolean>;
  deleteThought: (id: string) => Promise<boolean>;
  refreshThoughts: () => Promise<void>;
}

export function useThoughts(userId: string | undefined): UseThoughtsReturn {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all open thoughts for user
  const fetchThoughts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('logbook_thoughts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setThoughts(data || []);
    } catch (err) {
      console.error('Error fetching thoughts:', err);
      setError('Failed to load thoughts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load thoughts on mount
  useEffect(() => {
    fetchThoughts();
  }, [fetchThoughts]);

  // Add a new thought
  const addThought = useCallback(async (text: string): Promise<Thought | null> => {
    if (!userId || !text.trim()) return null;

    try {
      const { data, error: insertError } = await supabase
        .from('logbook_thoughts')
        .insert({
          user_id: userId,
          text: text.trim(),
          status: 'open',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to local state
      setThoughts(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error adding thought:', err);
      setError('Failed to save thought');
      return null;
    }
  }, [userId]);

  // Archive a thought (dismiss without converting)
  const archiveThought = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error: updateError } = await supabase
        .from('logbook_thoughts')
        .update({ status: 'archived' })
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Remove from local state
      setThoughts(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Error archiving thought:', err);
      setError('Failed to archive thought');
      return false;
    }
  }, [userId]);

  // Convert a thought to task or note
  const convertThought = useCallback(async (
    id: string,
    convertTo: 'task' | 'note',
    convertedItemId?: string
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error: updateError } = await supabase
        .from('logbook_thoughts')
        .update({
          status: 'converted',
          converted_to: convertTo,
          converted_item_id: convertedItemId || null,
        })
        .eq('id', id)
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Remove from local state
      setThoughts(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Error converting thought:', err);
      setError('Failed to convert thought');
      return false;
    }
  }, [userId]);

  // Delete a thought permanently
  const deleteThought = useCallback(async (id: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { error: deleteError } = await supabase
        .from('logbook_thoughts')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Remove from local state
      setThoughts(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting thought:', err);
      setError('Failed to delete thought');
      return false;
    }
  }, [userId]);

  return {
    thoughts,
    loading,
    error,
    addThought,
    archiveThought,
    convertThought,
    deleteThought,
    refreshThoughts: fetchThoughts,
  };
}
