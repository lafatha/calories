import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    isDark: boolean;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    colors: typeof lightColors;
}

// Light Mode Colors - Clean and modern
const lightColors = {
    // Primary
    primary: {
        main: '#6366F1',      // Indigo
        light: '#818CF8',
        dark: '#4F46E5',
    },
    // Secondary
    secondary: {
        main: '#F43F5E',      // Rose
        light: '#FB7185',
        dark: '#E11D48',
    },
    // Accent colors
    accent: {
        green: '#10B981',
        orange: '#F59E0B',
        blue: '#3B82F6',
        purple: '#8B5CF6',
        red: '#EF4444',
    },
    // Neutrals
    neutral: {
        white: '#FFFFFF',
        offWhite: '#FAFAFA',
        lightGray: '#F3F4F6',
        mediumGray: '#E5E7EB',
        gray: '#9CA3AF',
        darkGray: '#6B7280',
        charcoal: '#374151',
        black: '#111827',
    },
    // Backgrounds
    background: {
        primary: '#FFFFFF',
        secondary: '#F9FAFB',
        tertiary: '#F3F4F6',
        card: '#FFFFFF',
    },
    // Text
    text: {
        primary: '#111827',
        secondary: '#6B7280',
        tertiary: '#9CA3AF',
        inverse: '#FFFFFF',
    },
    // Meal colors
    meal: {
        breakfast: '#F59E0B',
        lunch: '#10B981',
        dinner: '#6366F1',
        snack: '#EC4899',
    },
    // Semantic
    semantic: {
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },
    // Borders
    border: {
        light: '#E5E7EB',
        medium: '#D1D5DB',
    },
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.08)',
    // Input
    input: {
        background: '#FFFFFF',
        border: '#E5E7EB',
        borderFocus: '#6366F1',
        placeholder: '#9CA3AF',
    },
};

// Dark Mode Colors - Improved for eye comfort with softer contrast
const darkColors = {
    // Primary - softer indigo for dark mode
    primary: {
        main: '#818CF8',
        light: '#A5B4FC',
        dark: '#6366F1',
    },
    // Secondary
    secondary: {
        main: '#FB7185',
        light: '#FDA4AF',
        dark: '#F43F5E',
    },
    // Accent colors - slightly muted for comfort
    accent: {
        green: '#4ADE80',      // Softer green
        orange: '#FCD34D',     // Warmer yellow-orange
        blue: '#7DD3FC',       // Softer sky blue
        purple: '#C4B5FD',     // Lighter purple
        red: '#FCA5A5',        // Softer red
    },
    // Neutrals
    neutral: {
        white: '#1E293B',
        offWhite: '#0F172A',
        lightGray: '#334155',
        mediumGray: '#475569',
        gray: '#64748B',
        darkGray: '#94A3B8',
        charcoal: '#CBD5E1',
        black: '#F1F5F9',
    },
    // Backgrounds - Softer dark with subtle blue undertone for comfort
    background: {
        primary: '#0F172A',     // Slate 900 - softer than pure black
        secondary: '#1E293B',   // Slate 800 - main content area
        tertiary: '#334155',    // Slate 700 - for nested elements
        card: '#1E293B',        // Cards match secondary for clean look
    },
    // Text - Reduced contrast for eye comfort
    text: {
        primary: '#E2E8F0',     // Slate 200 - less harsh than pure white
        secondary: '#94A3B8',   // Slate 400
        tertiary: '#64748B',    // Slate 500
        inverse: '#0F172A',
    },
    // Meal colors - softer for dark mode
    meal: {
        breakfast: '#FCD34D',   // Amber
        lunch: '#4ADE80',       // Green
        dinner: '#A5B4FC',      // Indigo
        snack: '#F9A8D4',       // Pink
    },
    // Semantic
    semantic: {
        success: '#4ADE80',
        warning: '#FCD34D',
        error: '#FCA5A5',
        info: '#7DD3FC',
    },
    // Borders - more visible
    border: {
        light: '#334155',
        medium: '#475569',
    },
    // Shadows - subtle
    shadow: 'rgba(0, 0, 0, 0.5)',
    // Input - improved for dark mode
    input: {
        background: '#1E293B',
        border: '#475569',
        borderFocus: '#818CF8',
        placeholder: '#64748B',
    },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const systemColorScheme = useColorScheme();
    // Default to 'light' instead of 'system'
    const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved theme preference
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
                    setThemeModeState(saved);
                }
                // If no saved preference, keep 'light' as default
            } catch (e) {
                console.error('Failed to load theme:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, []);

    // Save theme preference
    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
            setThemeModeState(mode);
        } catch (e) {
            console.error('Failed to save theme:', e);
        }
    };

    // Determine if dark mode should be active
    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');

    // Get the appropriate colors
    const colors = isDark ? darkColors : lightColors;

    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ isDark, themeMode, setThemeMode, colors }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export { lightColors, darkColors };
