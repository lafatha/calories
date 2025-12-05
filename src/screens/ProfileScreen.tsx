import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  FlatList,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Mail,
  Globe,
  Target,
  LogOut,
  ChevronRight,
  Edit3,
  Check,
  X,
  Bell,
  Moon,
  Shield,
  HelpCircle,
  Clock,
  Flame,
  Star,
  Settings,
  Sun,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTime } from '../hooks/useTime';
import { useWeeklyStats } from '../hooks/useMeals';
import { THEME } from '../constants/theme';
import { TIMEZONES } from '../constants/timezones';
import { TimezoneOption } from '../types';

export const ProfileScreen = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { isDark, themeMode, setThemeMode, colors } = useTheme();
  const { formattedTime, formattedDate } = useTime(profile?.timezone);
  const { daysOnTrack } = useWeeklyStats();

  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(
    profile?.daily_calorie_goal?.toString() || '2000'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showTimezonePicker, setShowTimezonePicker] = useState(false);

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === profile?.timezone);

  const handleSaveGoal = async () => {
    const newGoal = parseInt(calorieGoal, 10);
    if (isNaN(newGoal) || newGoal < 500 || newGoal > 10000) {
      Alert.alert('Invalid Goal', 'Please enter a value between 500 and 10,000');
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile({ daily_calorie_goal: newGoal });
    setIsLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to update goal');
    } else {
      setIsEditingGoal(false);
      Alert.alert('Success', 'Daily calorie goal updated!');
    }
  };

  const handleUpdateTimezone = async (timezone: string) => {
    setIsLoading(true);
    const { error } = await updateProfile({ timezone });
    setIsLoading(false);
    setShowTimezonePicker(false);

    if (error) {
      Alert.alert('Error', 'Failed to update timezone');
    } else {
      Alert.alert('Success', 'Timezone updated!');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const toggleDarkMode = () => {
    if (themeMode === 'dark') {
      setThemeMode('light');
    } else {
      setThemeMode('dark');
    }
  };

  const getInitials = () => {
    const name = profile?.full_name || profile?.username || user?.email || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderTimezoneItem = ({ item }: { item: TimezoneOption }) => (
    <TouchableOpacity
      style={[
        styles.timezoneItem,
        { backgroundColor: colors.background.card },
        item.value === profile?.timezone && { backgroundColor: colors.primary.main + '15' },
      ]}
      onPress={() => handleUpdateTimezone(item.value)}
    >
      <Text style={[
        styles.timezoneItemText,
        { color: colors.text.primary },
        item.value === profile?.timezone && { color: colors.primary.main, fontWeight: '600' },
      ]}>
        {item.label} ({item.offset})
      </Text>
      {item.value === profile?.timezone && (
        <View style={[styles.checkBadge, { backgroundColor: colors.primary.main }]}>
          <Check size={16} color={colors.text.inverse} />
        </View>
      )}
    </TouchableOpacity>
  );

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Settings size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Profile Hero Card */}
        <View style={styles.profileCard}>
          {/* Avatar with Ring */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials()}</Text>
              </View>
            </View>
            <View style={styles.levelBadge}>
              <Star size={14} color={colors.accent.orange} fill={colors.accent.orange} />
            </View>
          </View>

          <Text style={styles.userName}>
            {profile?.full_name || profile?.username || 'User'}
          </Text>
          <Text style={styles.userHandle}>@{profile?.username || 'username'}</Text>

          {/* Stats Row */}
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <View style={styles.profileStatIcon}>
                <Flame size={16} color={colors.accent.orange} />
              </View>
              <Text style={styles.profileStatValue}>{daysOnTrack}</Text>
              <Text style={styles.profileStatLabel}>Day Streak</Text>
            </View>
            <View style={styles.profileStatDivider} />
            <View style={styles.profileStat}>
              <View style={styles.profileStatIcon}>
                <Target size={16} color={colors.accent.green} />
              </View>
              <Text style={styles.profileStatValue}>{profile?.daily_calorie_goal || 2000}</Text>
              <Text style={styles.profileStatLabel}>Daily Goal</Text>
            </View>
          </View>

          {/* Time Display */}
          <View style={styles.timeDisplay}>
            <Clock size={20} color={colors.primary.main} />
            <View>
              <Text style={styles.timeValue}>{formattedTime}</Text>
              <Text style={styles.dateValue}>{formattedDate}</Text>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Target size={18} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>Your Goals</Text>
          </View>

          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIcon}>
                <Target size={22} color={colors.accent.green} />
              </View>
              <View style={styles.goalInfo}>
                <Text style={styles.goalLabel}>Daily Calorie Target</Text>
                {isEditingGoal ? (
                  <View style={styles.editRow}>
                    <TextInput
                      style={styles.editInput}
                      value={calorieGoal}
                      onChangeText={setCalorieGoal}
                      keyboardType="numeric"
                      maxLength={5}
                      autoFocus
                    />
                    <Text style={styles.editUnit}>kcal/day</Text>
                  </View>
                ) : (
                  <Text style={styles.goalValue}>
                    {profile?.daily_calorie_goal || 2000} kcal/day
                  </Text>
                )}
              </View>
            </View>

            {isEditingGoal ? (
              <View style={styles.editActions}>
                <TouchableOpacity
                  onPress={() => {
                    setIsEditingGoal(false);
                    setCalorieGoal(profile?.daily_calorie_goal?.toString() || '2000');
                  }}
                  style={styles.actionButton}
                >
                  <X size={20} color={colors.text.secondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSaveGoal}
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  disabled={isLoading}
                >
                  <Check size={20} color={colors.text.inverse} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={() => setIsEditingGoal(true)} style={styles.editButton}>
                <Edit3 size={18} color={colors.primary.main} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings size={18} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>

          <View style={styles.settingsCard}>
            {/* Timezone Setting */}
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => setShowTimezonePicker(true)}
            >
              <View style={[styles.settingIcon, { backgroundColor: colors.accent.purple + '15' }]}>
                <Globe size={20} color={colors.accent.purple} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Timezone</Text>
                <Text style={styles.settingValue} numberOfLines={1}>
                  {selectedTimezone?.label || 'Select timezone'}
                </Text>
              </View>
              <ChevronRight size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            {/* Dark Mode Toggle */}
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent.blue + '15' }]}>
                {isDark ? (
                  <Moon size={20} color={colors.accent.blue} />
                ) : (
                  <Sun size={20} color={colors.accent.orange} />
                )}
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingValue}>{isDark ? 'On' : 'Off'}</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border.medium, true: colors.primary.main }}
                thumbColor={colors.background.card}
              />
            </View>

            <TouchableOpacity style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent.orange + '15' }]}>
                <Bell size={20} color={colors.accent.orange} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingValue}>Enabled</Text>
              </View>
              <ChevronRight size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={18} color={colors.primary.main} />
            <Text style={styles.sectionTitle}>Account</Text>
          </View>

          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.neutral.lightGray }]}>
                <Mail size={20} color={colors.text.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Email</Text>
                <Text style={styles.settingValue}>{user?.email}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.neutral.lightGray }]}>
                <Shield size={20} color={colors.text.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Privacy & Security</Text>
              </View>
              <ChevronRight size={20} color={colors.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.neutral.lightGray }]}>
                <HelpCircle size={20} color={colors.text.primary} />
              </View>
              <View style={styles.settingContent}>
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <ChevronRight size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <LogOut size={20} color={colors.secondary.main} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={styles.versionText}>Calories AI v1.0.0</Text>
      </ScrollView>

      {/* Timezone Picker Modal */}
      <Modal
        visible={showTimezonePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTimezonePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background.primary }]}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Globe size={24} color={colors.primary.main} />
              <Text style={styles.modalTitle}>Select Timezone</Text>
              <TouchableOpacity
                onPress={() => setShowTimezonePicker(false)}
                style={styles.modalDoneButton}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={TIMEZONES}
              renderItem={renderTimezoneItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={[styles.separator, { backgroundColor: colors.border.light }]} />}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
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
  avatarSection: {
    position: 'relative',
    marginBottom: THEME.spacing.lg,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 4,
    borderWidth: 3,
    borderColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 46,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.inverse,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.secondary,
  },
  userName: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  userHandle: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
    marginBottom: THEME.spacing.lg,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.lg,
  },
  profileStat: {
    alignItems: 'center',
    paddingHorizontal: THEME.spacing.xl,
  },
  profileStatIcon: {
    marginBottom: 4,
  },
  profileStatValue: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  profileStatLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  profileStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    backgroundColor: colors.background.tertiary,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.layout.borderRadius.xl,
  },
  timeValue: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  dateValue: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: THEME.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  goalCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // Shadow for light mode, border for dark mode
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
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    flex: 1,
  },
  goalIcon: {
    width: 48,
    height: 48,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: colors.accent.green + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  goalValue: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.accent.green,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editInput: {
    backgroundColor: colors.background.tertiary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.layout.borderRadius.md,
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
    minWidth: 70,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  editUnit: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: colors.primary.main + '15',
    borderRadius: THEME.layout.borderRadius.full,
  },
  editButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  editActions: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPrimary: {
    backgroundColor: colors.accent.green,
  },
  settingsCard: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.xl,
    overflow: 'hidden',
    // Shadow for light mode, border for dark mode
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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: THEME.layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    paddingVertical: THEME.spacing.lg,
    backgroundColor: colors.secondary.main + '10',
    borderRadius: THEME.layout.borderRadius.xl,
    marginBottom: THEME.spacing.lg,
    borderWidth: 1,
    borderColor: colors.secondary.main + '25',
  },
  signOutText: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.secondary.main,
  },
  versionText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: THEME.layout.borderRadius['3xl'],
    borderTopRightRadius: THEME.layout.borderRadius['3xl'],
    maxHeight: '75%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: THEME.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: THEME.spacing.sm,
  },
  modalTitle: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  modalDoneButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: colors.primary.main + '20',
    borderRadius: THEME.layout.borderRadius.full,
  },
  modalDoneText: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.primary.main,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  separator: {
    height: 1,
  },
  timezoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: THEME.spacing.lg,
    paddingHorizontal: THEME.spacing.xl,
  },
  timezoneItemText: {
    fontSize: THEME.typography.fontSizes.base,
    flex: 1,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
