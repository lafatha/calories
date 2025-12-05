import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Meal, MealType, FoodAnalysis } from '../types';

interface DayMeals {
  breakfast: Meal[];
  lunch: Meal[];
  dinner: Meal[];
  snack: Meal[];
}

interface MealStats {
  totalCalories: number;
  breakfastCalories: number;
  lunchCalories: number;
  dinnerCalories: number;
  snackCalories: number;
  goalProgress: number;
}

// Helper to get date string in user's timezone
const getLocalDateString = (date: Date, timezone: string): string => {
  try {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    return `${year}-${month}-${day}`;
  } catch {
    return date.toISOString().split('T')[0];
  }
};

// Get timezone offset in hours (positive = ahead of UTC, e.g., +7 for Jakarta)
const getTimezoneOffsetHours = (timezone: string): number => {
  try {
    const now = new Date();
    // Get the offset by formatting the same moment in UTC vs the timezone
    const utcHour = parseInt(now.toLocaleString('en-US', { timeZone: 'UTC', hour: 'numeric', hour12: false }));
    const tzHour = parseInt(now.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', hour12: false }));
    const utcDay = parseInt(now.toLocaleString('en-US', { timeZone: 'UTC', day: 'numeric' }));
    const tzDay = parseInt(now.toLocaleString('en-US', { timeZone: timezone, day: 'numeric' }));
    
    let diff = tzHour - utcHour;
    // Handle day boundary
    if (tzDay > utcDay) diff += 24;
    if (tzDay < utcDay) diff -= 24;
    
    return diff;
  } catch {
    return 0;
  }
};

export const useMeals = (date?: Date) => {
  const { user, profile } = useAuth();
  const timezone = profile?.timezone || 'Asia/Jakarta';
  
  const [meals, setMeals] = useState<DayMeals>({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });
  const [stats, setStats] = useState<MealStats>({
    totalCalories: 0,
    breakfastCalories: 0,
    lunchCalories: 0,
    dinnerCalories: 0,
    snackCalories: 0,
    goalProgress: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const lastDateRef = useRef<string | null>(null);

  // Memoize dateString using user's timezone
  const dateString = useMemo(() => {
    const targetDate = date || new Date();
    return getLocalDateString(targetDate, timezone);
  }, [date?.getTime(), timezone]);

  // Cache helper functions
  const getCacheKey = useCallback((dateStr: string) => {
    return `meals_cache_${user?.id}_${dateStr}`;
  }, [user?.id]);

  const loadFromCache = useCallback(async (dateStr: string) => {
    try {
      const cacheKey = getCacheKey(dateStr);
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (less than 5 minutes old)
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (cacheAge < 5 * 60 * 1000) { // 5 minutes
          return parsed.data;
        }
      }
    } catch (error) {
      console.error('[Meals] Cache load error:', error);
    }
    return null;
  }, [getCacheKey]);

  const saveToCache = useCallback(async (dateStr: string, data: { meals: DayMeals; stats: MealStats }) => {
    try {
      const cacheKey = getCacheKey(dateStr);
      await AsyncStorage.setItem(cacheKey, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('[Meals] Cache save error:', error);
    }
  }, [getCacheKey]);

  // Get UTC boundaries for a local date in user's timezone
  const getUTCBoundaries = useCallback((localDateStr: string, tz: string) => {
    try {
      // Get offset: for Jakarta (UTC+7), offset = 7
      const offsetHours = getTimezoneOffsetHours(tz);
      
      // Parse the local date
      const [year, month, day] = localDateStr.split('-').map(Number);
      
      // Local midnight in UTC = midnight - offset hours
      // For Jakarta Dec 6, 00:00 local = Dec 5, 17:00 UTC (subtract 7 hours)
      const startHourUTC = 0 - offsetHours;
      const endHourUTC = 23 - offsetHours;
      
      let startDate = day;
      let startMonth = month;
      let startYear = year;
      let endDate = day;
      let endMonth = month;
      let endYear = year;
      
      // Handle day rollover for start
      if (startHourUTC < 0) {
        // Previous day
        const prevDay = new Date(year, month - 1, day - 1);
        startDate = prevDay.getDate();
        startMonth = prevDay.getMonth() + 1;
        startYear = prevDay.getFullYear();
      }
      
      // Handle day rollover for end
      if (endHourUTC < 0) {
        const prevDay = new Date(year, month - 1, day - 1);
        endDate = prevDay.getDate();
        endMonth = prevDay.getMonth() + 1;
        endYear = prevDay.getFullYear();
      } else if (endHourUTC >= 24) {
        const nextDay = new Date(year, month - 1, day + 1);
        endDate = nextDay.getDate();
        endMonth = nextDay.getMonth() + 1;
        endYear = nextDay.getFullYear();
      }
      
      const startHourNormalized = ((startHourUTC % 24) + 24) % 24;
      const endHourNormalized = ((endHourUTC % 24) + 24) % 24;
      
      const start = `${startYear}-${String(startMonth).padStart(2, '0')}-${String(startDate).padStart(2, '0')}T${String(startHourNormalized).padStart(2, '0')}:00:00.000Z`;
      const end = `${endYear}-${String(endMonth).padStart(2, '0')}-${String(endDate).padStart(2, '0')}T${String(endHourNormalized).padStart(2, '0')}:59:59.999Z`;
      
      console.log(`[Meals] Timezone: ${tz}, Offset: +${offsetHours}h`);
      console.log(`[Meals] Local date: ${localDateStr}`);
      console.log(`[Meals] UTC range: ${start} to ${end}`);
      
      return { start, end };
    } catch (e) {
      console.error('Timezone calculation error:', e);
      return {
        start: `${localDateStr}T00:00:00.000Z`,
        end: `${localDateStr}T23:59:59.999Z`,
      };
    }
  }, []);

  // Fetch meals for the day
  const fetchMeals = useCallback(async (showLoading = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Only show loading on first fetch or when date changes
    const isDateChange = lastDateRef.current !== dateString;
    const shouldShowLoading = !hasFetchedRef.current || isDateChange || showLoading;
    
    setError(null);
    lastDateRef.current = dateString;

    // Try to load from cache first
    const cachedData = await loadFromCache(dateString);
    let useCache = false;
    
    if (cachedData) {
      console.log('[Meals] Loaded from cache for', dateString);
      setMeals(cachedData.meals);
      setStats(cachedData.stats);
      setIsLoading(false);
      hasFetchedRef.current = true;
      useCache = true;
    } else if (shouldShowLoading) {
      setIsLoading(true);
    }

    // Always fetch in background to update cache (even if we have cache)
    try {
      // Get UTC boundaries with error handling
      let startOfDay: string;
      let endOfDay: string;
      
      try {
        const boundaries = getUTCBoundaries(dateString, timezone);
        startOfDay = boundaries.start;
        endOfDay = boundaries.end;
      } catch (boundaryError) {
        console.error('[Meals] Timezone boundary error, using fallback:', boundaryError);
        // Fallback to simple UTC
        startOfDay = `${dateString}T00:00:00.000Z`;
        endOfDay = `${dateString}T23:59:59.999Z`;
      }

      // Fetch meals
      const { data, error: fetchError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay)
        .lte('logged_at', endOfDay)
        .order('logged_at', { ascending: true });

      if (fetchError) {
        // If we have cached data, use it and don't show error
        if (useCache) {
          console.log('[Meals] Fetch error but using cached data');
          return;
        }
        throw fetchError;
      }
      
      console.log(`[Meals] Fetched ${data?.length || 0} meals for ${dateString}`);

      // Organize meals by type
      const organized: DayMeals = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };

      let totalCals = 0;
      let breakfastCals = 0;
      let lunchCals = 0;
      let dinnerCals = 0;
      let snackCals = 0;

      ((data as Meal[]) || []).forEach((meal: Meal) => {
        organized[meal.meal_type].push(meal);
        totalCals += meal.calories;
        
        switch (meal.meal_type) {
          case 'breakfast':
            breakfastCals += meal.calories;
            break;
          case 'lunch':
            lunchCals += meal.calories;
            break;
          case 'dinner':
            dinnerCals += meal.calories;
            break;
          case 'snack':
            snackCals += meal.calories;
            break;
        }
      });

      const newStats = {
        totalCalories: totalCals,
        breakfastCalories: breakfastCals,
        lunchCalories: lunchCals,
        dinnerCalories: dinnerCals,
        snackCalories: snackCals,
        goalProgress: profile?.daily_calorie_goal 
          ? Math.min((totalCals / profile.daily_calorie_goal) * 100, 100)
          : 0,
      };

      setMeals(organized);
      setStats(newStats);
      
      // Save to cache
      await saveToCache(dateString, { meals: organized, stats: newStats });
      
      hasFetchedRef.current = true;
      
      // If we used cache initially, silently update without showing loading
      if (useCache) {
        console.log('[Meals] Silently updated from server');
      }
    } catch (err) {
      console.error('[Meals] Error fetching meals:', err);
      
      // Only show error if we don't have cached data
      if (!useCache) {
        setError('Failed to load meals');
      }
      // Set empty state on error
      setMeals({
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      });
      setStats({
        totalCalories: 0,
        breakfastCalories: 0,
        lunchCalories: 0,
        dinnerCalories: 0,
        snackCalories: 0,
        goalProgress: 0,
      });
      
      // Try to load from cache as fallback
      const fallbackCache = await loadFromCache(dateString);
      if (fallbackCache) {
        console.log('[Meals] Using cached data as fallback');
        setMeals(fallbackCache.meals);
        setStats(fallbackCache.stats);
      }
    } finally {
      // Always ensure loading is false
      setIsLoading(false);
    }
  }, [user, dateString, timezone, getUTCBoundaries, profile?.daily_calorie_goal, loadFromCache, saveToCache]);

  // Add a new meal
  const addMeal = async (
    foodName: string,
    calories: number,
    mealType: MealType,
    imageUrl?: string,
    analysis?: FoodAnalysis
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Simplify the analysis data to avoid large JSON issues
      const simplifiedAnalysis = analysis ? {
        totalCalories: analysis.totalCalories,
        confidence: analysis.confidence,
        foods: analysis.foods.map(f => ({
          name: f.name,
          calories: f.calories,
          portion: f.portion,
          macros: f.macros || null,
        })),
      } : null;

      console.log('[useMeals] Saving meal:', { foodName, calories, mealType, userId: user.id });

      const insertData = {
        user_id: user.id,
        food_name: foodName,
        calories: Math.round(calories), // Ensure integer
        meal_type: mealType,
        image_url: null, // Don't store local file URIs
        ai_analysis: simplifiedAnalysis,
        logged_at: new Date().toISOString(),
      };
      
      console.log('[useMeals] Insert data:', JSON.stringify(insertData, null, 2));

      const { data, error: insertError } = await supabase
        .from('meals')
        .insert(insertData)
        .select()
        .single();

      if (insertError) {
        console.error('[useMeals] Supabase insert error:', insertError);
        console.error('[useMeals] Error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
        });
        throw insertError;
      }

      console.log('Meal saved successfully:', data);

      // Refresh meals (don't await - let it happen in background)
      fetchMeals(false).catch(err => {
        console.error('Error refreshing meals after save:', err);
      });

      return { data, error: null };
    } catch (err: any) {
      console.error('Error adding meal:', err?.message || err);
      return { error: err as Error };
    }
  };

  // Delete a meal
  const deleteMeal = async (mealId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (deleteError) throw deleteError;

      await fetchMeals();
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  return {
    meals,
    stats,
    isLoading,
    error,
    addMeal,
    deleteMeal,
    refresh: fetchMeals,
  };
};

// Hook for weekly stats with proper consecutive day streak calculation
export const useWeeklyStats = () => {
  const { user, profile } = useAuth();
  const timezone = profile?.timezone || 'Asia/Jakarta';
  
  const [weeklyData, setWeeklyData] = useState<{
    days: { date: string; calories: number; goalMet: boolean; hasEntries: boolean }[];
    averageCalories: number;
    daysOnTrack: number;
    consecutiveStreak: number;
  }>({
    days: [],
    averageCalories: 0,
    daysOnTrack: 0,
    consecutiveStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchWeeklyStats = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const today = new Date();
      // Fetch last 90 days of data to calculate proper streak
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(today.getDate() - 90);

      const { data, error } = await supabase
        .from('meals')
        .select('logged_at, calories')
        .eq('user_id', user.id)
        .gte('logged_at', ninetyDaysAgo.toISOString())
        .lte('logged_at', today.toISOString());

      if (error) throw error;

      // Group by local date in user's timezone
      const dailyCalories: { [date: string]: number } = {};
      ((data as { logged_at: string; calories: number }[]) || []).forEach((meal) => {
        // Convert UTC timestamp to local date
        const mealDate = new Date(meal.logged_at);
        const localDate = getLocalDateString(mealDate, timezone);
        dailyCalories[localDate] = (dailyCalories[localDate] || 0) + meal.calories;
      });

      // Calculate consecutive day streak (counting backward from today)
      let consecutiveStreak = 0;
      const checkDate = new Date(today);
      
      // Check consecutive days starting from today
      for (let i = 0; i < 90; i++) {
        const dateStr = getLocalDateString(checkDate, timezone);
        const hasEntries = (dailyCalories[dateStr] || 0) > 0;
        
        if (hasEntries) {
          consecutiveStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          // Streak broken - stop counting
          break;
        }
      }

      // Create 7-day array for weekly display
      const days = [];
      let totalCalories = 0;
      let daysOnTrack = 0;

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = getLocalDateString(date, timezone);
        const calories = dailyCalories[dateStr] || 0;
        const hasEntries = calories > 0;
        const goalMet = profile?.daily_calorie_goal 
          ? calories <= profile.daily_calorie_goal && calories >= profile.daily_calorie_goal * 0.8
          : false;

        days.push({ date: dateStr, calories, goalMet, hasEntries });
        totalCalories += calories;
        if (goalMet) daysOnTrack++;
      }

      setWeeklyData({
        days,
        averageCalories: Math.round(totalCalories / 7),
        daysOnTrack,
        consecutiveStreak,
      });
    } catch (err) {
      console.error('Error fetching weekly stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, timezone, profile?.daily_calorie_goal]);

  useEffect(() => {
    fetchWeeklyStats();
  }, [fetchWeeklyStats]);

  return { ...weeklyData, isLoading, refresh: fetchWeeklyStats };
};
