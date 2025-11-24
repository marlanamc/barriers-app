'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Module types that use the unified map_modules table
export type MapModuleType =
  | 'destination'
  | 'fuel_habits'
  | 'compass_setup'
  | 'energy_patterns'
  | 'storms'
  | 'drift_sirens'
  | 'lifeboat'
  | 'buoy'
  | 'logbook_style';

// Module types that use specific tables
export type SpecialModuleType =
  | 'life_vest'    // life_vest_tools table
  | 'crew'         // crew_contacts table
  | 'starlight'    // starlight_wins table
  | 'north_star'   // user_toolkit table
  | 'lighthouse'   // user_toolkit table
  | 'anchor';      // user_toolkit table

export type AllModuleTypes = MapModuleType | SpecialModuleType;

// Content structures for each module type
export interface TextModuleContent {
  text: string;
  lastUpdated?: string;
}

export interface FuelHabitsContent {
  habits: string[];
  notes?: string;
}

export interface StormsContent {
  challenges: string[];
  notes?: string;
}

export interface DriftSirensContent {
  distractions: string[];
  notes?: string;
}

export interface LifeboatContent {
  tools: string[];
  notes?: string;
}

export interface EnergyPatternsContent {
  highEnergy?: string;
  lowEnergy?: string;
  patterns?: string;
}

export interface CompassSetupContent {
  framework?: string;
  priorities?: string[];
}

export interface LifeVestTool {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  quick_access: boolean;
  sort_order: number;
}

export interface CrewContact {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: string | null;
  can_text: boolean;
  notes?: string | null;
  sort_order: number;
}

export interface StarlightWin {
  id: string;
  description: string;
  category: 'win' | 'gratitude' | 'progress';
  created_at: string;
}

export interface UserToolkit {
  north_star?: string | null;
  lighthouse?: string | null;
  lighthouse_timeframe?: string | null;
  anchor_question?: string | null;
  anchor_type?: string | null;
}

// The complete map data structure
export interface MapData {
  // From map_modules table
  destination: TextModuleContent | null;
  fuel_habits: FuelHabitsContent | null;
  compass_setup: CompassSetupContent | null;
  energy_patterns: EnergyPatternsContent | null;
  storms: StormsContent | null;
  drift_sirens: DriftSirensContent | null;
  lifeboat: LifeboatContent | null;
  buoy: TextModuleContent | null;
  logbook_style: TextModuleContent | null;

  // From specific tables
  life_vest: LifeVestTool[];
  crew: CrewContact[];
  starlight: StarlightWin[];
  toolkit: UserToolkit | null;
}

// Track which modules have content for the indicator dots
export interface ModuleHasContent {
  destination: boolean;
  fuel_habits: boolean;
  compass_setup: boolean;
  energy_patterns: boolean;
  storms: boolean;
  drift_sirens: boolean;
  lifeboat: boolean;
  buoy: boolean;
  logbook_style: boolean;
  life_vest: boolean;
  crew: boolean;
  starlight: boolean;
  north_star: boolean;
  lighthouse: boolean;
  anchor: boolean;
}

interface UseMapDataReturn {
  data: MapData;
  hasContent: ModuleHasContent;
  loading: boolean;
  saving: boolean;
  error: string | null;

  // Save functions for text-based modules
  saveModule: (moduleType: MapModuleType, content: Record<string, unknown>) => Promise<boolean>;

  // Save functions for specific tables
  saveLifeVestTools: (tools: Omit<LifeVestTool, 'id'>[]) => Promise<boolean>;
  addLifeVestTool: (tool: Omit<LifeVestTool, 'id' | 'sort_order'>) => Promise<boolean>;
  removeLifeVestTool: (toolId: string) => Promise<boolean>;

  saveCrewContacts: (contacts: Omit<CrewContact, 'id'>[]) => Promise<boolean>;
  addCrewContact: (contact: Omit<CrewContact, 'id' | 'sort_order'>) => Promise<boolean>;
  removeCrewContact: (contactId: string) => Promise<boolean>;

  addStarlightWin: (win: Omit<StarlightWin, 'id' | 'created_at'>) => Promise<boolean>;
  removeStarlightWin: (winId: string) => Promise<boolean>;

  saveToolkit: (toolkit: Partial<UserToolkit>) => Promise<boolean>;

  // Refresh data
  refresh: () => Promise<void>;
}

const initialMapData: MapData = {
  destination: null,
  fuel_habits: null,
  compass_setup: null,
  energy_patterns: null,
  storms: null,
  drift_sirens: null,
  lifeboat: null,
  buoy: null,
  logbook_style: null,
  life_vest: [],
  crew: [],
  starlight: [],
  toolkit: null,
};

