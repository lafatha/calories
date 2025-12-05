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
  TrendingUp, 
  TrendingDown, 
  Target, 
  Flame,
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
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate max calories for chart scaling
  const maxCalories = Math.max(...days.map(d => d.calories), dailyGoal);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Statistics</Text>
          <Text style={styles.subtitle}>Track your weekly progress</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: THEME.colors.accent.green + '20' }]}>
              <Target size={20} color={THEME.colors.accent.green} />
            </View>
            <Text style={styles.summaryValue}>{daysOnTrack}</Text>
            <Text style={styles.summaryLabel}>Days On Track</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIcon, { backgroundColor: THEME.colors.accent.orange + '20' }]}>
              <Flame size={20} color={THEME.colors.accent.orange} />
            </View>
            <Text style={styles.summaryValue}>{averageCalories}</Text>
            <Text style={styles.summaryLabel}>Avg. Calories</Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>This Week</Text>
          
          <View style={styles.chartContainer}>
            {/* Goal line */}
            <View style={[styles.goalLine, { bottom: (dailyGoal / maxCalories) * 150 }]}>
              <Text style={styles.goalLineLabel}>Goal: {dailyGoal}</Text>
            </View>

            <View style={styles.chartBars}>
              {days.map((day, index) => {
                const date = new Date(day.date);
                const isToday = new Date().toDateString() === date.toDateString();
                const barHeight = Math.max((day.calories / maxCalories) * 150, 4);
                const isOverGoal = day.calories > dailyGoal;
                
                return (
                  <View key={index} style={styles.chartBarContainer}>
                    <View style={styles.barWrapper}>
                      <View 
                        style={[
                          styles.chartBar,
                          { 
                            height: barHeight,
                            backgroundColor: isOverGoal 
                              ? THEME.colors.accent.red 
                              : day.goalMet 
                                ? THEME.colors.accent.green 
                                : THEME.colors.neutral.mediumGray,
                          },
                          isToday && styles.chartBarToday,
                        ]}
                      />
                    </View>
                    <Text style={[styles.chartLabel, isToday && styles.chartLabelToday]}>
                      {weekDays[date.getDay()]}
                    </Text>
                    {isToday && (
                      <View style={styles.todayDot} />
                    )}
                  </View>
                );
              })}
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
              <Text style={styles.legendText}>Under Goal</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: THEME.colors.accent.red }]} />
              <Text style={styles.legendText}>Over Goal</Text>
            </View>
          </View>
        </View>

        {/* Breakdown Section */}
        <View style={styles.breakdownSection}>
          <Text style={styles.sectionTitle}>Today's Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            {[
              { label: 'Breakfast', calories: stats.breakfastCalories, color: THEME.colors.meal.breakfast },
              { label: 'Lunch', calories: stats.lunchCalories, color: THEME.colors.meal.lunch },
              { label: 'Dinner', calories: stats.dinnerCalories, color: THEME.colors.meal.dinner },
              { label: 'Snacks', calories: stats.snackCalories, color: THEME.colors.meal.snack },
            ].map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                  <Text style={styles.breakdownLabel}>{item.label}</Text>
                </View>
                <Text style={styles.breakdownValue}>{item.calories} kcal</Text>
              </View>
            ))}
            
            <View style={styles.breakdownTotal}>
              <Text style={styles.breakdownTotalLabel}>Total</Text>
              <Text style={styles.breakdownTotalValue}>{stats.totalCalories} kcal</Text>
            </View>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={styles.achievementSection}>
          <View style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Award size={32} color={THEME.colors.accent.orange} />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>Keep Going!</Text>
              <Text style={styles.achievementText}>
                You've been on track for {daysOnTrack} days. 
                {daysOnTrack >= 5 ? ' Amazing consistency!' : ' Just a few more days to build your streak!'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
    marginBottom: THEME.spacing['2xl'],
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.xs,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
    marginBottom: THEME.spacing['2xl'],
  },
  summaryCard: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.md,
  },
  summaryValue: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  chartSection: {
    marginBottom: THEME.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.lg,
  },
  chartContainer: {
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.xl,
    paddingTop: THEME.spacing['3xl'],
    position: 'relative',
  },
  goalLine: {
    position: 'absolute',
    left: THEME.spacing.xl,
    right: THEME.spacing.xl,
    height: 1,
    backgroundColor: THEME.colors.accent.green,
    opacity: 0.5,
  },
  goalLineLabel: {
    position: 'absolute',
    right: 0,
    top: -18,
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.accent.green,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: 30,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    height: 150,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  chartBar: {
    width: 28,
    borderRadius: THEME.layout.borderRadius.sm,
    minHeight: 4,
  },
  chartBarToday: {
    borderWidth: 2,
    borderColor: THEME.colors.neutral.black,
  },
  chartLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    marginTop: THEME.spacing.sm,
  },
  chartLabelToday: {
    color: THEME.colors.neutral.black,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.neutral.black,
    marginTop: 4,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: THEME.spacing.xl,
    marginTop: THEME.spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
  },
  breakdownSection: {
    marginBottom: THEME.spacing['2xl'],
  },
  breakdownCard: {
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.mediumGray,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  breakdownDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  breakdownLabel: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.charcoal,
  },
  breakdownValue: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.medium,
    color: THEME.colors.neutral.black,
  },
  breakdownTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: THEME.spacing.md,
  },
  breakdownTotalLabel: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
  },
  breakdownTotalValue: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  achievementSection: {
    marginBottom: THEME.spacing.xl,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.accent.orange + '10',
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    gap: THEME.spacing.lg,
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: THEME.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.sm,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: 4,
  },
  achievementText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    lineHeight: 20,
  },
});
