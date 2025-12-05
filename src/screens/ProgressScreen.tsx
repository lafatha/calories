import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
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
import { useWeeklyStats, useMeals } from '../hooks/useMeals';
import { THEME } from '../constants/theme';

const { width } = Dimensions.get('window');

export const ProgressScreen = () => {
  const { profile } = useAuth();
  const { stats } = useMeals();
  const { days, averageCalories, daysOnTrack } = useWeeklyStats();

  const dailyGoal = profile?.daily_calorie_goal || 2000;
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxCalories = Math.max(...days.map(d => d.calories), dailyGoal);

  const getMotivation = () => {
    if (daysOnTrack >= 7) return "Perfect week! You're unstoppable!";
    if (daysOnTrack >= 5) return "Amazing streak! Keep it going!";
    if (daysOnTrack >= 3) return "Building great habits!";
    if (daysOnTrack >= 1) return "Good start! Stay consistent!";
    return "Every day is a fresh start!";
  };

  const MEAL_ICONS = {
    breakfast: Coffee,
    lunch: Sun,
    dinner: Moon,
    snack: Cookie,
  };

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

        {/* Streak Hero Card - New Design */}
        <View style={styles.streakCard}>
          {/* Streak Number with Ring */}
          <View style={styles.streakRing}>
            <View style={styles.streakInner}>
              <Flame
                size={28}
                color={daysOnTrack > 0 ? THEME.colors.accent.orange : THEME.colors.neutral.gray}
                fill={daysOnTrack > 0 ? THEME.colors.accent.orange : 'transparent'}
              />
              <Text style={styles.streakNumber}>{daysOnTrack}</Text>
            </View>
            {/* Progress Ring Visual */}
            {[...Array(7)].map((_, i) => (
              <View
                key={i}
                style={[
                  styles.ringDot,
                  {
                    transform: [
                      { rotate: `${(i * 360) / 7}deg` },
                      { translateY: -48 },
                    ],
                  },
                  i < daysOnTrack && styles.ringDotActive,
                ]}
              />
            ))}
          </View>

          <Text style={styles.streakLabel}>Day Streak</Text>
          <Text style={styles.streakMotivation}>{getMotivation()}</Text>

          {/* Week Progress Bar */}
          <View style={styles.weekProgress}>
            {days.map((day, index) => {
              const isToday = new Date().toDateString() === new Date(day.date).toDateString();
              const isCompleted = day.goalMet;
              return (
                <View key={index} style={styles.dayColumn}>
                  <View style={[
                    styles.dayBar,
                    isCompleted && styles.dayBarCompleted,
                    isToday && styles.dayBarToday,
                  ]}>
                    {isCompleted && <Check size={12} color={THEME.colors.neutral.white} />}
                  </View>
                  <Text style={[
                    styles.dayLabel,
                    isToday && styles.dayLabelToday
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
            <View style={[styles.statIconBg, { backgroundColor: THEME.colors.accent.green + '15' }]}>
              <Target size={20} color={THEME.colors.accent.green} />
            </View>
            <Text style={styles.statValue}>{daysOnTrack}<Text style={styles.statUnit}>/7</Text></Text>
            <Text style={styles.statLabel}>On Target</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: THEME.colors.accent.orange + '15' }]}>
              <Zap size={20} color={THEME.colors.accent.orange} />
            </View>
            <Text style={styles.statValue}>{averageCalories}</Text>
            <Text style={styles.statLabel}>Avg/Day</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBg, { backgroundColor: THEME.colors.primary.main + '15' }]}>
              <TrendingUp size={20} color={THEME.colors.primary.main} />
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

            {/* Goal line indicator */}
            <View style={styles.goalLineContainer}>
              <View style={styles.goalLine} />
              <Text style={styles.goalLineText}>Goal</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: THEME.colors.accent.green }]} />
              <Text style={styles.legendText}>On Track</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: THEME.colors.neutral.mediumGray }]} />
              <Text style={styles.legendText}>Under</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: THEME.colors.secondary.main }]} />
              <Text style={styles.legendText}>Over</Text>
            </View>
          </View>
        </View>

        {/* Today's Breakdown */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Today's Breakdown</Text>

          <View style={styles.breakdownCard}>
            {[
              { label: 'Breakfast', calories: stats.breakfastCalories, icon: MEAL_ICONS.breakfast, color: THEME.colors.meal.breakfast },
              { label: 'Lunch', calories: stats.lunchCalories, icon: MEAL_ICONS.lunch, color: THEME.colors.meal.lunch },
              { label: 'Dinner', calories: stats.dinnerCalories, icon: MEAL_ICONS.dinner, color: THEME.colors.meal.dinner },
              { label: 'Snacks', calories: stats.snackCalories, icon: MEAL_ICONS.snack, color: THEME.colors.meal.snack },
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
            <Award size={24} color={THEME.colors.accent.orange} />
          </View>
          <View style={styles.achievementText}>
            <Text style={styles.achievementTitle}>
              {daysOnTrack >= 7 ? 'Perfect Week!' : `${7 - daysOnTrack} more days to go!`}
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
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
  },
  streakCard: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    marginBottom: THEME.spacing.lg,
    alignItems: 'center',
    ...THEME.shadows.md,
  },
  streakRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
    position: 'relative',
  },
  streakInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: THEME.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.sm,
  },
  streakNumber: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginTop: 2,
  },
  ringDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME.colors.neutral.mediumGray,
  },
  ringDotActive: {
    backgroundColor: THEME.colors.accent.orange,
  },
  streakLabel: {
    fontSize: THEME.typography.fontSizes.md,
    color: THEME.colors.neutral.charcoal,
    fontWeight: THEME.typography.fontWeights.semibold,
    marginBottom: 4,
  },
  streakMotivation: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.medium,
    marginBottom: THEME.spacing.lg,
  },
  weekProgress: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayBar: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dayBarCompleted: {
    backgroundColor: THEME.colors.accent.green,
  },
  dayBarToday: {
    borderWidth: 2,
    borderColor: THEME.colors.primary.main,
  },
  dayLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  dayLabelToday: {
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  statsRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.md,
    alignItems: 'center',
    ...THEME.shadows.xs,
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
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  statUnit: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.medium,
    color: THEME.colors.neutral.darkGray,
  },
  statLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  chartSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.md,
  },
  chartContainer: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
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
    color: THEME.colors.neutral.darkGray,
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
    backgroundColor: THEME.colors.neutral.mediumGray,
  },
  chartBarOnTrack: {
    backgroundColor: THEME.colors.accent.green,
  },
  chartBarOver: {
    backgroundColor: THEME.colors.secondary.main,
  },
  chartBarUnder: {
    backgroundColor: THEME.colors.neutral.mediumGray,
  },
  chartBarToday: {
    borderWidth: 2,
    borderColor: THEME.colors.primary.main,
  },
  chartLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    marginTop: THEME.spacing.sm,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  chartLabelToday: {
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  goalLineContainer: {
    position: 'absolute',
    left: THEME.spacing.lg,
    right: THEME.spacing.lg,
    bottom: 75,
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.primary.light,
    marginRight: 8,
  },
  goalLineText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.primary.main,
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
    color: THEME.colors.neutral.darkGray,
  },
  breakdownSection: {
    marginBottom: THEME.spacing.xl,
  },
  breakdownCard: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    ...THEME.shadows.sm,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.lightGray,
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
    color: THEME.colors.neutral.charcoal,
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
    color: THEME.colors.neutral.black,
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
    color: THEME.colors.neutral.black,
  },
  breakdownTotalValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.primary.main,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    borderWidth: 1,
    borderColor: THEME.colors.accent.orange + '30',
    ...THEME.shadows.xs,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: THEME.colors.accent.orange + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    lineHeight: 18,
  },
});
