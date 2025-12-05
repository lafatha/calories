// Modern Blue-Purple Premium Theme for Calories AI App
import { Platform } from 'react-native';

export const COLORS = {
  primary: {
    main: '#007AFF',      // iOS blue - cleaner and softer
    light: '#5AC8FA',     // Light blue
    dark: '#0051D5',      // Darker blue
    gradient: ['#007AFF', '#5AC8FA'], // Blue gradient
  },
  secondary: {
    main: '#F43F5E',      // Rose
    light: '#FB7185',     // Light Rose
    dark: '#E11D48',      // Dark Rose
  },
  accent: {
    green: '#34C759',     // Softer iOS green
    orange: '#FF9500',    // Softer iOS orange
    red: '#FF3B30',       // Softer iOS red
    purple: '#AF52DE',    // Softer purple
    pink: '#FF2D55',      // Softer pink
    teal: '#5AC8FA',      // Softer teal
    blue: '#007AFF',      // iOS blue
  },
  gold: {
    main: '#FFD700',      // Classic gold
    light: '#FFE55C',     // Light gold / shine
    dark: '#B8860B',      // Dark goldenrod
    shimmer: '#FFA500',   // Orange-gold for shimmer
  },
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAFBFC',
    lightGray: '#F1F5F9', // Slate 100
    mediumGray: '#E2E8F0', // Slate 200
    gray: '#94A3B8',      // Slate 400
    darkGray: '#64748B',  // Slate 500
    charcoal: '#334155',  // Slate 700
    black: '#0F172A',     // Slate 900
  },
  semantic: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F5F5F7', // Softer light gray like iOS
    tertiary: '#F1F1F3', // Even softer for subtle sections
    gradient: ['#F5F5F7', '#FFFFFF'], // Soft gradient
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  meal: {
    breakfast: '#FF9500',   // Softer orange for morning
    lunch: '#34C759',       // Softer green for midday
    dinner: '#AF52DE',      // Softer purple for evening
    snack: '#FF2D55',       // Softer pink for snacks
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: 'rgba(79, 70, 229, 0.1)',
  },
};

export const TYPOGRAPHY = {
  fontFamily: {
    // San Francisco on iOS, Roboto on Android (system defaults that match Apple style)
    primary: Platform.select({
      ios: 'System',
      android: 'System',
      default: 'System',
    }),
    // SF Pro Display style for larger text
    display: Platform.select({
      ios: 'System',
      android: 'System',
      default: 'System',
    }),
    mono: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  // Apple-style font sizes (following SF Pro guidelines)
  fontSizes: {
    xs: 11,      // Caption 2
    sm: 13,      // Footnote
    base: 15,    // Subheadline
    md: 17,      // Body (Apple's default body size)
    lg: 20,      // Title 3
    xl: 22,      // Title 2
    '2xl': 28,   // Title 1
    '3xl': 34,   // Large Title
    '4xl': 40,
    hero: 48,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
    black: '900' as const,
  },
  lineHeights: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.35,   // Apple uses tighter line heights
    relaxed: 1.5,
  },
  // Apple-style letter spacing (SF Pro uses negative tracking for large text)
  letterSpacing: {
    tighter: -0.8,
    tight: -0.4,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,      // More generous spacing
  '2xl': 28,
  '3xl': 36,
  '4xl': 44,
  '5xl': 52,
  '6xl': 64,
  screenPadding: 20,
  cardPadding: 20,  // More padding in cards
};

export const LAYOUT = {
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },
  safeArea: {
    top: 44,
    bottom: 34,
  },
  maxWidth: 428,
};

export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: COLORS.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: COLORS.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: COLORS.neutral.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: COLORS.neutral.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: COLORS.neutral.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: COLORS.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  glowSoft: {
    shadowColor: COLORS.primary.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const ANIMATIONS = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    easeOut: 'ease-out',
    easeIn: 'ease-in',
    easeInOut: 'ease-in-out',
    spring: 'spring',
  },
};

export const GRADIENTS = {
  primary: ['#4F46E5', '#7C3AED'],
  primarySoft: ['#818CF8', '#A78BFA'],
  secondary: ['#F43F5E', '#EC4899'],
  accent: ['#06B6D4', '#3B82F6'],
  warm: ['#F59E0B', '#F43F5E'],
  cool: ['#10B981', '#06B6D4'],
  purple: ['#8B5CF6', '#A855F7'],
  dark: ['#1E293B', '#0F172A'],
  glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
  gold: ['#FFD700', '#FFA500', '#FFD700'], // Gold shimmer gradient
  goldShimmer: ['#B8860B', '#FFD700', '#FFE55C', '#FFD700', '#B8860B'],
};

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  layout: LAYOUT,
  shadows: SHADOWS,
  animations: ANIMATIONS,
  gradients: GRADIENTS,
};

export default THEME;
