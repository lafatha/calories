import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Mail, Lock, LogIn, HelpCircle, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { THEME } from '../constants/theme';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signIn } = useAuth();
  const { colors, isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {/* Background Decorations */}
      <View style={styles.bgDecor1} />
      <View style={styles.bgDecor2} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <ArrowLeft size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <View style={styles.welcomeIconContainer}>
              <LogIn size={28} color={colors.primary.main} />
            </View>
            <Text style={styles.title}>Welcome back!</Text>
            <Text style={styles.subtitle}>
              Sign in to continue tracking your nutrition journey
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={errors.email}
                leftIcon={<Mail size={20} color={colors.text.secondary} />}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                error={errors.password}
                leftIcon={<Lock size={20} color={colors.text.secondary} />}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <HelpCircle size={14} color={colors.primary.main} />
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              size="lg"
              fullRounded
              icon={<ArrowLeft size={18} color={colors.text.inverse} style={{ transform: [{ rotate: '180deg' }] }} />}
              iconPosition="right"
              style={styles.signInButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.signupPrompt}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  bgDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.primary.light + '12',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: 100,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent.orange + '08',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: THEME.spacing.screenPadding,
  },
  header: {
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.lg,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.xl,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: THEME.spacing['2xl'],
  },
  welcomeIconContainer: {
    width: 72,
    height: 72,
    borderRadius: THEME.layout.borderRadius['2xl'],
    backgroundColor: colors.primary.light + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : THEME.shadows.sm),
  },
  forgotPassword: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: 6,
    marginTop: THEME.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  actionsSection: {
    paddingVertical: THEME.spacing['2xl'],
  },
  signInButton: {
    width: '100%',
    marginBottom: THEME.spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.light,
  },
  dividerText: {
    paddingHorizontal: THEME.spacing.lg,
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
  },
  signupLink: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.bold,
  },
});
