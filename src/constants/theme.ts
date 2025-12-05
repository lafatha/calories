// Modern Apple-inspired theme for Calories AI App
export const COLORS = {
  primary: {
    main: '#007AFF', // iOS Blue
    light: '#5AC8FA',
    dark: '#0051A8',
    gradient: ['#007AFF', '#5856D6'],
  },
  accent: {
    green: '#34C759', // Success green
    orange: '#FF9500', // Warning orange  
    red: '#FF3B30', // Error/Alert red
    purple: '#AF52DE', // Purple accent
    pink: '#FF2D55', // Pink accent
    teal: '#5AC8FA', // Teal accent
  },
  neutral: {
    white: '#FFFFFF',
    offWhite: '#FAFAFA',
    lightGray: '#F2F2F7', // iOS system background
    mediumGray: '#E5E5EA',
    gray: '#C7C7CC',
    darkGray: '#8E8E93',
    charcoal: '#3A3A3C',
    black: '#1C1C1E',
  },
  semantic: {
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#007AFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
  },
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    inverse: '#FFFFFF',
  },
  meal: {
    breakfast: '#FF9500', // Orange for morning
    lunch: '#34C759', // Green for midday
    dinner: '#AF52DE', // Purple for evening
    snack: '#5AC8FA', // Teal for snacks
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
    xl: 22,
    '2xl': 28,
    '3xl': 34,
    '4xl': 40,
    hero: 48,
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
    full: 9999,
  },
  safeArea: {
    top: 44,
    bottom: 34,
  },
  maxWidth: 428, // iPhone 14 Pro Max width
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 12,
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

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  layout: LAYOUT,
  shadows: SHADOWS,
  animations: ANIMATIONS,
};

export default THEME;
