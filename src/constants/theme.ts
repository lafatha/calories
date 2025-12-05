// Modern Blue-Purple Premium Theme for Calories AI App
export const COLORS = {
  primary: {
    main: '#4F46E5',      // Electric Indigo
    light: '#818CF8',     // Light Indigo
    dark: '#3730A3',      // Dark Indigo
    gradient: ['#4F46E5', '#7C3AED'], // Indigo to Purple
  },
  secondary: {
    main: '#F43F5E',      // Rose
    light: '#FB7185',     // Light Rose
    dark: '#E11D48',      // Dark Rose
  },
  accent: {
    green: '#10B981',     // Emerald green
    orange: '#F59E0B',    // Amber  
    red: '#EF4444',       // Red
    purple: '#A855F7',    // Violet
    pink: '#EC4899',      // Pink
    teal: '#14B8A6',      // Teal
    blue: '#3B82F6',      // Blue
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
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    gradient: ['#F8FAFC', '#EEF2FF'], // Subtle indigo tint
  },
  text: {
    primary: '#0F172A',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  meal: {
    breakfast: '#F59E0B',   // Warm amber for morning
    lunch: '#10B981',       // Fresh green for midday
    dinner: '#8B5CF6',      // Purple for evening
    snack: '#06B6D4',       // Cyan for snacks
  },
  glass: {
    background: 'rgba(255, 255, 255, 0.85)',
    border: 'rgba(255, 255, 255, 0.3)',
    shadow: 'rgba(79, 70, 229, 0.1)',
  },
};

export const TYPOGRAPHY = {
  fontFamily: {
    primary: 'System',
    mono: 'Menlo',
  },
  fontSizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    '2xl': 28,
    '3xl': 34,
    '4xl': 42,
    hero: 52,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeights: {
    tight: 1.1,
    snug: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
  screenPadding: 20,
  cardPadding: 16,
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
