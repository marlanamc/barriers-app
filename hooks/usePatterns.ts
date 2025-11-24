'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface DailyReflect {
  id: string;
  reflect_date: string;
  nervous_system_signals: string[];
  bandwidth: string | null;
  priority_outcome: string | null;
  tomorrow_prep: string | null;
  created_at: string;
}

export interface SignalCount {
  signal: string;
  count: number;
  label: string;
}

export interface DayTypeCount {
  type: string;
  count: number;
  label: string;
  color: string;
}

export interface PatternsData {
  weeklyReflects: DailyReflect[];
  allReflects: DailyReflect[];
  signalCounts: SignalCount[];
  dayTypeCounts: DayTypeCount[];
  totalDays: number;
}

const NERVOUS_SYSTEM_SIGNALS: Record<string, string> = {
  'jaw_tight': 'Jaw tight',
  'shoulders_raised': 'Shoulders raised',
  'stomach_tight': 'Stomach tight',
  'eyes_tired': 'Eyes tired',
  'mind_racing': 'Mind racing',
  'zoning_out': 'Zoning out',
  'heavy_body': 'Heavy/sluggish body',
  'restless': 'Restless/fidgety',
  'calm_neutral': 'Calm/neutral',
};

const DAY_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  'a_little': { label: 'Got things done', color: 'emerald' },
  'not_much': { label: 'Struggled', color: 'amber' },
  'running_on_empty': { label: 'Survival mode', color: 'violet' },
};

interface UsePatternsReturn {
  data: PatternsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePatterns(userId: string | undefined): UsePatternsReturn {
  const [data, setData] = useState<PatternsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPatterns = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get date range for last 7 days
      const today = new Date();
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 6);

      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      // Fetch all reflects for the user (last 30 days for patterns)
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29);

      const { data: reflects, error: fetchError } = await (supabase as any)
        .from('daily_reflects')
        .select('*')
        .eq('user_id', userId)
        .gte('reflect_date', formatDate(thirtyDaysAgo))
        .order('reflect_date', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const allReflects = (reflects || []) as DailyReflect[];

      // Filter weekly reflects
      const weeklyReflects = allReflects.filter(r =>
        r.reflect_date >= formatDate(weekAgo)
      );

      // Calculate signal counts across all reflects
      const signalCountMap = new Map<string, number>();
      allReflects.forEach(reflect => {
        (reflect.nervous_system_signals || []).forEach(signal => {
          signalCountMap.set(signal, (signalCountMap.get(signal) || 0) + 1);
        });
      });

      const signalCounts: SignalCount[] = Array.from(signalCountMap.entries())
        .map(([signal, count]) => ({
          signal,
          count,
          label: NERVOUS_SYSTEM_SIGNALS[signal] || signal,
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate day type breakdown
      const dayTypeCountMap = new Map<string, number>();
      allReflects.forEach(reflect => {
        if (reflect.bandwidth) {
          dayTypeCountMap.set(reflect.bandwidth, (dayTypeCountMap.get(reflect.bandwidth) || 0) + 1);
        }
      });

      const dayTypeCounts: DayTypeCount[] = Array.from(dayTypeCountMap.entries())
        .map(([type, count]) => ({
          type,
          count,
          label: DAY_TYPE_CONFIG[type]?.label || type,
          color: DAY_TYPE_CONFIG[type]?.color || 'slate',
        }))
        .sort((a, b) => b.count - a.count);

      setData({
        weeklyReflects,
        allReflects,
        signalCounts,
        dayTypeCounts,
        totalDays: allReflects.length,
      });
    } catch (err) {
      console.error('Error loading patterns:', err);
      setError('Failed to load patterns data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadPatterns();
  }, [loadPatterns]);

  return {
    data,
    loading,
    error,
    refresh: loadPatterns,
  };
}
