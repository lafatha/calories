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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Mail, Lock, User, Globe, Check } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { THEME } from '../constants/theme';
import { TIMEZONES, DEFAULT_TIMEZONE } from '../constants/timezones';
import { RootStackParamList, TimezoneOption } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Signup'>;

export const SignupScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { signUp } = useAuth();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [timezone, setTimezone] = useState(DEFAULT_TIMEZONE);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!username) {
      newErrors.username = 'Username is required';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!fullName) {
      newErrors.fullName = 'Full name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSignup = async () => {
    if (!validateStep2()) return;

    setLoading(true);
    const { error, needsEmailConfirmation } = await signUp(email, password, {
      username,
      fullName,
      timezone,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else if (needsEmailConfirmation) {
      Alert.alert(
        'Check Your Email',
        'We sent you a verification link. Please check your email to complete signup.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert(
        'Account Created',
        'Your account has been created successfully!',
        [{ text: 'OK' }]
      );
    }
  };

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === timezone);

  const renderTimezoneItem = ({ item }: { item: TimezoneOption }) => (
    <TouchableOpacity
      style={[
        styles.timezoneItem,
        item.value === timezone && styles.timezoneItemSelected,
      ]}
      onPress={() => {
        setTimezone(item.value);
        setShowTimezonePicker(false);
      }}
    >
      <Text style={[
        styles.timezoneItemText,
        item.value === timezone && styles.timezoneItemTextSelected,
      ]}>
        {item.label} ({item.offset})
      </Text>
      {item.value === timezone && (
        <Check size={20} color={THEME.colors.primary.main} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
              onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={THEME.colors.neutral.black} />
            </TouchableOpacity>
            
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              {step === 1 ? 'Create account' : 'Complete your profile'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Start your journey to healthier eating'
                : 'Just a few more details to personalize your experience'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            {step === 1 ? (
              <>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  error={errors.email}
                  leftIcon={<Mail size={20} color={THEME.colors.neutral.darkGray} />}
                />

                <Input
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password}
                  hint="Must be at least 6 characters"
                  leftIcon={<Lock size={20} color={THEME.colors.neutral.darkGray} />}
                />

                <Input
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.confirmPassword}
                  leftIcon={<Lock size={20} color={THEME.colors.neutral.darkGray} />}
                />
              </>
            ) : (
              <>
                <Input
                  label="Username"
                  placeholder="Choose a username"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  error={errors.username}
                  leftIcon={<User size={20} color={THEME.colors.neutral.darkGray} />}
                />

                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  error={errors.fullName}
                  leftIcon={<User size={20} color={THEME.colors.neutral.darkGray} />}
                />

                {/* Timezone Selector */}
                <View style={styles.timezoneContainer}>
                  <Text style={styles.timezoneLabel}>Timezone</Text>
                  <TouchableOpacity
                    style={styles.timezoneSelector}
                    onPress={() => setShowTimezonePicker(true)}
                  >
                    <Globe size={20} color={THEME.colors.neutral.darkGray} />
                    <Text style={styles.timezoneText}>
                      {selectedTimezone?.label} ({selectedTimezone?.offset})
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            <Button
              title={step === 1 ? 'Continue' : 'Create Account'}
              onPress={step === 1 ? handleNextStep : handleSignup}
              loading={loading}
              size="lg"
              style={styles.actionButton}
            />

            {step === 1 && (
              <View style={styles.loginPrompt}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Timezone Picker Modal */}
      <Modal
        visible={showTimezonePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimezonePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Timezone</Text>
              <TouchableOpacity onPress={() => setShowTimezonePicker(false)}>
                <Text style={styles.modalClose}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={TIMEZONES}
              renderItem={renderTimezoneItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.white,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: THEME.spacing.screenPadding,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: THEME.layout.borderRadius.md,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.neutral.mediumGray,
  },
  stepDotActive: {
    backgroundColor: THEME.colors.neutral.black,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: THEME.colors.neutral.mediumGray,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: THEME.colors.neutral.black,
  },
  titleSection: {
    marginBottom: THEME.spacing['3xl'],
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.sm,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.neutral.darkGray,
    lineHeight: 24,
  },
  formSection: {
    flex: 1,
  },
  timezoneContainer: {
    marginBottom: THEME.spacing.lg,
  },
  timezoneLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.medium,
    color: THEME.colors.neutral.charcoal,
    marginBottom: 8,
  },
  timezoneSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  timezoneText: {
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.neutral.black,
    flex: 1,
  },
  actionsSection: {
    paddingVertical: THEME.spacing['2xl'],
  },
  actionButton: {
    width: '100%',
    marginBottom: THEME.spacing.xl,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
  },
  loginLink: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.black,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.neutral.white,
    borderTopLeftRadius: THEME.layout.borderRadius['2xl'],
    borderTopRightRadius: THEME.layout.borderRadius['2xl'],
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
  },
  modalClose: {
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  timezoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.lightGray,
  },
  timezoneItemSelected: {
    backgroundColor: THEME.colors.neutral.lightGray,
  },
  timezoneItemText: {
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.neutral.black,
  },
  timezoneItemTextSelected: {
    fontWeight: THEME.typography.fontWeights.medium,
  },
});
