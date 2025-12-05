import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENV } from '../config/env';

let supabaseInstance: SupabaseClient | null = null;

const getStorage = () => {
  // Check if we're in a browser/web environment
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          // Ignore storage errors
        }
      },
      removeItem: (key: string) => {
        try {
          window.localStorage.removeItem(key);
        } catch {
          // Ignore storage errors
        }
      },
    };
  }
  
  // For React Native, use AsyncStorage directly
  return AsyncStorage;
};

const createSupabaseClient = (): SupabaseClient => {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  supabaseInstance = createClient(
    ENV.SUPABASE_URL,
    ENV.SUPABASE_ANON_KEY,
    {
      auth: {
        storage: getStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );

  return supabaseInstance;
};

export const supabase = createSupabaseClient();
