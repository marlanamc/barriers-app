'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getTodayLocalDateString } from './date-utils';

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
  reorderFocusItems: (draggedId: string, targetId: string) => void;
  setBarrierForFocusItem: (id: string, barrier: BarrierSelectionState | null) => void;
  setAnchorForFocusItem: (id: string, anchor: TaskAnchorState | null) => void;
  loadPlannedItems: (items: FocusItemState[]) => void;
  loadFocusItemsFromCheckin: (items: FocusItemState[]) => void;
  resetCheckIn: () => void;
  clearFocusItems: () => void;
  clearLocalStorageForDate: (date: string) => void;
  validationError: string | null;
  clearValidationError: () => void;
}

const MAX_FOCUS_ITEMS = 5;

const STORAGE_KEY_PREFIX = 'checkin_';

function getStorageKey(date: string): string {
  return `${STORAGE_KEY_PREFIX}${date}`;
}

interface StoredCheckInData {
  weather: WeatherSelection | null;
  forecastNote: string;
  focusItems: FocusItemState[];
  date: string;
}

function saveToLocalStorage(date: string, data: StoredCheckInData): void {
  try {
    const key = getStorageKey(date);
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save check-in to localStorage:', error);
  }
}

function loadFromLocalStorage(date: string): StoredCheckInData | null {
  try {
    const key = getStorageKey(date);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored) as StoredCheckInData;
  } catch (error) {
    console.warn('Failed to load check-in from localStorage:', error);
    return null;
  }
}

function clearLocalStorage(date: string): void {
  try {
    const key = getStorageKey(date);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear check-in from localStorage:', error);
  }
}

