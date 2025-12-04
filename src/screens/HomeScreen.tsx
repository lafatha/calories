import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../components/Card';
import { Flame, Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';

export const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header - Simplified */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>User 1</Text>
          </View>
          {/* Deleted Header Icons as requested */}
        </View>

        {/* Weekly Progress Hero Card - Minimalist */}
        <Card style={styles.heroCard}>
          <View style={styles.heroContent}>
             <View>
               <View style={styles.heroLabelContainer}>
                 <Flame size={14} color={THEME.colors.neutral.black} fill="black" />
                 <Text style={styles.heroLabel}>Daily intake</Text>
               </View>
               <Text style={styles.heroTitle}>Weekly{'\n'}Progress</Text>
             </View>
             {/* Minimal Ring Placeholder */}
             <View style={styles.ringPlaceholder}>
               <View style={styles.innerRing}>
                 <Text style={styles.ringValue}>6</Text>
                 <Text style={styles.ringUnit}>days</Text>
               </View>
             </View>
          </View>
        </Card>

        {/* Calendar Strip Placeholder */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>August 2025</Text>
            <View style={styles.row}>
                <ChevronLeft size={20} color={THEME.colors.neutral.darkGray} style={{ marginRight: 16 }} />
                <ChevronRight size={20} color={THEME.colors.neutral.black} />
            </View>
        </View>
        
        {/* Calendar Days Strip */}
        <View style={styles.calendarStrip}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
            const isToday = index === 3; 
            return (
              <View key={index} style={[styles.calendarDay, isToday && styles.activeDay]}>
                 <Text style={[styles.dayLabel, isToday && styles.activeDayText]}>{day}</Text>
                 <Text style={[styles.dateLabel, isToday && styles.activeDayText]}>{7 + index}</Text>
              </View>
            );
          })}
        </View>


        {/* Meals Section - Minimal List */}
        <View style={styles.mealSection}>
            <View style={styles.mealCard}>
                <View style={styles.mealInfo}>
                   <Text style={{fontSize: 24}}>🥗</Text> 
                   <View>
                      <Text style={styles.mealTitle}>Breakfast</Text>
                      <View style={styles.caloriesBadge}>
                          <Text style={styles.caloriesText}>456 - 512 kcal</Text>
                      </View>
                   </View>
                </View>
                <View style={styles.addButton}>
                    <Plus size={18} color={THEME.colors.neutral.black} />
                </View>
            </View>
            
             <View style={styles.mealCard}>
                <View style={styles.mealInfo}>
                   <Text style={{fontSize: 24}}>🥩</Text> 
                   <View>
                      <Text style={styles.mealTitle}>Lunch</Text>
                      <View style={styles.caloriesBadge}>
                          <Text style={styles.caloriesText}>456 - 512 kcal</Text>
                      </View>
                   </View>
                </View>
                <View style={styles.addButton}>
                    <Plus size={18} color={THEME.colors.neutral.black} />
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
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: THEME.colors.neutral.darkGray, // Made lighter to contrast with bold username
    marginBottom: 4,
    fontWeight: '500',
  },
  username: {
    fontSize: 24,
    fontWeight: '700', // Bolder
    color: THEME.colors.neutral.black,
    letterSpacing: -0.5,
  },
  heroCard: {
    marginBottom: 40,
    backgroundColor: '#FAFAFA', // Even lighter gray
    borderRadius: 24,
    padding: 24,
    elevation: 0,
    shadowOpacity: 0,
    borderWidth: 1,
    borderColor: THEME.colors.neutral.lightGray,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  heroLabel: {
     fontSize: 12,
     color: THEME.colors.neutral.black, 
     fontWeight: '600',
     textTransform: 'uppercase',
     letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '300',
    lineHeight: 38,
    color: THEME.colors.neutral.black,
  },
  ringPlaceholder: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 1,
      borderColor: THEME.colors.neutral.mediumGray,
      justifyContent: 'center',
      alignItems: 'center',
  },
  innerRing: {
    alignItems: 'center',
  },
  ringValue: {
      fontWeight: '600',
      fontSize: 24,
      color: THEME.colors.neutral.black,
  },
  ringUnit: {
    fontSize: 12,
    color: THEME.colors.neutral.darkGray,
  },
  sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  sectionTitle: {
      fontSize: 16, 
      fontWeight: '600',
      color: THEME.colors.neutral.black,
  },
  row: {
      flexDirection: 'row',
  },
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  calendarDay: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeDay: {
    backgroundColor: THEME.colors.neutral.black,
    borderColor: THEME.colors.neutral.black,
  },
  dayLabel: {
    fontSize: 12,
    color: THEME.colors.neutral.darkGray,
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.colors.neutral.black,
  },
  activeDayText: {
    color: THEME.colors.neutral.white,
  },
  mealSection: {
      gap: 16,
  },
  mealCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: THEME.colors.neutral.white,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
      justifyContent: 'space-between',
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  mealTitle: {
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 4,
      color: THEME.colors.neutral.black,
  },
  caloriesBadge: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  caloriesText: {
      fontSize: 13,
      color: THEME.colors.neutral.darkGray,
      fontWeight: '500',
  },
  addButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#F5F5F5',
      alignItems: 'center',
      justifyContent: 'center',
  }

});
