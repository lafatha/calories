// Environment Configuration
// Uses Expo's built-in environment variable support
// Create a .env file in the root with EXPO_PUBLIC_ prefixed variables

const getEnvVar = (key: string, fallback: string = ''): string => {
  // @ts-ignore - Expo replaces these at build time
  const value = process.env[key];
  if (!value && !fallback) {
    console.warn(`Missing environment variable: ${key}`);
  }
  return value || fallback;
};

export const ENV = {
  // Supabase Configuration
  SUPABASE_URL: getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
  SUPABASE_ANON_KEY: getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
  
  // Google Gemini AI Configuration
  GEMINI_API_KEY: getEnvVar('EXPO_PUBLIC_GEMINI_API_KEY'),
} as const;

