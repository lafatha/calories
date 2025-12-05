import { useState, useEffect, useCallback } from 'react';
import { MealType } from '../types';

interface TimeState {
  currentTime: Date;
  formattedTime: string;
  formattedDate: string;
  greeting: string;
  currentMealType: MealType;
  mealTimeRange: string;
}

// Get meal type based on hour
const getMealType = (hour: number): MealType => {
  if (hour >= 5 && hour < 10) return 'breakfast';
  if (hour >= 10 && hour < 17) return 'lunch';
  return 'dinner';
};

// Get meal time range string
const getMealTimeRange = (mealType: MealType): string => {
  switch (mealType) {
    case 'breakfast':
      return '5:00 AM - 10:00 AM';
    case 'lunch':
      return '10:00 AM - 5:00 PM';
    case 'dinner':
      return '5:00 PM - 5:00 AM';
    default:
      return '';
  }
};

// Get greeting based on time of day
const getGreeting = (hour: number): string => {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
};

// Format time for specific timezone
const formatTimeForTimezone = (date: Date, timezone: string): string => {
  try {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
};

// Format date for specific timezone
const formatDateForTimezone = (date: Date, timezone: string): string => {
  try {
    return date.toLocaleDateString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }
};

// Get hour for timezone
const getHourForTimezone = (date: Date, timezone: string): number => {
  try {
    const timeString = date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });
    return parseInt(timeString, 10);
  } catch {
    return date.getHours();
  }
};

export const useTime = (timezone: string = 'Asia/Jakarta'): TimeState => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const hour = getHourForTimezone(currentTime, timezone);
  const currentMealType = getMealType(hour);

  return {
    currentTime,
    formattedTime: formatTimeForTimezone(currentTime, timezone),
    formattedDate: formatDateForTimezone(currentTime, timezone),
    greeting: getGreeting(hour),
    currentMealType,
    mealTimeRange: getMealTimeRange(currentMealType),
  };
};

// Hook for countdown to next meal
export const useNextMealCountdown = (timezone: string = 'Asia/Jakarta') => {
  const [countdown, setCountdown] = useState('');
  const [nextMeal, setNextMeal] = useState<MealType>('breakfast');

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const hour = getHourForTimezone(now, timezone);
      
      let targetHour: number;
      let targetMeal: MealType;

      if (hour >= 5 && hour < 10) {
        targetHour = 10;
        targetMeal = 'lunch';
      } else if (hour >= 10 && hour < 17) {
        targetHour = 17;
        targetMeal = 'dinner';
      } else {
        targetHour = 5;
        targetMeal = 'breakfast';
      }

      setNextMeal(targetMeal);

      // Calculate time difference
      const target = new Date(now);
      target.setHours(targetHour, 0, 0, 0);
      
      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setCountdown(`${hours}h ${minutes}m`);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [timezone]);

  return { countdown, nextMeal };
};

