import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { THEME } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          container: {
            backgroundColor: isDisabled 
              ? THEME.colors.neutral.gray 
              : THEME.colors.neutral.black,
          },
          text: {
            color: THEME.colors.neutral.white,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: THEME.colors.neutral.lightGray,
          },
          text: {
            color: THEME.colors.neutral.black,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: isDisabled 
              ? THEME.colors.neutral.gray 
              : THEME.colors.neutral.black,
          },
          text: {
            color: isDisabled 
              ? THEME.colors.neutral.gray 
              : THEME.colors.neutral.black,
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: isDisabled 
              ? THEME.colors.neutral.gray 
              : THEME.colors.primary.main,
          },
        };
      default:
        return {
          container: {},
          text: {},
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: THEME.layout.borderRadius.md,
          },
          text: {
            fontSize: THEME.typography.fontSizes.sm,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: 18,
            paddingHorizontal: 32,
            borderRadius: THEME.layout.borderRadius.lg,
          },
          text: {
            fontSize: THEME.typography.fontSizes.lg,
          },
        };
      default:
        return {
          container: {
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: THEME.layout.borderRadius.md,
          },
          text: {
            fontSize: THEME.typography.fontSizes.md,
          },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? THEME.colors.neutral.white : THEME.colors.neutral.black} 
          size="small" 
        />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    fontWeight: THEME.typography.fontWeights.semibold,
    textAlign: 'center',
  },
});

