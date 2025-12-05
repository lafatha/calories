import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/theme';

interface GoldShimmerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isActive?: boolean;
  borderRadius?: number;
  borderWidth?: number;
}

/**
 * GoldShimmer - A component that wraps children with a shimmering gold border effect
 * Works on both mobile (React Native) and web platforms
 */
export const GoldShimmer: React.FC<GoldShimmerProps> = ({
  children,
  style,
  isActive = true,
  borderRadius = 50,
  borderWidth = 3,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      shimmerAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [isActive, shimmerAnim]);

  // Interpolate between gold colors for shimmer effect
  const borderColor = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.gold.dark, COLORS.gold.light, COLORS.gold.dark],
  });

  const shadowOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.3, 0.6, 0.3],
  });

  if (!isActive) {
    return (
      <View style={[styles.container, style]}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          borderRadius,
          borderWidth,
          borderColor,
          // Shadow for glow effect - works on iOS
          shadowColor: COLORS.gold.main,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: Platform.OS === 'ios' ? shadowOpacity : 0.4,
          shadowRadius: 8,
          // Elevation for Android
          elevation: Platform.OS === 'android' ? 6 : 0,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface GoldShimmerBoxProps {
  children: React.ReactNode;
  style?: ViewStyle;
  isActive?: boolean;
  borderRadius?: number;
}

/**
 * GoldShimmerBox - A box/card with shimmering gold background
 */
export const GoldShimmerBox: React.FC<GoldShimmerBoxProps> = ({
  children,
  style,
  isActive = true,
  borderRadius = 12,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isActive) {
      shimmerAnim.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [isActive, shimmerAnim]);

  // Interpolate background opacity for subtle shimmer
  const backgroundColor = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      `${COLORS.gold.main}15`,
      `${COLORS.gold.light}25`,
      `${COLORS.gold.main}15`,
    ],
  });

  const borderColor = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [COLORS.gold.dark, COLORS.gold.main, COLORS.gold.dark],
  });

  if (!isActive) {
    return (
      <View style={[styles.box, { borderRadius }, style]}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.box,
        style,
        {
          borderRadius,
          backgroundColor,
          borderWidth: 1.5,
          borderColor,
          // Glow effect
          shadowColor: COLORS.gold.main,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: Platform.OS === 'ios' ? 0.3 : 0,
          shadowRadius: 6,
          elevation: Platform.OS === 'android' ? 4 : 0,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  box: {
    overflow: 'hidden',
  },
});

export default GoldShimmer;
