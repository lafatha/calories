import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { THEME } from '../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'highlighted';
}

export const Card = ({ children, style, variant = 'default' }: CardProps) => {
  const variantStyle = variant === 'highlighted' ? styles.highlighted : styles.default;
  return (
    <View style={[styles.base, variantStyle, style]}>
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
    padding: THEME.spacing.cardPadding,
    ...THEME.shadows.sm,
  },
  highlighted: {
    backgroundColor: THEME.colors.neutral.lightGray,
    padding: THEME.spacing.screenPadding,
  },
});
