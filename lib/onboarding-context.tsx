'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';

export interface OnboardingState {
  completed: boolean;
  currentStep: number;
  skippedSteps: string[];
  dailySchedule: {
    wake: string;
    workStart: string;
    hardStop: string;
    bedtime: string;
  } | null;
  hasSeenTip: {
    lifeMaintenanceIntro: boolean;
    barriersIntro: boolean;
    anchoringIntro: boolean;
    patternsIntro: boolean;
  };
}

interface OnboardingContextValue {
  state: OnboardingState;
  completeOnboarding: () => void;
  setCurrentStep: (step: number) => void;
  skipStep: (stepName: string) => void;
  setDailySchedule: (wake: string, workStart: string, hardStop: string, bedtime: string) => void;
  markTipAsSeen: (tipName: keyof OnboardingState['hasSeenTip']) => void;
  resetOnboarding: () => void;
}

const defaultState: OnboardingState = {
  completed: false,
  currentStep: 0,
  skippedSteps: [],
  dailySchedule: null,
  hasSeenTip: {
    lifeMaintenanceIntro: false,
    barriersIntro: false,
    anchoringIntro: false,
    patternsIntro: false,
  },
};

const STORAGE_KEY = 'onboarding_state';

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>(defaultState);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setState(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
    }
    setMounted(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (mounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save onboarding state:', error);
      }
    }
  }, [state, mounted]);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, completed: true }));
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
  }, []);

  const skipStep = useCallback((stepName: string) => {
    setState((prev) => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps, stepName],
    }));
  }, []);

  const setDailySchedule = useCallback((wake: string, workStart: string, hardStop: string, bedtime: string) => {
    setState((prev) => ({
      ...prev,
      dailySchedule: { wake, workStart, hardStop, bedtime },
    }));
  }, []);

  const markTipAsSeen = useCallback((tipName: keyof OnboardingState['hasSeenTip']) => {
    setState((prev) => ({
      ...prev,
      hasSeenTip: {
        ...prev.hasSeenTip,
        [tipName]: true,
      },
    }));
  }, []);

  const resetOnboarding = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = {
    state,
    completeOnboarding,
    setCurrentStep,
    skipStep,
    setDailySchedule,
    markTipAsSeen,
    resetOnboarding,
  };

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
