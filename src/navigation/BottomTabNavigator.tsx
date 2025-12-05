import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, View } from 'react-native';
import { Home, BarChart2, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
import { THEME } from '../constants/theme';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator = () => {
  const { colors, isDark } = useTheme();

  const CustomTabBarIcon = ({
    icon: Icon,
    focused,
  }: {
    icon: any;
    focused: boolean;
  }) => {
    return (
      <View style={styles.iconContainer}>
        <Icon
          color={focused ? colors.primary.main : colors.text.tertiary}
          size={focused ? 24 : 22}
          strokeWidth={focused ? 2.5 : 2}
        />
      </View>
    );
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            backgroundColor: colors.background.card,
            shadowColor: isDark ? 'transparent' : colors.shadow,
            borderTopColor: isDark ? colors.border.light : 'transparent',
            borderTopWidth: isDark ? 1 : 0,
          }
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon icon={Home} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon icon={BarChart2} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <CustomTabBarIcon icon={User} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 24,
    borderRadius: 0,
    elevation: 0,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.lg,
  },
});
