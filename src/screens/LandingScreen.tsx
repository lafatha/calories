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
import { Flame, Camera, TrendingUp, Zap } from 'lucide-react-native';
import { Button } from '../components/Button';
import { THEME } from '../constants/theme';
import { RootStackParamList } from '../types';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export const LandingScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const features = [
    {
      icon: <Camera size={24} color={THEME.colors.primary.main} />,
      title: 'AI Food Scanner',
      description: 'Snap a photo, get instant calorie estimates',
    },
    {
      icon: <TrendingUp size={24} color={THEME.colors.accent.green} />,
      title: 'Track Progress',
      description: 'Monitor your daily intake and goals',
    },
    {
      icon: <Zap size={24} color={THEME.colors.accent.orange} />,
      title: 'Smart Insights',
      description: 'Personalized recommendations powered by AI',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={THEME.colors.neutral.white} />
      
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Flame size={32} color={THEME.colors.neutral.white} fill={THEME.colors.neutral.white} />
          </View>
        </View>
        
        <Text style={styles.title}>Calories AI</Text>
        <Text style={styles.subtitle}>
          Track your nutrition effortlessly{'\n'}with AI-powered food recognition
        </Text>
      </View>

      {/* Features Section */}
      <View style={styles.featuresSection}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              {feature.icon}
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Button
          title="Get Started"
          onPress={() => navigation.navigate('Signup')}
          size="lg"
          style={styles.primaryButton}
        />
        
        <Button
          title="I already have an account"
          onPress={() => navigation.navigate('Login')}
          variant="ghost"
          size="md"
        />
        
        <Text style={styles.termsText}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.white,
    paddingHorizontal: THEME.spacing.screenPadding,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: THEME.spacing['3xl'],
  },
  logoContainer: {
    marginBottom: THEME.spacing.xl,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: THEME.colors.neutral.black,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.lg,
  },
  title: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.md,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    flex: 1,
    gap: THEME.spacing.lg,
    paddingVertical: THEME.spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.lg,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.lg,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.md,
    backgroundColor: THEME.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.sm,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    lineHeight: 18,
  },
  ctaSection: {
    paddingBottom: THEME.spacing['2xl'],
    gap: THEME.spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  termsText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.gray,
    textAlign: 'center',
    marginTop: THEME.spacing.sm,
  },
});

