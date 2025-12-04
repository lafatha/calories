export const COLORS = {
  primary: {
    lime: "#000000", // Replaced with black for minimalist
    lightLime: "#F5F5F5", // Replaced with light gray
    paleGreen: "#FAFAFA", // Replaced with very light gray
  },
  secondary: {
    mint: "#E0E0E0",
    coral: "#000000", // Use black for accents
    skyBlue: "#000000", // Use black for accents
  },
  neutral: {
    white: "#FFFFFF",
    lightGray: "#F9F9F9",
    mediumGray: "#EEEEEE",
    darkGray: "#8E8E93",
    black: "#000000",
  },
  semantic: {
    success: "#34C759", // Keep for functional success states if needed
    warning: "#FFD60A",
    error: "#FF3B30",
    info: "#007AFF",
  },
};

export const TYPOGRAPHY = {
  fontFamily: {
    primary: "System",
  },
  fontSizes: {
    hero: 48,
    h1: 34,
    h2: 28,
    h3: 22,
    body: 17,
    caption: 13,
    small: 11,
  },
  fontWeights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  } as const,
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 20,
  cardPadding: 16,
};

export const LAYOUT = {
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    pill: 32,
    circle: 9999,
  },
  safeArea: {
    top: 44,
    bottom: 34,
  },
};

export const SHADOWS = {
  subtle: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
};

export const THEME = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  layout: LAYOUT,
  shadows: SHADOWS,
};
