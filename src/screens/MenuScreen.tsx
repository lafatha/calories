import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export const MenuScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Menu</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.white,
  },
  content: {
    padding: THEME.spacing.screenPadding,
  },
  title: {
    fontSize: THEME.typography.fontSizes.h2,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
});