const CheckInContext = createContext<CheckInContextValue | undefined>(undefined);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const [weather, setWeather] = useState<WeatherSelection | null>(null);
  const [forecastNote, setForecastNote] = useState('');
  const [checkinDate, setCheckinDate] = useState<string>(() => getTodayLocalDateString());
  const [focusItems, setFocusItems] = useState<FocusItemState[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [lastResetDate, setLastResetDate] = useState(() => getTodayLocalDateString());
  const [isInitialized, setIsInitialized] = useState(false);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const addFocusItem = useCallback((description: string, categories: string[]) => {
    const trimmedDescription = description.trim();
    
    // Clear any previous validation errors
    setValidationError(null);
    
    // Validate: must have description
    if (!trimmedDescription) {
      setValidationError('Focus item description cannot be empty');
      return;
    }
    
    // Validate: max length
    if (trimmedDescription.length > 500) {
      setValidationError('Focus item description is too long (maximum 500 characters)');
      return;
    }

    setFocusItems((prev) => {
      const activeCount = prev.filter((item) => !item.completed).length;
      if (activeCount >= MAX_FOCUS_ITEMS) {
        setValidationError(`Maximum of ${MAX_FOCUS_ITEMS} focus items reached`);
        return prev;
      }
      
      // Check for duplicates (same description, case-insensitive, ignoring whitespace)
      const normalizedDescription = trimmedDescription.toLowerCase().replace(/\s+/g, ' ');
      const isDuplicate = prev.some(
        (item) => !item.completed && 
        item.description.toLowerCase().replace(/\s+/g, ' ') === normalizedDescription
      );
      if (isDuplicate) {
        setValidationError('A focus item with this description already exists');
        return prev;
      }
      
      const id = crypto.randomUUID();
      const next: FocusItemState = {
        id,
        description: trimmedDescription,
        categories: categories || [],
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
    setValidationError(null);
    
    setFocusItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        
        // Validate description if being updated
        if (updates.description !== undefined) {
          const trimmedDescription = updates.description.trim();
          if (!trimmedDescription) {
            setValidationError('Focus item description cannot be empty');
            return item; // Don't update if empty
          }
          if (trimmedDescription.length > 500) {
            setValidationError('Focus item description is too long (maximum 500 characters)');
            return item; // Don't update if too long
          }
          
          // Check for duplicates (excluding current item)
          const normalizedDescription = trimmedDescription.toLowerCase().replace(/\s+/g, ' ');
          const isDuplicate = prev.some(
            (other) => 
              other.id !== id && 
              !other.completed && 
              other.description.toLowerCase().replace(/\s+/g, ' ') === normalizedDescription
          );
          if (isDuplicate) {
            setValidationError('A focus item with this description already exists');
            return item; // Don't update if duplicate
          }
          
          return {
            ...item,
            ...updates,
            description: trimmedDescription,
          };
        }
        
        return {
          ...item,
          ...updates,
        };
      })
    );
  }, []);

  const removeFocusItem = useCallback((id: string) => {
    setFocusItems((prev) =>
      prev
        .filter((item) => item.id !== id)
        .map((item, index) => ({ ...item, sortOrder: index }))
    );
  }, []);

  const reorderFocusItems = useCallback((draggedId: string, targetId: string) => {
    setFocusItems((prev) => {
      const items = [...prev];
      const draggedIndex = items.findIndex((item) => item.id === draggedId);
      const targetIndex = items.findIndex((item) => item.id === targetId);
      
      if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
        return prev;
      }
      
      // Remove dragged item and insert at target position
      const [draggedItem] = items.splice(draggedIndex, 1);
      items.splice(targetIndex, 0, draggedItem);
      
      // Update sortOrder for all items
      return items.map((item, index) => ({
        ...item,
        sortOrder: index,
      }));
    });
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
    // Only load if we don't already have focus items (don't overwrite existing checkin data)
    setFocusItems((prev) => {
      if (prev.length > 0) return prev; // Don't overwrite existing items
      
      // Limit to MAX_FOCUS_ITEMS and filter out invalid items
      const validItems = items
        .filter((item) => item.description && item.description.trim().length > 0)
        .slice(0, MAX_FOCUS_ITEMS)
        .map((item, index) => ({
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
        }));
      
      return validItems;
    });
  }, []);

  const loadFocusItemsFromCheckin = useCallback((items: FocusItemState[]) => {
    // Only load if we don't already have focus items (don't overwrite user's current work)
    setFocusItems((prev) => {
      if (prev.length > 0) return prev; // Don't overwrite existing items
      
      // Limit to MAX_FOCUS_ITEMS and filter out invalid items
      const validItems = items
        .filter((item) => item.description && item.description.trim().length > 0)
        .slice(0, MAX_FOCUS_ITEMS)
        .map((item, index) => ({
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
        }));
      
      return validItems;
    });
  }, []);

  const clearFocusItems = useCallback(() => {
    setFocusItems([]);
  }, []);

  const resetCheckIn = useCallback(() => {
    const today = getTodayLocalDateString();
    // Clear localStorage for the old date
    if (checkinDate !== today) {
      clearLocalStorage(checkinDate);
    }
    setWeather(null);
    setForecastNote('');
    setCheckinDate(today);
    setFocusItems([]);
    setValidationError(null);
    setLastResetDate(today);
    // Clear localStorage for new date too
    clearLocalStorage(today);
  }, [checkinDate]);

  // Load from localStorage on mount
  useEffect(() => {
    if (isInitialized) return;
    
    const today = getTodayLocalDateString();
    const stored = loadFromLocalStorage(today);
    
    if (stored && stored.date === today) {
      // Only restore if we don't already have data (don't overwrite database-loaded data)
      if (!weather && focusItems.length === 0) {
        setWeather(stored.weather);
        setForecastNote(stored.forecastNote || '');
        setFocusItems(stored.focusItems || []);
      }
    }
    
    setIsInitialized(true);
  }, [isInitialized, weather, focusItems.length]);

  // Auto-save to localStorage whenever check-in data changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save during initial load
    
    const today = getTodayLocalDateString();
    // Only save if we're working on today's check-in
    if (checkinDate !== today) return;
    
    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(() => {
      saveToLocalStorage(today, {
        weather,
        forecastNote,
        focusItems,
        date: today,
      });
    }, 500); // Wait 500ms after last change before saving
    
    return () => clearTimeout(timeoutId);
  }, [weather, forecastNote, focusItems, checkinDate, isInitialized]);

  useEffect(() => {
    const checkForDateChange = () => {
      const currentDate = getTodayLocalDateString();
      setLastResetDate((previousDate) => {
        if (previousDate !== currentDate) {
          resetCheckIn();
          return currentDate;
        }
        return previousDate;
      });
    };

    const intervalId = window.setInterval(checkForDateChange, 60000);
    // Run once on mount in case the tab was suspended for a long time
    checkForDateChange();

    return () => {
      window.clearInterval(intervalId);
    };
  }, [resetCheckIn]);

  const clearLocalStorageForDate = useCallback((date: string) => {
    clearLocalStorage(date);
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
      reorderFocusItems,
      setBarrierForFocusItem,
      setAnchorForFocusItem,
      loadPlannedItems,
      loadFocusItemsFromCheckin,
      resetCheckIn,
      clearFocusItems,
      clearLocalStorageForDate,
      validationError,
      clearValidationError,
    }),
    [weather, forecastNote, checkinDate, focusItems, addFocusItem, updateFocusItem, removeFocusItem, reorderFocusItems, setBarrierForFocusItem, setAnchorForFocusItem, loadPlannedItems, loadFocusItemsFromCheckin, resetCheckIn, clearFocusItems, clearLocalStorageForDate, validationError, clearValidationError]
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
