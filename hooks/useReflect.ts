'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { getTodayLocalDateString } from '@/lib/date-utils';

export interface ReflectData {
  id?: string;
  nervous_system_signals: string[];
  bandwidth: string | null;
  priority_outcome: string | null;
  tomorrow_prep: string | null;
}

interface UseReflectReturn {
  data: ReflectData;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateSignals: (signals: string[]) => void;
  updateBandwidth: (bandwidth: string) => void;
  updatePriorityOutcome: (outcome: string) => void;
  updateTomorrowPrep: (prep: string) => void;
  saveReflect: () => Promise<boolean>;
}

const initialData: ReflectData = {
  nervous_system_signals: [],
  bandwidth: null,
  priority_outcome: null,
  tomorrow_prep: null,
};

export function useReflect(userId: string | undefined): UseReflectReturn {
  const [data, setData] = useState<ReflectData>(initialData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load today's reflect data
  const loadReflect = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const today = getTodayLocalDateString();

      const { data: reflectData, error: fetchError } = await supabase
        .from('daily_reflects')
        .select('*')
        .eq('user_id', userId)
        .eq('reflect_date', today)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is fine
        throw fetchError;
      }

      if (reflectData) {
        setData({
          id: reflectData.id,
          nervous_system_signals: reflectData.nervous_system_signals || [],
          bandwidth: reflectData.bandwidth,
          priority_outcome: reflectData.priority_outcome,
          tomorrow_prep: reflectData.tomorrow_prep,
        });
      } else {
        setData(initialData);
      }
    } catch (err) {
      console.error('Error loading reflect:', err);
      setError('Failed to load reflect data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadReflect();
  }, [loadReflect]);

  // Update functions
  const updateSignals = useCallback((signals: string[]) => {
    setData(prev => ({ ...prev, nervous_system_signals: signals }));
  }, []);

  const updateBandwidth = useCallback((bandwidth: string) => {
    setData(prev => ({ ...prev, bandwidth }));
  }, []);

  const updatePriorityOutcome = useCallback((outcome: string) => {
    setData(prev => ({ ...prev, priority_outcome: outcome }));
  }, []);

  const updateTomorrowPrep = useCallback((prep: string) => {
    setData(prev => ({ ...prev, tomorrow_prep: prep }));
  }, []);

  // Save to database
  const saveReflect = useCallback(async (): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);
      const today = getTodayLocalDateString();

      const { error: upsertError } = await supabase
        .from('daily_reflects')
        .upsert({
          user_id: userId,
          reflect_date: today,
          nervous_system_signals: data.nervous_system_signals,
          bandwidth: data.bandwidth,
          priority_outcome: data.priority_outcome,
          tomorrow_prep: data.tomorrow_prep,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,reflect_date',
        });

      if (upsertError) throw upsertError;

      return true;
    } catch (err) {
      console.error('Error saving reflect:', err);
      setError('Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, data]);

  return {
    data,
    loading,
    saving,
    error,
    updateSignals,
    updateBandwidth,
    updatePriorityOutcome,
    updateTomorrowPrep,
    saveReflect,
  };
}
