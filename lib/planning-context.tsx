'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { RecurrenceType } from './recurrence';
import { formatDateToLocalString } from './date-utils';

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

export interface PlannedFocusItem {
  id: string;
  description: string;
  categories: string[];
  barrier?: BarrierSelectionState | null;
  anchorType?: TaskAnchorType | null;
  anchorValue?: string | null;
  plannedItemId?: string | null;
}

interface PlanningContextValue {
  // Date/recurrence settings
  recurrenceType: RecurrenceType;
  setRecurrenceType: (type: RecurrenceType) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string | null;
  setEndDate: (date: string | null) => void;
  recurrenceDays: number[];
  setRecurrenceDays: (days: number[]) => void;

  // Focus items
  plannedItems: PlannedFocusItem[];
  addPlannedItem: (description: string, categories: string[]) => void;
  removePlannedItem: (id: string) => void;
  setBarrierForItem: (id: string, barrier: BarrierSelectionState | null) => void;
  setAnchorForItem: (id: string, anchor: TaskAnchorState | null) => void;

  // Reset
  resetPlanning: () => void;
}

const PlanningContext = createContext<PlanningContextValue | undefined>(undefined);

const getTomorrowISO = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateToLocalString(tomorrow);
};

export function PlanningProvider({ children }: { children: React.ReactNode }) {
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('once');
  const [startDate, setStartDate] = useState<string>(getTomorrowISO());
  const [endDate, setEndDate] = useState<string | null>(null);
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [plannedItems, setPlannedItems] = useState<PlannedFocusItem[]>([]);

  const addPlannedItem = useCallback((description: string, categories: string[]) => {
    if (!description.trim()) return;

    setPlannedItems((prev) => {
      const id = crypto.randomUUID();
      const newItem: PlannedFocusItem = {
        id,
        description: description.trim(),
        categories,
        barrier: null,
        anchorType: null,
        anchorValue: null,
        plannedItemId: null,
      };
      return [...prev, newItem];
    });
  }, []);

  const removePlannedItem = useCallback((id: string) => {
    setPlannedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const setBarrierForItem = useCallback((id: string, barrier: BarrierSelectionState | null) => {
    setPlannedItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, barrier } : item
      )
    );
  }, []);

  const setAnchorForItem = useCallback((id: string, anchor: TaskAnchorState | null) => {
    setPlannedItems((prev) =>
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

  const resetPlanning = useCallback(() => {
    setRecurrenceType('once');
    setStartDate(getTomorrowISO());
    setEndDate(null);
    setRecurrenceDays([]);
    setPlannedItems([]);
  }, []);

  const value = useMemo(
    () => ({
      recurrenceType,
      setRecurrenceType,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      recurrenceDays,
      setRecurrenceDays,
      plannedItems,
      addPlannedItem,
      removePlannedItem,
      setBarrierForItem,
      setAnchorForItem,
      resetPlanning,
    }),
    [
      recurrenceType,
      startDate,
      endDate,
      recurrenceDays,
      plannedItems,
      addPlannedItem,
      removePlannedItem,
      setBarrierForItem,
      setAnchorForItem,
      resetPlanning,
    ]
  );

  return <PlanningContext.Provider value={value}>{children}</PlanningContext.Provider>;
}

export function usePlanning() {
  const context = useContext(PlanningContext);
  if (!context) {
    throw new Error('usePlanning must be used within a PlanningProvider');
  }
  return context;
}
