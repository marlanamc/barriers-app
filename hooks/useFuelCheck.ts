'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface FuelStatus {
  water: boolean;
  food: boolean;
  meds: boolean;
  movement: boolean;
  sleep: boolean;
}

interface UseFuelCheckReturn {
  fuelStatus: FuelStatus;
  loading: boolean;
  saving: boolean;
  error: string | null;
  toggleFuel: (key: keyof FuelStatus) => Promise<void>;
  saveFuelStatus: (updates: Partial<FuelStatus>) => Promise<void>;
  fuelComplete: number;
  fuelTotal: number;
  fuelPercentage: number;
  refresh: () => Promise<void>;
}

const initialFuelStatus: FuelStatus = {
  water: false,
  food: false,
  meds: false,
  movement: false,
  sleep: false,
};

export function useFuelCheck(userId: string | undefined): UseFuelCheckReturn {
  const [fuelStatus, setFuelStatus] = useState<FuelStatus>(initialFuelStatus);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  // Load fuel status from Supabase
  const loadFuelStatus = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await (supabase as any)
        .from('fuel_checklist')
        .select('*')
        .eq('user_id', userId)
        .eq('check_date', today)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        // Silently handle missing table (migration not run yet)
        if (fetchError.code === '42P01') {
          console.warn('fuel_checklist table not found. Please run migrations.');
          setLoading(false);
          return;
        }
        throw fetchError;
      }

      if (data) {
        setFuelStatus({
          water: data.water ?? false,
          food: data.food ?? false,
          meds: data.meds ?? false,
          movement: data.movement ?? false,
          sleep: data.sleep ?? false,
        });
      } else {
        // No entry for today, reset to defaults
        setFuelStatus(initialFuelStatus);
      }
    } catch (err) {
      console.error('Error loading fuel status:', err);
      setError('Failed to load fuel status');
    } finally {
      setLoading(false);
    }
  }, [userId, today]);

  useEffect(() => {
    loadFuelStatus();
  }, [loadFuelStatus]);

  // Save fuel status to Supabase
  const saveFuelStatus = useCallback(async (updates: Partial<FuelStatus>) => {
    if (!userId) {
      console.error('Cannot save fuel status: No user ID');
      setError('You must be logged in to save changes');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const newStatus = { ...fuelStatus, ...updates };
      setFuelStatus(newStatus);

      // Use the upsert function
      const { error: upsertError } = await (supabase as any).rpc('upsert_fuel_checklist', {
        p_user_id: userId,
        p_check_date: today,
        p_water: newStatus.water,
        p_food: newStatus.food,
        p_meds: newStatus.meds,
        p_movement: newStatus.movement,
        p_sleep: newStatus.sleep,
      });

      if (upsertError) {
        // If RPC doesn't exist, try direct upsert
        if (upsertError.code === '42883') {
          const { error: directError } = await (supabase as any)
            .from('fuel_checklist')
            .upsert({
              user_id: userId,
              check_date: today,
              water: newStatus.water,
              food: newStatus.food,
              meds: newStatus.meds,
              movement: newStatus.movement,
              sleep: newStatus.sleep,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'user_id,check_date',
            });

          if (directError) throw directError;
        } else {
          throw upsertError;
        }
      }
    } catch (err) {
      console.error('Error saving fuel status:', err);
      setError('Failed to save fuel status');
      // Revert on error
      await loadFuelStatus();
    } finally {
      setSaving(false);
    }
  }, [userId, today, fuelStatus, loadFuelStatus]);

  // Toggle a specific fuel item
  const toggleFuel = useCallback(async (key: keyof FuelStatus) => {
    await saveFuelStatus({ [key]: !fuelStatus[key] });
  }, [fuelStatus, saveFuelStatus]);

  const fuelComplete = Object.values(fuelStatus).filter(Boolean).length;
  const fuelTotal = Object.keys(fuelStatus).length;
  const fuelPercentage = Math.round((fuelComplete / fuelTotal) * 100);

  return {
    fuelStatus,
    loading,
    saving,
    error,
    toggleFuel,
    saveFuelStatus,
    fuelComplete,
    fuelTotal,
    fuelPercentage,
    refresh: loadFuelStatus,
  };
}
