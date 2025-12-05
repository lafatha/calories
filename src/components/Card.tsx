import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlighted' | 'hero' | 'glass' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card = ({
  children,
  style,
  variant = 'default',
  padding = 'md',
}: CardProps) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'hero':
        return styles.hero;
      case 'highlighted':
        return styles.highlighted;
      case 'glass':
        return styles.glass;
      case 'gradient':
        return styles.gradient;
      default:
        return styles.default;
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: THEME.spacing.md };
      case 'lg':
        return { padding: THEME.spacing.xl };
      case 'xl':
        return { padding: THEME.spacing['2xl'] };
      default:
        return { padding: THEME.spacing.cardPadding };
    }
  };

  return (
    <View style={[styles.base, getVariantStyle(), getPaddingStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: THEME.layout.borderRadius.xl,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.xl,
    ...THEME.shadows.sm,
  },
  highlighted: {
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
  },
  hero: {
    backgroundColor: THEME.colors.primary.light + '15',
    borderRadius: THEME.layout.borderRadius['2xl'],
    borderWidth: 1,
    borderColor: THEME.colors.primary.light + '30',
  },
  glass: {
    backgroundColor: THEME.colors.glass.background,
    borderRadius: THEME.layout.borderRadius['2xl'],
    borderWidth: 1,
    borderColor: THEME.colors.glass.border,
    ...THEME.shadows.md,
  },
  gradient: {
    backgroundColor: THEME.colors.primary.main,
    borderRadius: THEME.layout.borderRadius['2xl'],
    ...THEME.shadows.glow,
  },
});
