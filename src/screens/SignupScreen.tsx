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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Mail, Lock, User, Globe, Check, Rocket, Sparkles, Shield } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { THEME } from '../constants/theme';
import { TIMEZONES, DEFAULT_TIMEZONE } from '../constants/timezones';
import { RootStackParamList, TimezoneOption } from '../types';

const { width, height } = Dimensions.get('window');

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
        'Welcome!',
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
        <View style={styles.checkBadge}>
          <Check size={16} color={THEME.colors.neutral.white} />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
              onPress={() => (step === 2 ? setStep(1) : navigation.goBack())}
              style={styles.backButton}
            >
              <ArrowLeft size={22} color={THEME.colors.neutral.charcoal} />
            </TouchableOpacity>

            {/* Step Indicator */}
            <View style={styles.stepContainer}>
              <View style={styles.stepIndicator}>
                <View style={[styles.stepDot, styles.stepDotActive]}>
                  <Text style={styles.stepDotText}>1</Text>
                </View>
                <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
                <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                  <Text style={[styles.stepDotText, step < 2 && styles.stepDotTextInactive]}>2</Text>
                </View>
              </View>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.titleIconContainer}>
              {step === 1 ? (
                <Rocket size={28} color={THEME.colors.primary.main} />
              ) : (
                <Sparkles size={28} color={THEME.colors.primary.main} />
              )}
            </View>
            <Text style={styles.title}>
              {step === 1 ? 'Create Account' : 'Almost Done!'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Start your journey to healthier eating'
                : 'Tell us a bit more about yourself'}
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <View style={styles.formCard}>
              {step === 1 ? (
                <>
                  <Input
                    label="Email"
                    placeholder="your@email.com"
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
                    placeholder="Create a strong password"
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
                    placeholder="Type it again"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    error={errors.confirmPassword}
                    leftIcon={<Shield size={20} color={THEME.colors.neutral.darkGray} />}
                  />
                </>
              ) : (
                <>
                  <Input
                    label="Username"
                    placeholder="cooluser123"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    error={errors.username}
                    leftIcon={<User size={20} color={THEME.colors.neutral.darkGray} />}
                  />

                  <Input
                    label="Full Name"
                    placeholder="What should we call you?"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    error={errors.fullName}
                    leftIcon={<User size={20} color={THEME.colors.neutral.darkGray} />}
                  />

                  {/* Timezone Selector */}
                  <View style={styles.timezoneContainer}>
                    <Text style={styles.inputLabel}>Timezone</Text>
                    <TouchableOpacity
                      style={styles.timezoneSelector}
                      onPress={() => setShowTimezonePicker(true)}
                    >
                      <Globe size={20} color={THEME.colors.neutral.darkGray} />
                      <Text style={styles.timezoneText} numberOfLines={1}>
                        {selectedTimezone?.label}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Actions Section */}
          <View style={styles.actionsSection}>
            <Button
              title={step === 1 ? 'Continue' : 'Create Account'}
              onPress={step === 1 ? handleNextStep : handleSignup}
              loading={loading}
              size="lg"
              fullRounded
              icon={step === 1
                ? <ArrowLeft size={18} color={THEME.colors.neutral.white} style={{ transform: [{ rotate: '180deg' }] }} />
                : <Check size={18} color={THEME.colors.neutral.white} />
              }
              iconPosition="right"
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
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Globe size={24} color={THEME.colors.primary.main} />
              <Text style={styles.modalTitle}>Select Timezone</Text>
              <TouchableOpacity
                onPress={() => setShowTimezonePicker(false)}
                style={styles.modalDoneButton}
              >
                <Text style={styles.modalDoneText}>Done</Text>
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
  bgDecor1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: THEME.colors.accent.green + '10',
  },
  bgDecor2: {
    position: 'absolute',
    bottom: 150,
    left: -80,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: THEME.colors.primary.light + '08',
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
    paddingBottom: THEME.spacing.lg,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.xl,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: THEME.colors.neutral.mediumGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: THEME.colors.primary.main,
  },
  stepDotText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.white,
  },
  stepDotTextInactive: {
    color: THEME.colors.neutral.darkGray,
  },
  stepLine: {
    width: 40,
    height: 3,
    backgroundColor: THEME.colors.neutral.mediumGray,
    marginHorizontal: 8,
    borderRadius: 2,
  },
  stepLineActive: {
    backgroundColor: THEME.colors.primary.main,
  },
  headerSpacer: {
    width: 48,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  titleIconContainer: {
    width: 72,
    height: 72,
    borderRadius: THEME.layout.borderRadius['2xl'],
    backgroundColor: THEME.colors.primary.light + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.sm,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
    textAlign: 'center',
  },
  formSection: {
    flex: 1,
  },
  formCard: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    ...THEME.shadows.sm,
  },
  timezoneContainer: {
    marginBottom: THEME.spacing.lg,
  },
  inputLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.charcoal,
    marginBottom: 10,
  },
  timezoneSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    paddingVertical: 16,
    paddingHorizontal: 18,
    gap: 14,
  },
  timezoneText: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.neutral.black,
    fontWeight: THEME.typography.fontWeights.medium,
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
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: THEME.colors.neutral.white,
    borderTopLeftRadius: THEME.layout.borderRadius['3xl'],
    borderTopRightRadius: THEME.layout.borderRadius['3xl'],
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: THEME.colors.neutral.mediumGray,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.lightGray,
    gap: THEME.spacing.sm,
  },
  modalTitle: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  modalDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: THEME.colors.primary.light + '20',
    borderRadius: THEME.layout.borderRadius.full,
  },
  modalDoneText: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  timezoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.lightGray,
  },
  timezoneItemSelected: {
    backgroundColor: THEME.colors.primary.light + '10',
  },
  timezoneItemText: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.black,
    flex: 1,
  },
  timezoneItemTextSelected: {
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.primary.main,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
