import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Target,
  Flame,
  Zap,
  Check,
  Coffee,
  Sun,
  Moon,
  Cookie,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useWeeklyStats, useMeals } from '../hooks/useMeals';
import { THEME, COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

// Gold Shimmer Ring Component with rotating shine effect
const GoldShimmerRing: React.FC<{
  size: number;
  strokeWidth: number;
  progress: number; // 0-7 for days
  children: React.ReactNode;
}> = ({ size, strokeWidth, progress, children }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (progress <= 0) return;

    // Rotating shine animation - continuous loop
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2500,
        useNativeDriver: true,
      })
    );
    rotate.start();

    return () => rotate.stop();
  }, [progress, rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const innerSize = size - strokeWidth * 2;
  const isActive = progress > 0;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring - gray */}
      <View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: '#E5E7EB',
        }}
      />
      
      {/* Gold ring - full solid gold when active */}
      {isActive && (
        <View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: COLORS.gold.main,
            shadowColor: COLORS.gold.main,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.6,
            shadowRadius: 10,
            elevation: Platform.OS === 'android' ? 8 : 0,
          }}
        />
      )}

      {/* Rotating shine highlight */}
      {isActive && (
        <Animated.View
          style={{
            position: 'absolute',
            width: size,
            height: size,
            transform: [{ rotate: rotation }],
          }}
        >
          {/* Shine spot at top */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: size / 2 - 8,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: COLORS.gold.light,
              shadowColor: COLORS.gold.light,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 1,
              shadowRadius: 8,
              elevation: 10,
            }}
          />
        </Animated.View>
      )}

      {/* Inner circle with children */}
      <View
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: innerSize / 2,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
};

// Gold Shimmer Day Box Component with shine effect
const GoldShimmerDayBox: React.FC<{
  isCompleted: boolean;
  isToday: boolean;
  children: React.ReactNode;
  colors: any;
}> = ({ isCompleted, isToday, children, colors }) => {
  const shineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isCompleted) return;

    // Shine sweep animation
    const shine = Animated.loop(
      Animated.sequence([
        Animated.timing(shineAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.delay(500),
      ])
    );
    shine.start();

    return () => shine.stop();
  }, [isCompleted, shineAnim]);

  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-40, 40],
  });

  if (!isCompleted) {
    return (
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.background.tertiary,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 6,
          borderWidth: isToday ? 2 : 0,
          borderColor: isToday ? colors.primary.main : 'transparent',
        }}
      >
        {children}
      </View>
    );
  }

  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: COLORS.gold.main,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        borderWidth: isToday ? 2 : 0,
        borderColor: isToday ? colors.primary.main : 'transparent',
        shadowColor: COLORS.gold.main,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: Platform.OS === 'android' ? 6 : 0,
        overflow: 'hidden',
      }}
    >
      {/* Shine sweep effect */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 12,
          height: 50,
          backgroundColor: COLORS.gold.light,
          opacity: 0.6,
          transform: [
            { translateX: shineTranslate },
            { rotate: '20deg' },
          ],
        }}
      />
      {children}
    </View>
  );
};

