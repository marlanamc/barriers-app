'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const TODAY_ISO = new Date().toISOString().split('T')[0];

export interface WeatherSelection {
  key: string;
  label: string;
  icon: string;
  description: string;
}

export interface BarrierSelectionState {
  barrierTypeId?: string | null;
  barrierTypeSlug?: string | null;
  custom?: string | null;
}

export type TaskAnchorType = 'at' | 'while' | 'before' | 'after';

export interface TaskAnchorState {
  anchorType?: TaskAnchorType | null;
  anchorValue?: string | null;
}

export interface FocusItemState {
  id: string;
  description: string;
  categories: string[];
  sortOrder: number;
  plannedItemId?: string | null;
  barrier?: BarrierSelectionState | null;
  anchorType?: TaskAnchorType | null;
  anchorValue?: string | null;
  completed: boolean;
}

interface CheckInContextValue {
  weather: WeatherSelection | null;
  setWeather: (weather: WeatherSelection | null) => void;
  forecastNote: string;
  setForecastNote: (note: string) => void;
  checkinDate: string;
  setCheckinDate: (date: string) => void;
  focusItems: FocusItemState[];
  addFocusItem: (description: string, categories: string[]) => void;
  updateFocusItem: (id: string, updates: Partial<Omit<FocusItemState, 'id'>>) => void;
  removeFocusItem: (id: string) => void;
  setBarrierForFocusItem: (id: string, barrier: BarrierSelectionState | null) => void;
  setAnchorForFocusItem: (id: string, anchor: TaskAnchorState | null) => void;
  loadPlannedItems: (items: FocusItemState[]) => void;
  resetCheckIn: () => void;
}

const MAX_FOCUS_ITEMS = 5;

const CheckInContext = createContext<CheckInContextValue | undefined>(undefined);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherSelection | null>(null);
  const [forecastNote, setForecastNote] = useState('');
  const [checkinDate, setCheckinDate] = useState<string>(TODAY_ISO);
  const [focusItems, setFocusItems] = useState<FocusItemState[]>([]);

  const addFocusItem = useCallback((description: string, categories: string[]) => {
    if (!description.trim()) return;

    setFocusItems((prev) => {
      const activeCount = prev.filter((item) => !item.completed).length;
      if (activeCount >= MAX_FOCUS_ITEMS) return prev;
      const id = crypto.randomUUID();
      const next: FocusItemState = {
        id,
        description: description.trim(),
        categories,
        sortOrder: prev.length,
        plannedItemId: null,
        barrier: null,
        anchorType: null,
        anchorValue: null,
        completed: false,
      };
      return [...prev, next];
    });
  }, []);

  const updateFocusItem = useCallback((id: string, updates: Partial<Omit<FocusItemState, 'id'>>) => {
    setFocusItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
            }
          : item
      )
    );
  }, []);

  const removeFocusItem = useCallback((id: string) => {
    setFocusItems((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, sortOrder: index }))
    );
  }, []);

  const setBarrierForFocusItem = useCallback((id: string, barrier: BarrierSelectionState | null) => {
    setFocusItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              barrier,
            }
          : item
      )
    );
  }, []);

  const setAnchorForFocusItem = useCallback((id: string, anchor: TaskAnchorState | null) => {
    setFocusItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              anchorType: anchor?.anchorType ?? null,
              anchorValue: anchor?.anchorValue ?? null,
            }
          : item
      )
    );
  }, []);

  const loadPlannedItems = useCallback((items: FocusItemState[]) => {
    setFocusItems(items.map((item, index) => ({
      ...item,
      sortOrder: item.sortOrder ?? index,
      completed: item.completed ?? false,
      plannedItemId: item.plannedItemId ?? null,
      barrier: item.barrier
        ? {
            barrierTypeId: item.barrier.barrierTypeId ?? null,
            barrierTypeSlug: item.barrier.barrierTypeSlug ?? null,
            custom: item.barrier.custom ?? null,
          }
        : null,
    })));
  }, []);

  const resetCheckIn = useCallback(() => {
    setWeather(null);
    setForecastNote('');
    setCheckinDate(TODAY_ISO);
    setFocusItems([]);
  }, []);

  const value = useMemo(
    () => ({
      weather,
      setWeather,
      forecastNote,
      setForecastNote,
      checkinDate,
      setCheckinDate,
      focusItems,
      addFocusItem,
      updateFocusItem,
      removeFocusItem,
      setBarrierForFocusItem,
      setAnchorForFocusItem,
      loadPlannedItems,
      resetCheckIn,
    }),
    [weather, forecastNote, checkinDate, focusItems, addFocusItem, updateFocusItem, removeFocusItem, setBarrierForFocusItem, setAnchorForFocusItem, loadPlannedItems, resetCheckIn]
  );

  return <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>;
}

export function useCheckIn() {
  const context = useContext(CheckInContext);
  if (!context) {
    throw new Error('useCheckIn must be used within a CheckInProvider');
  }
  return context;
}

export { MAX_FOCUS_ITEMS };
