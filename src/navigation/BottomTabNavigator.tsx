import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, BarChart2, PlusSquare } from 'lucide-react-native';
import { THEME } from '../constants/theme';

const Tab = createBottomTabNavigator();

const CustomTabBarIcon = ({ 
  icon: Icon, 
  focused, 
  size 
}: { 
  icon: any, 
  focused: boolean, 
  color: string, 
  size: number 
}) => {
  // Bold and Dark: Fill the icon when active, use thicker stroke
  return (
    <Icon 
      color={THEME.colors.neutral.black} 
      size={focused ? 28 : 24} 
      strokeWidth={focused ? 3 : 2}
      fill={focused ? THEME.colors.neutral.black : "transparent"} 
    />
  );
};

// Placeholder for Scan Screen
const ScanScreen = () => <View style={{flex:1, backgroundColor: 'white'}} />;

export const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: THEME.colors.neutral.black,
        tabBarInactiveTintColor: THEME.colors.neutral.darkGray,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <CustomTabBarIcon icon={Home} focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={ScanScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            // Camera button: Bold and Dark
            <PlusSquare 
              color={THEME.colors.neutral.black} 
              size={32} 
              strokeWidth={focused ? 2.5 : 2}
              fill={focused ? THEME.colors.neutral.black : "transparent"} 
              // If filled, icon color needs to be inverted for the 'plus' to be visible? 
              // Actually PlusSquare filled becomes a solid square. 
              // Let's just make it bold stroke for minimal look, or fill it if focused.
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={ProgressScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <CustomTabBarIcon icon={BarChart2} focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === 'web' ? 60 : 85,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'web' ? 10 : 30,
    backgroundColor: THEME.colors.neutral.white,
    borderTopWidth: 0, // Deleted the border
    elevation: 0,
    shadowOpacity: 0,
  },
});
