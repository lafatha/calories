import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry !== undefined;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : undefined,
            (rightIcon || showPasswordToggle) ? styles.inputWithRightIcon : undefined,
          ]}
          placeholderTextColor={THEME.colors.neutral.gray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />

        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.iconRight}
          >
            {isPasswordVisible ? (
              <EyeOff size={20} color={THEME.colors.neutral.darkGray} />
            ) : (
              <Eye size={20} color={THEME.colors.neutral.darkGray} />
            )}
          </TouchableOpacity>
        )}

        {rightIcon && !showPasswordToggle && (
          <View style={styles.iconRight}>{rightIcon}</View>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
      {hint && !error && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.charcoal,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: THEME.colors.primary.main,
    backgroundColor: THEME.colors.neutral.white,
    shadowColor: THEME.colors.primary.main,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  inputError: {
    borderColor: THEME.colors.semantic.error,
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.neutral.black,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  iconLeft: {
    paddingLeft: 18,
  },
  iconRight: {
    paddingRight: 18,
  },
  error: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.semantic.error,
    marginTop: 8,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  hint: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    marginTop: 8,
  },
});
