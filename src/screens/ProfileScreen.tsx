import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
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
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTime } from '../hooks/useTime';
import { Button } from '../components/Button';
import { THEME } from '../constants/theme';
import { TIMEZONES } from '../constants/timezones';

export const ProfileScreen = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { formattedTime, formattedDate } = useTime(profile?.timezone);
  
  const [isEditing, setIsEditing] = useState(false);
  const [calorieGoal, setCalorieGoal] = useState(
    profile?.daily_calorie_goal?.toString() || '2000'
  );
  const [isLoading, setIsLoading] = useState(false);

  const selectedTimezone = TIMEZONES.find((tz) => tz.value === profile?.timezone);

  const handleSaveGoal = async () => {
    const newGoal = parseInt(calorieGoal, 10);
    if (isNaN(newGoal) || newGoal < 500 || newGoal > 10000) {
      Alert.alert('Invalid Goal', 'Please enter a valid calorie goal between 500 and 10,000');
      return;
    }

    setIsLoading(true);
    const { error } = await updateProfile({ daily_calorie_goal: newGoal });
    setIsLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to update calorie goal');
    } else {
      setIsEditing(false);
      Alert.alert('Success', 'Calorie goal updated successfully');
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

  const getInitials = () => {
    const name = profile?.full_name || profile?.username || user?.email || '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </View>
          
          <Text style={styles.userName}>
            {profile?.full_name || profile?.username || 'User'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          
          {/* Local Time Display */}
          <View style={styles.timeDisplay}>
            <Text style={styles.timeValue}>{formattedTime}</Text>
            <Text style={styles.dateValue}>{formattedDate}</Text>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          {/* Calorie Goal Setting */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: THEME.colors.accent.green + '20' }]}>
                  <Target size={20} color={THEME.colors.accent.green} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Daily Calorie Goal</Text>
                  {isEditing ? (
                    <View style={styles.editInputContainer}>
                      <TextInput
                        style={styles.editInput}
                        value={calorieGoal}
                        onChangeText={setCalorieGoal}
                        keyboardType="numeric"
                        maxLength={5}
                      />
                      <Text style={styles.editUnit}>kcal</Text>
                    </View>
                  ) : (
                    <Text style={styles.settingValue}>
                      {profile?.daily_calorie_goal || 2000} kcal
                    </Text>
                  )}
                </View>
              </View>
              {isEditing ? (
                <View style={styles.editActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setIsEditing(false);
                      setCalorieGoal(profile?.daily_calorie_goal?.toString() || '2000');
                    }}
                    style={styles.cancelButton}
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveGoal}
                    style={styles.saveButton}
                    disabled={isLoading}
                  >
                    <Text style={styles.saveText}>
                      {isLoading ? 'Saving...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setIsEditing(true)}>
                  <Edit3 size={20} color={THEME.colors.neutral.darkGray} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Timezone Setting */}
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: THEME.colors.primary.main + '20' }]}>
                  <Globe size={20} color={THEME.colors.primary.main} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Timezone</Text>
                  <Text style={styles.settingValue}>
                    {selectedTimezone?.label} ({selectedTimezone?.offset})
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={THEME.colors.neutral.gray} />
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: THEME.colors.neutral.lightGray }]}>
                  <User size={20} color={THEME.colors.neutral.charcoal} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Username</Text>
                  <Text style={styles.settingValue}>{profile?.username || 'Not set'}</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: THEME.colors.neutral.lightGray }]}>
                  <Mail size={20} color={THEME.colors.neutral.charcoal} />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Email</Text>
                  <Text style={styles.settingValue}>{user?.email}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.signOutSection}>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            size="lg"
            icon={<LogOut size={18} color={THEME.colors.neutral.black} />}
            style={styles.signOutButton}
          />
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Calories AI v1.0.0</Text>
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
    marginBottom: THEME.spacing.xl,
  },
  title: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    letterSpacing: THEME.typography.letterSpacing.tight,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing['2xl'],
    marginBottom: THEME.spacing['2xl'],
  },
  avatarContainer: {
    marginBottom: THEME.spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.colors.neutral.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: THEME.typography.fontSizes['2xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.white,
  },
  userName: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
    marginBottom: THEME.spacing.lg,
  },
  timeDisplay: {
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.white,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.layout.borderRadius.lg,
  },
  timeValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  dateValue: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  section: {
    marginBottom: THEME.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.darkGray,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: THEME.spacing.md,
  },
  settingCard: {
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.lg,
    marginBottom: THEME.spacing.sm,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: THEME.spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: THEME.layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.medium,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  editInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.xs,
  },
  editInput: {
    backgroundColor: THEME.colors.neutral.white,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: THEME.layout.borderRadius.sm,
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.black,
    minWidth: 60,
    textAlign: 'center',
  },
  editUnit: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  editActions: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  cancelText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  saveButton: {
    backgroundColor: THEME.colors.neutral.black,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.layout.borderRadius.sm,
  },
  saveText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.white,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  signOutSection: {
    marginBottom: THEME.spacing.xl,
  },
  signOutButton: {
    borderColor: THEME.colors.neutral.mediumGray,
  },
  versionText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.gray,
    textAlign: 'center',
  },
});

