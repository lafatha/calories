import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Flame,
  Plus,
  ChevronRight,
  Sparkles,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Apple,
  Salad,
  UtensilsCrossed,
  Lightbulb,
  Target,
  TrendingUp,
  Sunrise,
  Sunset,
  CloudMoon,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTime } from '../hooks/useTime';
import { useMeals, useWeeklyStats } from '../hooks/useMeals';
import { THEME } from '../constants/theme';
import { RootStackParamList, MealType } from '../types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MEAL_CONFIG: Record<MealType, { icon: any; label: string; timeHint: string }> = {
  breakfast: { icon: Coffee, label: 'Breakfast', timeHint: '6:00 - 10:00' },
  lunch: { icon: Sun, label: 'Lunch', timeHint: '11:00 - 14:00' },
  dinner: { icon: Moon, label: 'Dinner', timeHint: '18:00 - 21:00' },
  snack: { icon: Cookie, label: 'Snack', timeHint: 'Anytime' },
};

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const { greeting, currentMealType } = useTime(profile?.timezone);
  const { meals, stats } = useMeals();
  const { daysOnTrack } = useWeeklyStats();

  const dailyGoal = profile?.daily_calorie_goal || 2000;
  const remainingCalories = Math.max(0, dailyGoal - stats.totalCalories);
  const progressPercentage = Math.min((stats.totalCalories / dailyGoal) * 100, 100);
  const isOverGoal = stats.totalCalories > dailyGoal;

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sunrise size={32} color={THEME.colors.accent.orange} />;
    if (hour < 17) return <Sun size={32} color={THEME.colors.accent.orange} />;
    if (hour < 21) return <Sunset size={32} color={THEME.colors.accent.purple} />;
    return <CloudMoon size={32} color={THEME.colors.primary.main} />;
  };

  const getMealColor = (mealType: MealType): string => {
    return THEME.colors.meal[mealType];
  };

  const getMotivationalMessage = () => {
    if (progressPercentage === 0) return "Let's start your day right!";
    if (progressPercentage < 30) return "Great start! Keep going!";
    if (progressPercentage < 60) return "You're doing amazing!";
    if (progressPercentage < 90) return "Almost there!";
    if (progressPercentage <= 100) return "Perfect balance today!";
    return "A little over, but that's okay!";
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Header */}
        <View style={styles.header}>
          <View style={styles.greetingSection}>
            <View style={styles.greetingIconContainer}>
              {getGreetingIcon()}
            </View>
            <View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.username}>{profile?.full_name || profile?.username || 'Friend'}</Text>
            </View>
          </View>

          {/* Streak Badge */}
          {daysOnTrack > 0 && (
            <View style={styles.streakContainer}>
              <Flame size={18} color={THEME.colors.accent.orange} fill={THEME.colors.accent.orange} />
              <Text style={styles.streakCount}>{daysOnTrack}</Text>
            </View>
          )}
        </View>

        {/* Main Progress Card */}
        <View style={styles.progressCard}>
          {/* Progress Circle */}
          <View style={styles.progressVisual}>
            <View style={styles.progressCircleOuter}>
              <View style={[
                styles.progressCircle,
                isOverGoal && styles.progressCircleOver
              ]}>
                <Text style={styles.progressCalories}>{stats.totalCalories}</Text>
                <Text style={styles.progressUnit}>kcal</Text>
              </View>
            </View>

            {/* Quick Stats below circle */}
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{dailyGoal}</Text>
                <Text style={styles.quickStatLabel}>Goal</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={[
                  styles.quickStatValue,
                  isOverGoal && styles.quickStatValueOver
                ]}>
                  {isOverGoal ? '+' : ''}{Math.abs(remainingCalories)}
                </Text>
                <Text style={styles.quickStatLabel}>{isOverGoal ? 'Over' : 'Left'}</Text>
              </View>
            </View>
          </View>

          {/* Motivational Message */}
          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressBarFill,
                { width: `${Math.min(progressPercentage, 100)}%` },
                isOverGoal && styles.progressBarFillOver
              ]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round(progressPercentage)}% of daily goal</Text>
          </View>
        </View>

        {/* Quick Add Floating Button */}
        <TouchableOpacity
          style={styles.quickAddButton}
          onPress={() => navigation.navigate('Camera')}
          activeOpacity={0.9}
        >
          <View style={styles.quickAddIcon}>
            <Sparkles size={24} color={THEME.colors.neutral.white} />
          </View>
          <View style={styles.quickAddContent}>
            <Text style={styles.quickAddTitle}>Log Your Meal</Text>
            <Text style={styles.quickAddSubtitle}>Snap a photo for instant AI analysis</Text>
          </View>
          <ChevronRight size={24} color={THEME.colors.neutral.white} />
        </TouchableOpacity>

        {/* Today's Meals Section */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <Text style={styles.sectionSubtitle}>Tap to add or view details</Text>
          </View>

          <View style={styles.mealsGrid}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
              const config = MEAL_CONFIG[mealType];
              const Icon = config.icon;
              const mealItems = meals[mealType];
              const mealCalories = mealType === 'breakfast'
                ? stats.breakfastCalories
                : mealType === 'lunch'
                  ? stats.lunchCalories
                  : mealType === 'dinner'
                    ? stats.dinnerCalories
                    : stats.snackCalories;
              const hasLogged = mealCalories > 0;
              const isCurrentMeal = currentMealType === mealType;

              return (
                <TouchableOpacity
                  key={mealType}
                  style={[
                    styles.mealCard,
                    hasLogged && styles.mealCardLogged,
                    isCurrentMeal && !hasLogged && styles.mealCardCurrent,
                  ]}
                  onPress={() => navigation.navigate('Camera')}
                  activeOpacity={0.8}
                >
                  {/* Current meal indicator */}
                  {isCurrentMeal && !hasLogged && (
                    <View style={styles.currentMealBadge}>
                      <Text style={styles.currentMealText}>NOW</Text>
                    </View>
                  )}

                  {/* Meal Icon */}
                  <View style={[
                    styles.mealIconContainer,
                    { backgroundColor: getMealColor(mealType) + '15' }
                  ]}>
                    <Icon size={24} color={getMealColor(mealType)} />
                  </View>

                  {/* Meal Info */}
                  <Text style={styles.mealLabel}>{config.label}</Text>

                  {hasLogged ? (
                    <View style={styles.mealCaloriesContainer}>
                      <Text style={styles.mealCaloriesValue}>{mealCalories}</Text>
                      <Text style={styles.mealCaloriesUnit}>kcal</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[
                        styles.addMealButton,
                        { backgroundColor: getMealColor(mealType) }
                      ]}
                    >
                      <Plus size={16} color={THEME.colors.neutral.white} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Nutrition Tips Card */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <View style={styles.tipsIconContainer}>
              <Lightbulb size={20} color={THEME.colors.accent.blue} />
            </View>
            <Text style={styles.tipsTitle}>Daily Tip</Text>
          </View>
          <Text style={styles.tipsText}>
            Eating slowly helps you feel full faster and enjoy your food more! Try to take at least 20 minutes for each meal.
          </Text>
        </View>

        {/* Food Icons Decoration */}
        <View style={styles.foodDecoration}>
          <View style={[styles.foodIcon, { backgroundColor: THEME.colors.accent.green + '15' }]}>
            <Apple size={20} color={THEME.colors.accent.green} />
          </View>
          <View style={[styles.foodIcon, { backgroundColor: THEME.colors.accent.orange + '15' }]}>
            <Salad size={20} color={THEME.colors.accent.orange} />
          </View>
          <View style={[styles.foodIcon, { backgroundColor: THEME.colors.secondary.main + '15' }]}>
            <UtensilsCrossed size={20} color={THEME.colors.secondary.main} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background.secondary,
  },
  scrollContent: {
    padding: THEME.spacing.screenPadding,
    paddingBottom: 140,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  greetingIconContainer: {
    width: 52,
    height: 52,
    borderRadius: THEME.layout.borderRadius.xl,
    backgroundColor: THEME.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.sm,
  },
  greeting: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
  },
  username: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accent.orange + '15',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: THEME.layout.borderRadius.full,
    gap: 4,
  },
  streakCount: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.accent.orange,
  },
  progressCard: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    ...THEME.shadows.md,
  },
  progressVisual: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  progressCircleOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: THEME.colors.primary.light + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  progressCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: THEME.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 8,
    borderColor: THEME.colors.primary.main,
    ...THEME.shadows.md,
  },
  progressCircleOver: {
    borderColor: THEME.colors.secondary.main,
  },
  progressCalories: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  progressUnit: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    marginTop: 2,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xl,
  },
  quickStat: {
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  quickStatValueOver: {
    color: THEME.colors.secondary.main,
  },
  quickStatLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: THEME.colors.neutral.mediumGray,
  },
  motivationContainer: {
    alignItems: 'center',
  },
  motivationText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: 4,
    marginBottom: THEME.spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: THEME.colors.primary.main,
    borderRadius: 4,
  },
  progressBarFillOver: {
    backgroundColor: THEME.colors.secondary.main,
  },
  progressPercent: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary.main,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
    ...THEME.shadows.glow,
  },
  quickAddIcon: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAddContent: {
    flex: 1,
  },
  quickAddTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.white,
    marginBottom: 2,
  },
  quickAddSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  mealsSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionHeader: {
    marginBottom: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  mealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.md,
  },
  mealCard: {
    width: (width - 40 - THEME.spacing.md) / 2,
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    ...THEME.shadows.sm,
    position: 'relative',
  },
  mealCardLogged: {
    borderWidth: 2,
    borderColor: THEME.colors.accent.green + '40',
    backgroundColor: THEME.colors.accent.green + '05',
  },
  mealCardCurrent: {
    borderWidth: 2,
    borderColor: THEME.colors.primary.main,
    borderStyle: 'dashed',
  },
  currentMealBadge: {
    position: 'absolute',
    top: -8,
    right: THEME.spacing.md,
    backgroundColor: THEME.colors.primary.main,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.layout.borderRadius.full,
  },
  currentMealText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.white,
    letterSpacing: 0.5,
  },
  mealIconContainer: {
    width: 56,
    height: 56,
    borderRadius: THEME.layout.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  mealLabel: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.sm,
  },
  mealCaloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  mealCaloriesValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.accent.green,
  },
  mealCaloriesUnit: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
  },
  addMealButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsCard: {
    backgroundColor: THEME.colors.accent.blue + '10',
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: THEME.colors.accent.blue + '20',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.sm,
  },
  tipsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: THEME.layout.borderRadius.md,
    backgroundColor: THEME.colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.accent.blue,
  },
  tipsText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.charcoal,
    lineHeight: 20,
  },
  foodDecoration: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.md,
    marginTop: THEME.spacing.sm,
  },
  foodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
