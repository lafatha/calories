import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Home, BarChart2, User, Camera } from 'lucide-react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { THEME } from '../constants/theme';
import { RootStackParamList, MainTabParamList } from '../types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CustomTabBarIcon = ({ 
  icon: Icon, 
  focused,
}: { 
  icon: any; 
  focused: boolean;
}) => {
  return (
    <Icon 
      color={focused ? THEME.colors.neutral.black : THEME.colors.neutral.gray} 
      size={focused ? 26 : 24} 
      strokeWidth={focused ? 2.5 : 2}
    />
  );
};

const CameraButton = () => {
  const navigation = useNavigation<NavigationProp>();
  
  return (
    <TouchableOpacity 
      style={styles.cameraButton}
      onPress={() => navigation.navigate('Camera')}
      activeOpacity={0.8}
    >
      <View style={styles.cameraButtonInner}>
        <Camera size={24} color={THEME.colors.neutral.white} strokeWidth={2.5} />
      </View>
    </TouchableOpacity>
  );
};

// Placeholder component for the camera tab (never shown)
const PlaceholderScreen = () => null;

export const BottomTabNavigator = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: THEME.colors.neutral.black,
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
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'web' ? 70 : 90,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'web' ? 12 : 30,
    paddingHorizontal: 20,
    backgroundColor: THEME.colors.neutral.white,
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  cameraButton: {
    position: 'absolute',
    top: -28,
    alignSelf: 'center',
  },
  cameraButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: THEME.colors.neutral.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.lg,
  },
});