export const ProgressScreen = () => {
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const { stats } = useMeals();
  const { days, averageCalories, daysOnTrack, consecutiveStreak } = useWeeklyStats();

  const dailyGoal = profile?.daily_calorie_goal || 2000;
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxCalories = Math.max(...days.map(d => d.calories), dailyGoal);

  const getMotivation = () => {
    if (consecutiveStreak >= 7) return "Perfect week! You're unstoppable!";
    if (consecutiveStreak >= 5) return "Amazing streak! Keep it going!";
    if (consecutiveStreak >= 3) return "Building great habits!";
    if (consecutiveStreak >= 1) return "Good start! Stay consistent!";
    return "Every day is a fresh start!";
  };

  const MEAL_ICONS = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie,
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Your Progress</Text>
          <Text style={styles.subtitle}>Weekly overview</Text>
        </View>

        {/* Streak Hero Card */}
        <View style={styles.streakCard}>
          <GoldShimmerRing
            size={140}
            strokeWidth={8}
            progress={consecutiveStreak}
          >
            <Flame
              size={32}
              color={consecutiveStreak > 0 ? COLORS.gold.main : colors.text.tertiary}
              fill={consecutiveStreak > 0 ? COLORS.gold.shimmer : 'transparent'}
            />
            <Text style={styles.streakNumber}>{consecutiveStreak}</Text>
          </GoldShimmerRing>

          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakMotivation}>{getMotivation()}</Text>

          <View style={styles.weekProgress}>
            {days.map((day, index) => {
              const isToday = new Date().toDateString() === new Date(day.date).toDateString();
              const isCompleted = day.goalMet;
              return (
                <View key={index} style={styles.dayColumn}>
                  <GoldShimmerDayBox
                    isCompleted={isCompleted}
                    isToday={isToday}
                    colors={colors}
                  >
                    {isCompleted && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </GoldShimmerDayBox>
                  <Text style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelToday,
                    isCompleted && styles.dayLabelCompleted
                  ]}>
                    {weekDays[new Date(day.date).getDay()].charAt(0)}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: colors.accent.green + '15' }]}>
              <Target size={20} color={colors.accent.green} />
            </View>
            <Text style={styles.statValue}>{daysOnTrack}<Text style={styles.statUnit}>/7</Text></Text>
            <Text style={styles.statLabel}>On Target</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: colors.accent.orange + '15' }]}>
              <Zap size={20} color={colors.accent.orange} />
            </View>
            <Text style={styles.statValue}>{averageCalories}</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: colors.primary.main + '15' }]}>
              <TrendingUp size={20} color={colors.primary.main} />
            </View>
            <Text style={styles.statValue}>{dailyGoal}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
        </View>

        {/* Weekly Bar Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>This Week's Intake</Text>

          <View style={styles.chartContainer}>
            <View style={styles.chartBars}>
              {days.map((day, index) => {
                const date = new Date(day.date);
                const isToday = new Date().toDateString() === date.toDateString();
                const barHeight = Math.max((day.calories / maxCalories) * 100, 8);
                const isOverGoal = day.calories > dailyGoal;
                const isOnTrack = day.goalMet;

                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <Text style={styles.barCalories}>
                      {day.calories > 0 ? day.calories : '-'}
                    </Text>
                    <View style={styles.barWrapper}>
                      <View
                        style={[
                          styles.chartBar,
                          { height: barHeight },
                          isOverGoal && styles.chartBarOver,
                          isOnTrack && !isOverGoal && styles.chartBarOnTrack,
                          !isOnTrack && !isOverGoal && styles.chartBarUnder,
                          isToday && styles.chartBarToday,
                        ]}
                      />
                    </View>
                    <Text style={[
                      styles.chartLabel,
                      isToday && styles.chartLabelToday
                    ]}>
                      {weekDays[date.getDay()]}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Dynamic goal line - positioned based on dailyGoal relative to maxCalories */}
            <View style={[
              styles.goalLineContainer,
              { bottom: 24 + ((dailyGoal / maxCalories) * 100) }
            ]}>
              <View style={styles.goalLine} />
              <Text style={styles.goalLineText}>{dailyGoal}</Text>
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent.green }]} />
              <Text style={styles.legendText}>On Track</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.border.medium }]} />
              <Text style={styles.legendText}>Under</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary.main }]} />
              <Text style={styles.legendText}>Over</Text>
            </View>
          </View>
        </View>

        {/* Today's Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Today's Breakdown</Text>

          <View style={styles.breakdownCard}>
            {[
              { label: 'Breakfast', calories: stats.breakfastCalories, icon: MEAL_ICONS.breakfast, color: colors.meal.breakfast },
              { label: 'Lunch', calories: stats.lunchCalories, icon: MEAL_ICONS.lunch, color: colors.meal.lunch },
              { label: 'Dinner', calories: stats.dinnerCalories, icon: MEAL_ICONS.dinner, color: colors.meal.dinner },
              { label: 'Snacks', calories: stats.snackCalories, icon: MEAL_ICONS.snack, color: colors.meal.snack },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <View key={index} style={styles.breakdownItem}>
                  <View style={styles.breakdownLeft}>
                    <View style={[styles.breakdownIconContainer, { backgroundColor: item.color + '15' }]}>
                      <Icon size={18} color={item.color} />
                    </View>
                    <Text style={styles.breakdownLabel}>{item.label}</Text>
                  </View>
                  <View style={styles.breakdownRight}>
                    <View style={[styles.breakdownBar, { backgroundColor: item.color + '20' }]}>
                      <View
                        style={[
                          styles.breakdownBarFill,
                          {
                            width: `${Math.min((item.calories / (dailyGoal * 0.35)) * 100, 100)}%`,
                            backgroundColor: item.color
                          }
                        ]}
                      />
                    </View>
                    <Text style={styles.breakdownValue}>{item.calories} kcal</Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.breakdownTotal}>
              <Text style={styles.breakdownTotalLabel}>Total Today</Text>
              <Text style={styles.breakdownTotalValue}>{stats.totalCalories} kcal</Text>
            </View>
          </View>
        </View>

        {/* Achievement Card */}
        <View style={styles.achievementCard}>
          <View style={styles.achievementIcon}>
            <Award size={24} color={colors.accent.orange} />
          </View>
          <View style={styles.achievementText}>
            <Text style={styles.achievementTitle}>
              {consecutiveStreak >= 7 ? 'Perfect Week!' : `${7 - consecutiveStreak} more days to go!`}
            </Text>
            <Text style={styles.achievementSubtitle}>
              Complete a full week on target to earn the Champion badge
            </Text>
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
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
  },
  streakCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    alignItems: 'center',
  },
  streakNumber: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginTop: 4,
  },
  streakLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: colors.text.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
    marginBottom: 4,
  },
  streakMotivation: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.medium,
    marginBottom: THEME.spacing.lg,
  },
  weekProgress: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginTop: THEME.spacing.md,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  dayLabelToday: {
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  dayLabelCompleted: {
    color: COLORS.gold.dark,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.md,
    alignItems: 'center',
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.sm,
  },
  statValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  statUnit: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  chartSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: THEME.spacing.md,
  },
  chartContainer: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    position: 'relative',
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 160,
    paddingBottom: 24,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barCalories: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
    marginBottom: 4,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  barWrapper: {
    height: 100,
    justifyContent: 'flex-end',
  },
  chartBar: {
    width: 20,
    borderRadius: THEME.layout.borderRadius.sm,
    minHeight: 8,
    backgroundColor: colors.border.medium,
  },
  chartBarOnTrack: {
    backgroundColor: colors.accent.green,
  },
  chartBarOver: {
    backgroundColor: colors.secondary.main,
  },
  chartBarUnder: {
    backgroundColor: colors.border.medium,
  },
  chartBarToday: {
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  chartLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
    marginTop: THEME.spacing.sm,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  chartLabelToday: {
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  goalLineContainer: {
    position: 'absolute',
    left: THEME.spacing.lg,
    right: THEME.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.primary.light,
    marginRight: 8,
  },
  goalLineText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.xl,
    marginTop: THEME.spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  breakdownSection: {
    marginBottom: THEME.spacing.xl,
  },
  breakdownCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  breakdownIconContainer: {
    width: 36,
    height: 36,
    borderRadius: THEME.layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.primary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  breakdownRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    flex: 1,
    justifyContent: 'flex-end',
  },
  breakdownBar: {
    width: 50,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  breakdownValue: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
    minWidth: 65,
    textAlign: 'right',
  },
  breakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.lg,
    marginTop: THEME.spacing.xs,
  },
  breakdownTotalLabel: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  breakdownTotalValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.primary.main,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: colors.accent.orange + '30',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: colors.accent.orange + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
