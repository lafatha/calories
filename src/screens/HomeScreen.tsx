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
  Apple,
  Salad,
  UtensilsCrossed,
  Lightbulb,
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
  const { daysOnTrack } = useWeeklyStats();

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
        {isTodayItem && (
          <View style={[
            styles.todayDot,
            { backgroundColor: isSelected ? colors.text.inverse : colors.primary.main },
          ]} />
        )}
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

          {daysOnTrack > 0 && (
            <View style={styles.streakContainer}>
              <Flame size={18} color={colors.accent.orange} fill={colors.accent.orange} />
              <Text style={styles.streakCount}>{daysOnTrack}</Text>
            </View>
          )}
        </View>

        {/* Main Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressVisual}>
            <View style={styles.progressCircleOuter}>
              <View style={[
                styles.progressCircle,
                isOverGoal && { borderColor: colors.secondary.main }
              ]}>
                <Text style={styles.progressCalories}>{stats.totalCalories}</Text>
                <Text style={styles.progressUnit}>kcal</Text>
              </View>
            </View>

            <View style={styles.quickStatsRow}>
              <View style={styles.quickStat}>
                <Text style={styles.quickStatValue}>{dailyGoal}</Text>
                <Text style={styles.quickStatLabel}>Goal</Text>
              </View>
              <View style={styles.quickStatDivider} />
              <View style={styles.quickStat}>
                <Text style={[
                  styles.quickStatValue,
                  isOverGoal && { color: colors.secondary.main }
                ]}>
                  {isOverGoal ? '+' : ''}{Math.abs(remainingCalories)}
                </Text>
                <Text style={styles.quickStatLabel}>{isOverGoal ? 'Over' : 'Left'}</Text>
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
            {!isToday && (
              <TouchableOpacity
                style={styles.todayButton}
                onPress={() => {
                  setSelectedDate(new Date());
                  calendarRef.current?.scrollToEnd({ animated: true });
                }}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </TouchableOpacity>
            )}
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
              length: 56,
              offset: 56 * index,
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
              <TouchableOpacity style={styles.retryButton} onPress={refresh}>
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
                    hasLogged && styles.mealCardLogged,
                    isCurrentMeal && !hasLogged && styles.mealCardCurrent,
                  ]}
                  onPress={() => isToday && navigation.navigate('Camera')}
                  activeOpacity={isToday ? 0.8 : 1}
                  disabled={!isToday}
                >
                  {isCurrentMeal && !hasLogged && (
                    <View style={styles.currentMealBadge}>
                      <Text style={styles.currentMealText}>NOW</Text>
                    </View>
                  )}

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
              {Object.entries(meals).map(([type, items]) =>
                items.map((meal: Meal, index: number) => (
                  <View key={meal.id || index} style={styles.mealItem}>
                    <View style={[
                      styles.mealItemDot,
                      { backgroundColor: colors.meal[type as MealType] }
                    ]} />
                    <View style={styles.mealItemInfo}>
                      <Text style={styles.mealItemName} numberOfLines={1}>
                        {meal.food_name}
                      </Text>
                      <Text style={styles.mealItemType}>
                        {MEAL_CONFIG[type as MealType].label}
                      </Text>
                    </View>
                    <Text style={styles.mealItemCalories}>{meal.calories} kcal</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {/* Tips Card */}
        {isToday && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <View style={styles.tipsIconContainer}>
                <Lightbulb size={20} color={colors.accent.blue} />
              </View>
              <Text style={styles.tipsTitle}>Daily Tip</Text>
            </View>
            <Text style={styles.tipsText}>
              Eating slowly helps you feel full faster and enjoy your food more! Try to take at least 20 minutes for each meal.
            </Text>
          </View>
        )}

        {/* Food Icons Decoration */}
        <View style={styles.foodDecoration}>
          <View style={[styles.foodIcon, { backgroundColor: colors.accent.green + '15' }]}>
            <Apple size={20} color={colors.accent.green} />
          </View>
          <View style={[styles.foodIcon, { backgroundColor: colors.accent.orange + '15' }]}>
            <Salad size={20} color={colors.accent.orange} />
          </View>
          <View style={[styles.foodIcon, { backgroundColor: colors.secondary.main + '15' }]}>
            <UtensilsCrossed size={20} color={colors.secondary.main} />
          </View>
        </View>
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
  progressVisual: {
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
  },
  progressCircleOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary.main + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.lg,
  },
  progressCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
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
    color: colors.text.primary,
  },
  quickStatLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  quickStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border.light,
  },
  motivationContainer: {
    alignItems: 'center',
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
    height: 8,
    backgroundColor: colors.background.tertiary,
    borderRadius: 4,
    marginBottom: THEME.spacing.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 4,
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
  todayButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: colors.primary.main + '20',
    borderRadius: THEME.layout.borderRadius.full,
  },
  todayButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  calendarList: {
    paddingVertical: 4,
  },
  dateItem: {
    width: 48,
    height: 68,
    marginHorizontal: 4,
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
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
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
  mealCardLogged: {
    borderWidth: 2,
    borderColor: colors.accent.green + '40',
    backgroundColor: isDark ? colors.accent.green + '10' : colors.accent.green + '05',
  },
  mealCardCurrent: {
    borderWidth: 2,
    borderColor: colors.primary.main,
    borderStyle: 'dashed',
  },
  currentMealBadge: {
    position: 'absolute',
    top: -8,
    right: THEME.spacing.md,
    backgroundColor: colors.primary.main,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: THEME.layout.borderRadius.full,
  },
  currentMealText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.inverse,
    letterSpacing: 0.5,
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
    color: colors.accent.green,
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
    padding: THEME.spacing.md,
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
    paddingVertical: THEME.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  mealItemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: THEME.spacing.md,
  },
  mealItemInfo: {
    flex: 1,
  },
  mealItemName: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.medium,
    color: colors.text.primary,
  },
  mealItemType: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  mealItemCalories: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  tipsCard: {
    backgroundColor: isDark ? colors.accent.blue + '15' : colors.accent.blue + '10',
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    borderWidth: 1,
    borderColor: colors.accent.blue + '30',
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
    backgroundColor: colors.accent.blue + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipsTitle: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.accent.blue,
  },
  tipsText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.primary,
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

