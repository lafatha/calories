export * from './database';
export * from './mealEditor';


// Auth Types
export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  profile: Profile | null;
}

export interface User {
  id: string;
  email: string;
}

import { Profile, MealType, Meal } from './database';
export { Profile, MealType, Meal };

// AI Analysis Types
export interface FoodAnalysis {
  foods: FoodItem[];
  totalCalories: number;
  confidence: number;
  mealType: MealType;
}

export interface FoodItem {
  name: string;
  calories: number;
  portion: string;
  macros?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

// Timezone Types
export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

// Navigation Types
export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  Camera: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Stats: undefined;
  Profile: undefined;
};

