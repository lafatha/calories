import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ActivityIndicator,
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
  Sunrise,
  Sunset,
  CloudMoon,
  Calendar,
  AlertCircle,
  RefreshCw,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTime } from '../hooks/useTime';
import { useMeals, useWeeklyStats } from '../hooks/useMeals';
import { THEME } from '../constants/theme';
import { RootStackParamList, MealType, Meal } from '../types';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const MEAL_CONFIG: Record<MealType, { icon: any; label: string }> = {
  breakfast: { icon: Coffee, label: 'Breakfast' },
  lunch: { icon: Sun, label: 'Lunch' },
  dinner: { icon: Moon, label: 'Dinner' },
  snack: { icon: Cookie, label: 'Snack' },
};

const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(date);
  }
  return dates;
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const { greeting, currentMealType } = useTime(profile?.timezone);
  const { consecutiveStreak } = useWeeklyStats();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const calendarRef = useRef<FlatList>(null);

  const { meals, stats, isLoading, error, refresh } = useMeals(selectedDate);

  const dates = generateDates();
  const dailyGoal = profile?.daily_calorie_goal || 2000;
  const remainingCalories = Math.max(0, dailyGoal - stats.totalCalories);
  const progressPercentage = Math.min((stats.totalCalories / dailyGoal) * 100, 100);
  const isOverGoal = stats.totalCalories > dailyGoal;

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour < 12) return <Sunrise size={28} color={colors.accent.orange} />;
    if (hour < 17) return <Sun size={28} color={colors.accent.orange} />;
    if (hour < 21) return <Sunset size={28} color={colors.accent.purple} />;
    return <CloudMoon size={28} color={colors.primary.main} />;
  };

  const getMotivationalMessage = () => {
    if (!isToday) return `Viewing ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`;
    if (progressPercentage === 0) return "Let's start your day right!";
    if (progressPercentage < 30) return "Great start! Keep going!";
    if (progressPercentage < 60) return "You're doing amazing!";
    if (progressPercentage < 90) return "Almost there!";
    if (progressPercentage <= 100) return "Perfect balance today!";
    return "A little over, but that's okay!";
  };

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
  };

  const renderDateItem = ({ item: date }: { item: Date }) => {
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const isTodayItem = date.toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          { backgroundColor: colors.background.card },
          isSelected && { backgroundColor: colors.primary.main },
          isTodayItem && !isSelected && { borderWidth: 2, borderColor: colors.primary.main },
        ]}
        onPress={() => setSelectedDate(date)}
      >
        <Text style={[
          styles.dateWeekday,
          { color: colors.text.secondary },
          isSelected && { color: colors.text.inverse },
        ]}>
          {WEEKDAYS[date.getDay()]}
        </Text>
        <Text style={[
          styles.dateNumber,
          { color: colors.text.primary },
          isSelected && { color: colors.text.inverse },
          isTodayItem && !isSelected && { color: colors.primary.main },
        ]}>
          {date.getDate()}
        </Text>
      </TouchableOpacity>
    );
  };

  const styles = createStyles(colors, isDark);

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

          {consecutiveStreak > 0 && (
            <View style={styles.streakContainer}>
              <Flame size={18} color={colors.accent.orange} fill={colors.accent.orange} />
              <Text style={styles.streakCount}>{consecutiveStreak}</Text>
            </View>
          )}
        </View>

        {/* Main Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressTopRow}>
            {/* Circle on left */}
            <View style={styles.progressCircleOuter}>
              <View style={[
                styles.progressCircle,
                isOverGoal && { borderColor: colors.secondary.main }
              ]}>
                <Text style={styles.progressCalories}>{stats.totalCalories}</Text>
                <Text style={styles.progressUnit}>kcal</Text>
              </View>
            </View>

            {/* Stats on right */}
            <View style={styles.quickStatsRow}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue} numberOfLines={1}>{dailyGoal}</Text>
                <Text style={styles.quickStatLabel} numberOfLines={1}>Goal</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text 
                  style={[
                    styles.quickStatValue,
                    isOverGoal && { color: colors.secondary.main }
                  ]}
                  numberOfLines={1}
                >
                  {isOverGoal ? '+' : ''}{Math.abs(remainingCalories)}
                </Text>
                <Text style={styles.quickStatLabel} numberOfLines={1}>{isOverGoal ? 'Over' : 'Left'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.motivationContainer}>
            <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressBarFill,
                { width: `${Math.min(progressPercentage, 100)}%` },
                isOverGoal && { backgroundColor: colors.secondary.main }
              ]} />
            </View>
            <Text style={styles.progressPercent}>{Math.round(progressPercentage)}% of daily goal</Text>
          </View>
        </View>

        {/* Calendar Strip */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <Calendar size={18} color={colors.primary.main} />
            <Text style={styles.calendarTitle}>{formatDateLabel(selectedDate)}</Text>
          </View>

          <FlatList
            ref={calendarRef}
            data={dates}
            renderItem={renderDateItem}
            keyExtractor={(item) => item.toISOString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarList}
            initialScrollIndex={dates.length - 1}
            getItemLayout={(data, index) => ({
              length: 68,
              offset: 68 * index,
              index,
            })}
          />
        </View>

        {/* Quick Add Button */}
        {isToday && (
          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={() => navigation.navigate('Camera')}
            activeOpacity={0.9}
          >
            <View style={styles.quickAddIcon}>
              <Sparkles size={24} color={colors.text.inverse} />
            </View>
            <View style={styles.quickAddContent}>
              <Text style={styles.quickAddTitle}>Log Your Meal</Text>
              <Text style={styles.quickAddSubtitle}>Snap a photo for instant AI analysis</Text>
            </View>
            <ChevronRight size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        )}

        {/* Meals Section */}
        <View style={styles.mealsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isToday ? "Today's Meals" : `Meals on ${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {isToday ? 'Tap to add or view details' : 'View your meal history'}
            </Text>
          </View>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary.main} />
              <Text style={styles.loadingText}>Loading meals...</Text>
            </View>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <AlertCircle size={32} color={colors.semantic.error} />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
                <RefreshCw size={16} color={colors.text.inverse} />
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Meals Grid - only show when not loading and no error */}
          {!isLoading && !error && (
            <View style={styles.mealsGrid}>
              {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((mealType) => {
                const config = MEAL_CONFIG[mealType];
                const Icon = config.icon;
                const mealCalories = mealType === 'breakfast'
                  ? stats.breakfastCalories
                  : mealType === 'lunch'
                    ? stats.lunchCalories
                    : mealType === 'dinner'
                      ? stats.dinnerCalories
                      : stats.snackCalories;
                const hasLogged = mealCalories > 0;
                const isCurrentMeal = isToday && currentMealType === mealType;

                return (
                  <TouchableOpacity
                    key={mealType}
                    style={[
                      styles.mealCard,
                      isCurrentMeal && !hasLogged && styles.mealCardCurrent,
                    ]}
                    onPress={() => isToday && navigation.navigate('Camera')}
                    activeOpacity={isToday ? 0.8 : 1}
                    disabled={!isToday}
                  >

                    <View style={[
                      styles.mealIconContainer,
                      { backgroundColor: colors.meal[mealType] + '15' }
                    ]}>
                      <Icon size={24} color={colors.meal[mealType]} />
                    </View>

                    <Text style={styles.mealLabel}>{config.label}</Text>

                    {hasLogged ? (
                      <View style={styles.mealCaloriesContainer}>
                        <Text style={styles.mealCaloriesValue}>{mealCalories}</Text>
                        <Text style={styles.mealCaloriesUnit}>kcal</Text>
                      </View>
                    ) : isToday ? (
                      <TouchableOpacity
                        style={[styles.addMealButton, { backgroundColor: colors.meal[mealType] }]}
                      >
                        <Plus size={16} color={colors.text.inverse} />
                      </TouchableOpacity>
                    ) : (
                      <Text style={styles.noMealText}>No meal</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* Meal Items List */}
        {!isLoading && !error && stats.totalCalories > 0 && (
          <View style={styles.mealItemsSection}>
            <Text style={styles.mealItemsTitle}>Logged Items</Text>
            <View style={styles.mealItemsCard}>
              {(() => {
                const allMeals = Object.entries(meals).flatMap(([type, items]) =>
                  items.map((meal: Meal) => ({ ...meal, type: type as MealType }))
                );
                return allMeals.map((meal, index) => (
                  <View
                    key={meal.id || index}
                    style={[
                      styles.mealItem,
                      index === allMeals.length - 1 && { borderBottomWidth: 0 }
                    ]}
                  >
                    <View style={[
                      styles.mealItemDot,
                      { backgroundColor: colors.meal[meal.type as MealType] }
                    ]} />
                    <View style={styles.mealItemInfo}>
                      <Text style={styles.mealItemName} numberOfLines={1}>
                        {meal.food_name}
                      </Text>
                      <Text style={styles.mealItemType}>
                        {MEAL_CONFIG[meal.type as MealType].label}
                      </Text>
                    </View>
                    <Text style={styles.mealItemCalories}>{meal.calories} kcal</Text>
                  </View>
                ));
              })()}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: THEME.spacing.screenPadding,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  greetingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.xl,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for light mode, border for dark mode
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 3,
    }),
  },
  greeting: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
  },
  username: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent.orange + '15',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: THEME.layout.borderRadius.full,
    gap: 4,
  },
  streakCount: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.accent.orange,
  },
  progressCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    // Shadow for light mode, border for dark mode
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 16,
      elevation: 5,
    }),
  },
  progressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  progressCircleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary.main + '12',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.primary.main,
  },
  progressCalories: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  progressUnit: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  quickStatsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStat: {
    alignItems: 'center',
    width: 90,
    paddingHorizontal: THEME.spacing.xs,
  },
  quickStatValue: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    textAlign: 'center',
    width: '100%',
  },
  quickStatLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.medium,
    marginHorizontal: THEME.spacing.lg,
  },
  motivationContainer: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: THEME.spacing.lg,
  },
  motivationText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: THEME.spacing.md,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 10,
    backgroundColor: colors.background.tertiary,
    borderRadius: 5,
    marginBottom: THEME.spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 5,
  },
  progressPercent: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  calendarSection: {
    marginBottom: THEME.spacing.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.md,
    gap: THEME.spacing.sm,
  },
  calendarTitle: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  calendarList: {
    paddingVertical: 4,
  },
  dateItem: {
    width: 56,
    height: 56,
    marginHorizontal: 6,
    borderRadius: THEME.layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow for calendar items
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    }),
  },
  dateWeekday: {
    fontSize: THEME.typography.fontSizes.xs,
    marginBottom: 2,
  },
  dateNumber: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
    // Glow shadow
    shadowColor: colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
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
    color: colors.text.inverse,
    marginBottom: 2,
  },
  quickAddSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  mealsSection: {
    marginBottom: THEME.spacing.lg,
  },
  sectionHeader: {
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing['3xl'],
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing['2xl'],
    paddingHorizontal: THEME.spacing.xl,
    backgroundColor: colors.semantic.error + '10',
    borderRadius: THEME.layout.borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.semantic.error + '30',
  },
  errorText: {
    marginTop: THEME.spacing.sm,
    fontSize: THEME.typography.fontSizes.base,
    color: colors.semantic.error,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
    marginTop: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    paddingHorizontal: THEME.spacing.lg,
    backgroundColor: colors.semantic.error,
    borderRadius: THEME.layout.borderRadius.full,
  },
  retryText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  mealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.md,
  },
  mealCard: {
    width: (width - 40 - THEME.spacing.md) / 2,
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    position: 'relative',
    // Shadow for meal cards
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 4,
    }),
  },
  mealCardCurrent: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
  },
  mealIconContainer: {
    width: 52,
    height: 52,
    borderRadius: THEME.layout.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
  },
  mealLabel: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
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
    color: colors.text.primary,
  },
  mealCaloriesUnit: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  noMealText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.tertiary,
  },
  addMealButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealItemsSection: {
    marginBottom: THEME.spacing.lg,
  },
  mealItemsTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: THEME.spacing.md,
  },
  mealItemsCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    // Shadow for logged items card
    ...(isDark ? {
      borderWidth: 1,
      borderColor: colors.border.light,
    } : {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 10,
      elevation: 4,
    }),
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  mealItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: THEME.spacing.md,
  },
  mealItemInfo: {
    flex: 1,
  },
  mealItemName: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.medium,
    color: colors.text.primary,
  },
  mealItemType: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: 2,
  },
  mealItemCalories: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
  },
});

