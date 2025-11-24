'use client';

import { useEffect, useRef, useState } from 'react';
import { getCurrentEnergyFromSchedule, type EnergySchedule } from './supabase';
import { useSupabaseUser } from './useSupabaseUser';

// Local energy type options for notifications
type EnergyTypeOption = {
  key: string;
  label: string;
};

const internalWeatherOptions: EnergyTypeOption[] = [
  { key: 'sparky', label: 'Sparky' },
  { key: 'steady', label: 'Steady' },
  { key: 'flowing', label: 'Flowing' },
  { key: 'foggy', label: 'Foggy' },
  { key: 'resting', label: 'Resting' },
];

interface UseEnergyScheduleOptions {
  onEnergyChange?: (energyKey: string) => void;
  enableNotifications?: boolean;
}

export function useEnergySchedule(options: UseEnergyScheduleOptions = {}) {
  const { user } = useSupabaseUser();
  const { onEnergyChange, enableNotifications = true } = options;
  const [currentEnergy, setCurrentEnergy] = useState<string | null>(null);
  const [nextTransition, setNextTransition] = useState<EnergySchedule | null>(null);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const lastNotifiedScheduleRef = useRef<string | null>(null);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request notification permission
  useEffect(() => {
    if (enableNotifications && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      } else {
        setNotificationPermission(Notification.permission);
      }
    }
  }, [enableNotifications]);

  // Check for energy transitions periodically
  useEffect(() => {
    if (!user) return;

    const checkEnergySchedule = async () => {
      try {
        const result = await getCurrentEnergyFromSchedule(user.id);
        if (!result) return;

        const { energy_key, schedule, nextTransition: next } = result;

        // Update current energy
        if (energy_key !== currentEnergy) {
          setCurrentEnergy(energy_key);
          onEnergyChange?.(energy_key);

          // Send notification if enabled and permission granted
          if (
            enableNotifications &&
            notificationPermission === 'granted' &&
            schedule &&
            schedule.notify_on_transition &&
            schedule.id !== lastNotifiedScheduleRef.current
          ) {
            const energyOption = internalWeatherOptions.find((opt) => opt.key === energy_key);
            const message = energy_key === 'resting'
              ? "Entering resting period - don't try to do anything too hard"
              : `Energy level changed to ${energyOption?.label || energy_key}`;

            new Notification('Energy Level Update', {
              body: schedule.label ? `${message} (${schedule.label})` : message,
              icon: '/icon-192.png',
              tag: `energy-${schedule.id}`,
            });

            lastNotifiedScheduleRef.current = schedule.id;
          }
        }

        setNextTransition(next);
      } catch (error) {
        console.error('Error checking energy schedule:', error);
      }
    };

    // Check immediately
    checkEnergySchedule();

    // Check every minute for transitions
    checkIntervalRef.current = setInterval(checkEnergySchedule, 60000);

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [user, currentEnergy, enableNotifications, notificationPermission, onEnergyChange]);

  // Calculate minutes until next transition
  const minutesUntilNextTransition = nextTransition ? (() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const nextMinutes = nextTransition.start_time_minutes;
    
    if (nextMinutes > currentMinutes) {
      return nextMinutes - currentMinutes;
    } else {
      // Next transition is tomorrow
      return (1440 - currentMinutes) + nextMinutes;
    }
  })() : null;

  return {
    currentEnergy,
    nextTransition,
    minutesUntilNextTransition,
    notificationPermission,
    requestNotificationPermission: async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        return permission;
      }
      return 'denied' as NotificationPermission;
    },
  };
}

