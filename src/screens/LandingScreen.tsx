import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, TrendingUp, Brain, Heart, Sparkles, Salad, Apple, Carrot, Leaf } from 'lucide-react-native';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { THEME } from '../constants/theme';
import { RootStackParamList } from '../types';

const { height, width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, isDark } = useTheme();

  const features = [
    {
      icon: <Camera size={22} color={colors.accent.orange} />,
      title: 'Snap & Track',
      bgColor: colors.accent.orange + '15',
    },
    {
      icon: <Brain size={22} color={colors.accent.purple} />,
      title: 'AI Powered',
      bgColor: colors.accent.purple + '15',
    },
    {
      icon: <TrendingUp size={22} color={colors.accent.green} />,
      title: 'Track Goals',
      bgColor: colors.accent.green + '15',
    },
    {
      icon: <Heart size={22} color={colors.secondary.main} />,
      title: 'Stay Healthy',
      bgColor: colors.secondary.main + '15',
    },
  ];

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background.primary} />

      {/* Background Decorations */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Hero Section */}
      <View style={styles.heroSection}>
        {/* Main Illustration - Food Icons */}
        <View style={styles.illustrationContainer}>
          <View style={styles.mainIconCircle}>
            <Salad size={44} color={colors.primary.main} />
          </View>
          <View style={[styles.floatingIcon, styles.floatingIcon1]}>
            <Apple size={20} color={colors.accent.green} />
          </View>
          <View style={[styles.floatingIcon, styles.floatingIcon2]}>
            <Carrot size={18} color={colors.accent.orange} />
          </View>
          <View style={[styles.floatingIcon, styles.floatingIcon3]}>
            <Leaf size={16} color={colors.accent.green} />
          </View>
        </View>

        <Text style={styles.title}>Calories AI</Text>
        <View style={styles.taglineContainer}>
          <Sparkles size={18} color={colors.primary.main} />
          <Text style={styles.tagline}>Your Smart Nutrition Companion</Text>
        </View>
        <Text style={styles.subtitle}>
          Track calories effortlessly with AI-powered{'\n'}food recognition
        </Text>
      </View>

      {/* Features Grid */}
      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <View key={index} style={[styles.featureItem, { backgroundColor: feature.bgColor }]}>
            <View style={styles.featureIconContainer}>
              {feature.icon}
            </View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
          </View>
        ))}
      </View>

      {/* Social Proof */}
      <View style={styles.socialProof}>
        <View style={styles.avatarStack}>
          <View style={[styles.avatar, styles.avatar1]}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={[styles.avatar, styles.avatar2]}>
            <Text style={styles.avatarText}>B</Text>
          </View>
          <View style={[styles.avatar, styles.avatar3]}>
            <Text style={styles.avatarText}>C</Text>
          </View>
        </View>
        <Text style={styles.socialText}>
          <Text style={styles.socialHighlight}>10,000+</Text> people tracking their health
        </Text>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Button
          title="Get Started Free"
          onPress={() => navigation.navigate('Signup')}
          size="lg"
          fullRounded
          icon={<TrendingUp size={18} color={colors.text.inverse} />}
          iconPosition="right"
          style={styles.primaryButton}
        />

        <Button
          title="I already have an account"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          size="md"
        />

        <Text style={styles.termsText}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingHorizontal: THEME.spacing.screenPadding,
  },
  bgCircle1: {
    position: 'absolute',
    top: -100,
    right: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: colors.primary.light + '10',
  },
  bgCircle2: {
    position: 'absolute',
    top: height * 0.3,
    left: -100,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent.orange + '08',
  },
  bgCircle3: {
    position: 'absolute',
    bottom: 100,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.accent.green + '08',
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: height * 0.03,
    paddingBottom: THEME.spacing.xl,
  },
  illustrationContainer: {
    width: 140,
    height: 140,
    marginBottom: THEME.spacing.xl,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...(isDark ? {} : THEME.shadows.md),
  },
  floatingIcon: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : THEME.shadows.sm),
  },
  floatingIcon1: {
    top: 5,
    right: 10,
  },
  floatingIcon2: {
    top: 25,
    left: 0,
  },
  floatingIcon3: {
    bottom: 5,
    right: 5,
  },
  title: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: THEME.spacing.sm,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  taglineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    marginBottom: THEME.spacing.sm,
  },
  tagline: {
    fontSize: THEME.typography.fontSizes.md,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
  },
  featureItem: {
    width: (width - 40 - THEME.spacing.md) / 2,
    paddingVertical: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.xl,
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : THEME.shadows.xs),
  },
  featureTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  socialProof: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing.xl,
    paddingVertical: THEME.spacing.md,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  avatar1: {
    zIndex: 3,
    backgroundColor: colors.accent.orange,
  },
  avatar2: {
    marginLeft: -12,
    zIndex: 2,
    backgroundColor: colors.accent.blue,
  },
  avatar3: {
    marginLeft: -12,
    zIndex: 1,
    backgroundColor: colors.accent.green,
  },
  avatarText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.inverse,
  },
  socialText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  socialHighlight: {
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  ctaSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: THEME.spacing['2xl'],
    gap: THEME.spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  termsText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: THEME.spacing.xs,
  },
});
