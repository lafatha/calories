import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, Platform, View } from 'react-native';
import { Home, BarChart2, User } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { THEME } from '../constants/theme';
import { MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBarIcon = ({
  icon: Icon,
  focused,
}: {
  icon: any;
  focused: boolean;
}) => {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Icon
        color={focused ? THEME.colors.primary.main : THEME.colors.neutral.gray}
        size={focused ? 24 : 22}
        strokeWidth={focused ? 2.5 : 2}
      />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: THEME.colors.primary.main,
        tabBarInactiveTintColor: THEME.colors.neutral.gray,
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
    bottom: Platform.OS === 'web' ? 16 : 24,
    left: 20,
    right: 20,
    height: 70,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 24,
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius['2xl'],
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: THEME.colors.neutral.black,
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
  iconContainerActive: {
    backgroundColor: THEME.colors.primary.light + '15',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.primary.main,
  },
});
