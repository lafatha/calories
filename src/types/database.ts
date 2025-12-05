export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          daily_calorie_goal: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          daily_calorie_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          daily_calorie_goal?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      meals: {
        Row: {
          id: string;
          user_id: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_name: string;
          calories: number;
          image_url: string | null;
          ai_analysis: Json | null;
          logged_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_name: string;
          calories: number;
          image_url?: string | null;
          ai_analysis?: Json | null;
          logged_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
          food_name?: string;
          calories?: number;
          image_url?: string | null;
          ai_analysis?: Json | null;
          logged_at?: string;
          created_at?: string;
        };
      };
      daily_summaries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          total_calories: number;
          breakfast_calories: number;
          lunch_calories: number;
          dinner_calories: number;
          snack_calories: number;
          goal_met: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          total_calories?: number;
          breakfast_calories?: number;
          lunch_calories?: number;
          dinner_calories?: number;
          snack_calories?: number;
          goal_met?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          total_calories?: number;
          breakfast_calories?: number;
          lunch_calories?: number;
          dinner_calories?: number;
          snack_calories?: number;
          goal_met?: boolean;
          created_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Meal = Database['public']['Tables']['meals']['Row'];
export type DailySummary = Database['public']['Tables']['daily_summaries']['Row'];
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

