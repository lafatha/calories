import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

export const useMeals = (date?: Date) => {
  const { user, profile } = useAuth();
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

  // Memoize dateString to prevent unnecessary re-renders
  const dateString = useMemo(() => {
    return date 
      ? date.toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];
  }, [date?.getTime()]);

  // Fetch meals for the day
  const fetchMeals = useCallback(async (showLoading = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Only show loading on first fetch or when date changes
    const isDateChange = lastDateRef.current !== dateString;
    const shouldShowLoading = !hasFetchedRef.current || isDateChange || showLoading;
    
    if (shouldShowLoading) {
      setIsLoading(true);
    }
    setError(null);
    lastDateRef.current = dateString;

    try {
      const startOfDay = `${dateString}T00:00:00.000Z`;
      const endOfDay = `${dateString}T23:59:59.999Z`;

      const { data, error: fetchError } = await supabase
        .from('meals')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDay)
        .lte('logged_at', endOfDay)
        .order('logged_at', { ascending: true });

      if (fetchError) throw fetchError;

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

      setMeals(organized);
      setStats({
        totalCalories: totalCals,
        breakfastCalories: breakfastCals,
        lunchCalories: lunchCals,
        dinnerCalories: dinnerCals,
        snackCalories: snackCals,
        goalProgress: profile?.daily_calorie_goal 
          ? Math.min((totalCals / profile.daily_calorie_goal) * 100, 100)
          : 0,
      });
      
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('Error fetching meals:', err);
      setError('Failed to load meals');
    } finally {
      setIsLoading(false);
    }
  }, [user, dateString, profile?.daily_calorie_goal]);

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

      console.log('Saving meal:', { foodName, calories, mealType, userId: user.id });

      const { data, error: insertError } = await supabase
        .from('meals')
        .insert({
          user_id: user.id,
          food_name: foodName,
          calories: Math.round(calories), // Ensure integer
          meal_type: mealType,
          image_url: null, // Don't store local file URIs
          ai_analysis: simplifiedAnalysis,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', insertError);
        throw insertError;
      }

      console.log('Meal saved successfully:', data);

      // Refresh meals
      await fetchMeals();

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

      // Group by date
      const dailyCalories: { [date: string]: number } = {};
      ((data as { logged_at: string; calories: number }[]) || []).forEach((meal) => {
        const date = meal.logged_at.split('T')[0];
        dailyCalories[date] = (dailyCalories[date] || 0) + meal.calories;
      });

      // Calculate consecutive day streak (counting backward from today)
      let consecutiveStreak = 0;
      const checkDate = new Date(today);
      
      // Check consecutive days starting from today
      for (let i = 0; i < 90; i++) {
        const dateStr = checkDate.toISOString().split('T')[0];
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
        const dateStr = date.toISOString().split('T')[0];
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
  }, [user, profile?.daily_calorie_goal]);

  useEffect(() => {
    fetchWeeklyStats();
  }, [fetchWeeklyStats]);

  return { ...weeklyData, isLoading, refresh: fetchWeeklyStats };
};
