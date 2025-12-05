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
  ChevronLeft, 
  ChevronRight,
  Clock,
  Target,
  TrendingUp,
  Coffee,
  Sun,
  Moon,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTime } from '../hooks/useTime';
import { useMeals, useWeeklyStats } from '../hooks/useMeals';
import { THEME } from '../constants/theme';
import { RootStackParamList, MealType } from '../types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MEAL_ICONS: Record<MealType, React.ReactNode> = {
  breakfast: <Coffee size={20} color={THEME.colors.meal.breakfast} />,
  lunch: <Sun size={20} color={THEME.colors.meal.lunch} />,
  dinner: <Moon size={20} color={THEME.colors.meal.dinner} />,
  snack: <Coffee size={16} color={THEME.colors.meal.snack} />,
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const { greeting, formattedTime, formattedDate, currentMealType, mealTimeRange } = useTime(profile?.timezone);
  const { meals, stats } = useMeals();
  const { daysOnTrack } = useWeeklyStats();

  const dailyGoal = profile?.daily_calorie_goal || 2000;
  const remainingCalories = Math.max(0, dailyGoal - stats.totalCalories);
  const progressPercentage = Math.min((stats.totalCalories / dailyGoal) * 100, 100);

  // Generate week days for calendar strip
  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        dayName: dayNames[date.getDay()],
        dayNumber: date.getDate(),
        isToday: i === 0,
        date: date.toISOString().split('T')[0],
      });
    }
    return days;
  };

  const weekDays = getWeekDays();
  const currentMonthYear = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.username}>{profile?.full_name || profile?.username || 'User'}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Clock size={14} color={THEME.colors.neutral.darkGray} />
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        </View>

        {/* Progress Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View style={styles.heroLabelContainer}>
              <Flame size={14} color={THEME.colors.neutral.black} fill={THEME.colors.neutral.black} />
              <Text style={styles.heroLabel}>Daily Intake</Text>
            </View>
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{daysOnTrack} day streak</Text>
            </View>
          </View>

          <View style={styles.heroContent}>
            <View style={styles.calorieInfo}>
              <Text style={styles.calorieValue}>{stats.totalCalories}</Text>
              <Text style={styles.calorieUnit}>kcal consumed</Text>
            </View>

            {/* Progress Ring */}
            <View style={styles.progressRingContainer}>
              <View style={styles.progressRing}>
                <View style={styles.progressRingInner}>
                  <Text style={styles.progressValue}>{Math.round(progressPercentage)}%</Text>
                  <Text style={styles.progressLabel}>of goal</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <View style={styles.remainingContainer}>
              <Target size={16} color={THEME.colors.accent.green} />
              <Text style={styles.remainingText}>
                {remainingCalories} kcal remaining
              </Text>
            </View>
          </View>
        </View>

        {/* Current Meal Time Banner */}
        <View style={[styles.mealTimeBanner, { backgroundColor: getMealColor(currentMealType) + '15' }]}>
          <View style={[styles.mealTimeIcon, { backgroundColor: getMealColor(currentMealType) }]}>
            {MEAL_ICONS[currentMealType]}
          </View>
          <View style={styles.mealTimeInfo}>
            <Text style={styles.mealTimeTitle}>
              It's {MEAL_LABELS[currentMealType]} Time
            </Text>
            <Text style={styles.mealTimeRange}>{mealTimeRange}</Text>
          </View>
          <TouchableOpacity 
            style={styles.mealTimeAction}
            onPress={() => navigation.navigate('Camera')}
          >
            <Plus size={20} color={THEME.colors.neutral.white} />
          </TouchableOpacity>
        </View>

        {/* Calendar Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{currentMonthYear}</Text>
          <View style={styles.calendarNav}>
            <TouchableOpacity style={styles.navButton}>
              <ChevronLeft size={20} color={THEME.colors.neutral.darkGray} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navButton}>
              <ChevronRight size={20} color={THEME.colors.neutral.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Strip */}
        <View style={styles.calendarStrip}>
          {weekDays.map((day, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.calendarDay, day.isToday && styles.calendarDayActive]}
            >
              <Text style={[styles.dayName, day.isToday && styles.dayNameActive]}>
                {day.dayName}
              </Text>
              <Text style={[styles.dayNumber, day.isToday && styles.dayNumberActive]}>
                {day.dayNumber}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Meals Section */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Meals</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Camera')}>
              <Text style={styles.addMealText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {/* Meal Cards */}
          {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((mealType) => {
            const mealItems = meals[mealType];
            const mealCalories = mealType === 'breakfast' 
              ? stats.breakfastCalories 
              : mealType === 'lunch' 
                ? stats.lunchCalories 
                : stats.dinnerCalories;

            return (
              <TouchableOpacity 
                key={mealType} 
                style={styles.mealCard}
                onPress={() => navigation.navigate('Camera')}
              >
                <View style={styles.mealCardLeft}>
                  <View style={[styles.mealIcon, { backgroundColor: getMealColor(mealType) + '20' }]}>
                    {MEAL_ICONS[mealType]}
                  </View>
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealTitle}>{MEAL_LABELS[mealType]}</Text>
                    {mealItems.length > 0 ? (
                      <Text style={styles.mealItems}>
                        {mealItems.map(m => m.food_name).join(', ').slice(0, 30)}
                        {mealItems.map(m => m.food_name).join(', ').length > 30 ? '...' : ''}
                      </Text>
                    ) : (
                      <Text style={styles.mealEmpty}>No meals logged</Text>
                    )}
                  </View>
                </View>
                <View style={styles.mealCardRight}>
                  {mealCalories > 0 ? (
                    <Text style={styles.mealCalories}>{mealCalories} kcal</Text>
                  ) : (
                    <View style={styles.addButton}>
                      <Plus size={18} color={THEME.colors.neutral.black} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.statCard}>
            <TrendingUp size={20} color={THEME.colors.accent.green} />
            <Text style={styles.statValue}>{daysOnTrack}/7</Text>
            <Text style={styles.statLabel}>Days on track</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={20} color={THEME.colors.primary.main} />
            <Text style={styles.statValue}>{dailyGoal}</Text>
            <Text style={styles.statLabel}>Daily goal</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const getMealColor = (mealType: MealType): string => {
  return THEME.colors.meal[mealType];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.white,
  },
  scrollContent: {
    padding: THEME.spacing.screenPadding,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: THEME.spacing['2xl'],
  },
  greeting: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
    marginBottom: 4,
  },
  username: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME.colors.neutral.lightGray,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: THEME.layout.borderRadius.full,
  },
  timeText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.charcoal,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  heroCard: {
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.xl,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  heroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.black,
    fontWeight: THEME.typography.fontWeights.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakBadge: {
    backgroundColor: THEME.colors.neutral.white,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.layout.borderRadius.full,
  },
  streakText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.accent.green,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieInfo: {
    flex: 1,
  },
  calorieValue: {
    fontSize: THEME.typography.fontSizes.hero,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    letterSpacing: -1,
  },
  calorieUnit: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
    marginTop: 4,
  },
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: THEME.colors.neutral.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRingInner: {
    alignItems: 'center',
  },
  progressValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  progressLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
  },
  heroBottom: {
    marginTop: THEME.spacing.xl,
  },
  remainingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  remainingText: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.charcoal,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  mealTimeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderRadius: THEME.layout.borderRadius.xl,
    marginBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
  },
  mealTimeIcon: {
    width: 44,
    height: 44,
    borderRadius: THEME.layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTimeInfo: {
    flex: 1,
  },
  mealTimeTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  mealTimeRange: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  mealTimeAction: {
    width: 36,
    height: 36,
    borderRadius: THEME.layout.borderRadius.md,
    backgroundColor: THEME.colors.neutral.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
  },
  calendarNav: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMealText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing['2xl'],
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 40 - 48) / 7,
    height: 64,
    borderRadius: THEME.layout.borderRadius.lg,
  },
  calendarDayActive: {
    backgroundColor: THEME.colors.neutral.black,
  },
  dayName: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    marginBottom: 6,
  },
  dayNameActive: {
    color: THEME.colors.neutral.white,
  },
  dayNumber: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
  },
  dayNumberActive: {
    color: THEME.colors.neutral.white,
  },
  mealsSection: {
    marginBottom: THEME.spacing.xl,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.lightGray,
  },
  mealCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    flex: 1,
  },
  mealIcon: {
    width: 44,
    height: 44,
    borderRadius: THEME.layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  mealItems: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  mealEmpty: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.gray,
    fontStyle: 'italic',
  },
  mealCardRight: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.charcoal,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: THEME.layout.borderRadius.md,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  statValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
});
