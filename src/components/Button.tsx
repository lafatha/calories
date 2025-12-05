import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { THEME } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullRounded?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  fullRounded = false,
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
}) => {
  const isDisabled = disabled || loading;

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
      case 'gradient':
        return {
          container: {
            backgroundColor: isDisabled
              ? THEME.colors.neutral.gray
              : THEME.colors.primary.main,
            ...(!isDisabled && THEME.shadows.glowSoft),
          },
          text: {
            color: THEME.colors.neutral.white,
          },
        };
      case 'secondary':
        return {
          container: {
            backgroundColor: THEME.colors.primary.light + '20',
          },
          text: {
            color: THEME.colors.primary.main,
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderColor: isDisabled
              ? THEME.colors.neutral.gray
              : THEME.colors.primary.main,
          },
          text: {
            color: isDisabled
              ? THEME.colors.neutral.gray
              : THEME.colors.primary.main,
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

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle; height: number } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: 10,
            paddingHorizontal: 18,
          },
          text: {
            fontSize: THEME.typography.fontSizes.sm,
          },
          height: 40,
        };
      case 'lg':
        return {
          container: {
            paddingVertical: 18,
            paddingHorizontal: 32,
          },
          text: {
            fontSize: THEME.typography.fontSizes.md,
          },
          height: 56,
        };
      default:
        return {
          container: {
            paddingVertical: 14,
            paddingHorizontal: 24,
          },
          text: {
            fontSize: THEME.typography.fontSizes.base,
          },
          height: 48,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const borderRadius = fullRounded
    ? sizeStyles.height / 2
    : THEME.layout.borderRadius.lg;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.container,
        variantStyles.container,
        sizeStyles.container,
        { borderRadius },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'gradient'
            ? THEME.colors.neutral.white
            : THEME.colors.primary.main
          }
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[styles.text, variantStyles.text, sizeStyles.text, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: THEME.typography.fontWeights.semibold,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 10,
  },
});
