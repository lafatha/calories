import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
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
  const { colors, isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background.primary }]}>
        <View style={[styles.loadingIconContainer, { backgroundColor: colors.primary.main }]}>
          <Sparkles size={32} color={colors.text.inverse} />
        </View>
        <ActivityIndicator size="small" color={colors.primary.main} style={styles.loadingSpinner} />
        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>Loading...</Text>
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

function AppContent() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingSpinner: {
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