const initialHasContent: ModuleHasContent = {
  destination: false,
  fuel_habits: false,
  compass_setup: false,
  energy_patterns: false,
  storms: false,
  drift_sirens: false,
  lifeboat: false,
  buoy: false,
  logbook_style: false,
  life_vest: false,
  crew: false,
  starlight: false,
  north_star: false,
  lighthouse: false,
  anchor: false,
};

function checkTextModuleHasContent(content: TextModuleContent | null): boolean {
  return Boolean(content?.text?.trim());
}

function checkArrayModuleHasContent(content: any, arrayKey: string): boolean {
  if (!content) return false;
  const arr = content[arrayKey];
  return Array.isArray(arr) && arr.length > 0 && arr.some((item: any) => typeof item === 'string' && item.trim());
}

export function useMapData(userId: string | undefined): UseMapDataReturn {
  const [data, setData] = useState<MapData>(initialMapData);
  const [hasContent, setHasContent] = useState<ModuleHasContent>(initialHasContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all map data
  const loadMapData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        mapModulesResult,
        lifeVestResult,
        crewResult,
        starlightResult,
        toolkitResult,
      ] = await Promise.all([
        // Map modules from unified table
        (supabase as any)
          .from('map_modules')
          .select('module_type, content, updated_at')
          .eq('user_id', userId),

        // Life vest tools
        (supabase as any)
          .from('life_vest_tools')
          .select('*')
          .eq('user_id', userId)
          .order('sort_order', { ascending: true }),

        // Crew contacts
        (supabase as any)
          .from('crew_contacts')
          .select('*')
          .eq('user_id', userId)
          .order('sort_order', { ascending: true }),

        // Starlight wins (recent 50)
        (supabase as any)
          .from('starlight_wins')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50),

        // User toolkit
        (supabase as any)
          .from('user_toolkit')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
      ]);

      // Process map modules
      const newData: MapData = { ...initialMapData };

      if (mapModulesResult.data) {
        for (const row of mapModulesResult.data) {
          const moduleType = row.module_type as MapModuleType;
          // Type assertion needed because TypeScript can't narrow the union type
          (newData as any)[moduleType] = row.content;
        }
      }

      // Process specific tables
      newData.life_vest = (lifeVestResult.data || []) as LifeVestTool[];
      newData.crew = (crewResult.data || []) as CrewContact[];
      newData.starlight = (starlightResult.data || []) as StarlightWin[];
      newData.toolkit = toolkitResult.data as UserToolkit | null;

      setData(newData);

      // Calculate hasContent indicators
      const contentFlags: ModuleHasContent = {
        destination: checkTextModuleHasContent(newData.destination as TextModuleContent | null),
        fuel_habits: checkArrayModuleHasContent(newData.fuel_habits, 'habits'),
        compass_setup: Boolean(newData.compass_setup?.framework?.trim() || (newData.compass_setup?.priorities?.length ?? 0) > 0),
        energy_patterns: Boolean(
          newData.energy_patterns?.highEnergy?.trim() ||
          newData.energy_patterns?.lowEnergy?.trim() ||
          newData.energy_patterns?.patterns?.trim()
        ),
        storms: checkArrayModuleHasContent(newData.storms, 'challenges'),
        drift_sirens: checkArrayModuleHasContent(newData.drift_sirens, 'distractions'),
        lifeboat: checkArrayModuleHasContent(newData.lifeboat, 'tools'),
        buoy: checkTextModuleHasContent(newData.buoy as TextModuleContent | null),
        logbook_style: checkTextModuleHasContent(newData.logbook_style as TextModuleContent | null),
        life_vest: newData.life_vest.length > 0,
        crew: newData.crew.length > 0,
        starlight: newData.starlight.length > 0,
        north_star: Boolean(newData.toolkit?.north_star?.trim()),
        lighthouse: Boolean(newData.toolkit?.lighthouse?.trim()),
        anchor: Boolean(newData.toolkit?.anchor_question?.trim()),
      };

      setHasContent(contentFlags);

    } catch (err) {
      console.error('Error loading map data:', err);
      setError('Failed to load map data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // Save a text-based module
  const saveModule = useCallback(async (
    moduleType: MapModuleType,
    content: Record<string, unknown>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const { error: upsertError } = await (supabase as any)
        .from('map_modules')
        .upsert({
          user_id: userId,
          module_type: moduleType,
          content,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,module_type',
        });

      if (upsertError) throw upsertError;

      // Update local state
      setData(prev => ({
        ...prev,
        [moduleType]: content,
      }));

      // Update hasContent
      await loadMapData();

      return true;
    } catch (err) {
      console.error('Error saving module:', err);
      setError('Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  // Life Vest Tools functions
  const saveLifeVestTools = useCallback(async (
    tools: Omit<LifeVestTool, 'id'>[]
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      // Delete existing and insert new
      await (supabase as any)
        .from('life_vest_tools')
        .delete()
        .eq('user_id', userId);

      if (tools.length > 0) {
        const inserts = tools.map((tool, index) => ({
          user_id: userId,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          quick_access: tool.quick_access,
          sort_order: index,
        }));

        const { error: insertError } = await (supabase as any)
          .from('life_vest_tools')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error saving life vest tools:', err);
      setError('Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  const addLifeVestTool = useCallback(async (
    tool: Omit<LifeVestTool, 'id' | 'sort_order'>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const nextSortOrder = data.life_vest.length;

      const { error: insertError } = await (supabase as any)
        .from('life_vest_tools')
        .insert({
          user_id: userId,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          quick_access: tool.quick_access,
          sort_order: nextSortOrder,
        });

      if (insertError) throw insertError;

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error adding life vest tool:', err);
      setError('Failed to add');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, data.life_vest.length, loadMapData]);

  const removeLifeVestTool = useCallback(async (toolId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await (supabase as any)
        .from('life_vest_tools')
        .delete()
        .eq('id', toolId);

      if (deleteError) throw deleteError;

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error removing life vest tool:', err);
      setError('Failed to remove');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  // Crew Contacts functions
  const saveCrewContacts = useCallback(async (
    contacts: Omit<CrewContact, 'id'>[]
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      await (supabase as any)
        .from('crew_contacts')
        .delete()
        .eq('user_id', userId);

      if (contacts.length > 0) {
        const inserts = contacts.map((contact, index) => ({
          user_id: userId,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          role: contact.role,
          can_text: contact.can_text,
          notes: contact.notes,
          sort_order: index,
        }));

        const { error: insertError } = await (supabase as any)
          .from('crew_contacts')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error saving crew contacts:', err);
      setError('Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  const addCrewContact = useCallback(async (
    contact: Omit<CrewContact, 'id' | 'sort_order'>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const nextSortOrder = data.crew.length;

      const { error: insertError } = await (supabase as any)
        .from('crew_contacts')
        .insert({
          user_id: userId,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          role: contact.role,
          can_text: contact.can_text,
          notes: contact.notes,
          sort_order: nextSortOrder,
        });

      if (insertError) throw insertError;

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error adding crew contact:', err);
      setError('Failed to add');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, data.crew.length, loadMapData]);

  const removeCrewContact = useCallback(async (contactId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await (supabase as any)
        .from('crew_contacts')
        .delete()
        .eq('id', contactId);

      if (deleteError) throw deleteError;

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error removing crew contact:', err);
      setError('Failed to remove');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  // Starlight Wins functions
  const addStarlightWin = useCallback(async (
    win: Omit<StarlightWin, 'id' | 'created_at'>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const { error: insertError } = await (supabase as any)
        .from('starlight_wins')
        .insert({
          user_id: userId,
          description: win.description,
          category: win.category,
        });

      if (insertError) throw insertError;

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error adding starlight win:', err);
      setError('Failed to add');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  const removeStarlightWin = useCallback(async (winId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const { error: deleteError } = await (supabase as any)
        .from('starlight_wins')
        .delete()
        .eq('id', winId);

      if (deleteError) throw deleteError;

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error removing starlight win:', err);
      setError('Failed to remove');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  // User Toolkit functions
  const saveToolkit = useCallback(async (
    toolkit: Partial<UserToolkit>
  ): Promise<boolean> => {
    if (!userId) return false;

    try {
      setSaving(true);
      setError(null);

      const { error: upsertError } = await (supabase as any)
        .from('user_toolkit')
        .upsert({
          user_id: userId,
          ...toolkit,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (upsertError) throw upsertError;

      await loadMapData();
      return true;
    } catch (err) {
      console.error('Error saving toolkit:', err);
      setError('Failed to save');
      return false;
    } finally {
      setSaving(false);
    }
  }, [userId, loadMapData]);

  return {
    data,
    hasContent,
    loading,
    saving,
    error,
    saveModule,
    saveLifeVestTools,
    addLifeVestTool,
    removeLifeVestTool,
    saveCrewContacts,
    addCrewContact,
    removeCrewContact,
    addStarlightWin,
    removeStarlightWin,
    saveToolkit,
    refresh: loadMapData,
  };
}
