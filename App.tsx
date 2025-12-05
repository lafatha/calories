import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LandingScreen } from './src/screens/LandingScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SignupScreen } from './src/screens/SignupScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { BottomTabNavigator } from './src/navigation/BottomTabNavigator';
import { ActivityIndicator, Text } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { THEME } from './src/constants/theme';

type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  Camera: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconContainer}>
          <Sparkles size={32} color={THEME.colors.neutral.white} />
        </View>
        <ActivityIndicator size="small" color={THEME.colors.primary.main} style={styles.loadingSpinner} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={BottomTabNavigator} />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen name="Landing" component={LandingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="dark" />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.white,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.neutral.white,
  },
  loadingIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...THEME.shadows.glow,
  },
  loadingSpinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: THEME.colors.neutral.darkGray,
    fontWeight: '500',
  },
});
