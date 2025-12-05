import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import {
  X,
  Camera,
  ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Zap,
  ArrowRight,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTime } from '../hooks/useTime';
import { useMeals } from '../hooks/useMeals';
import { analyzeFood, AnalyzeImageResult } from '../services/geminiAI';
import { Button } from '../components/Button';
import { THEME } from '../constants/theme';
import { FoodAnalysis, MealType, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

const MEAL_CONFIG: Record<MealType, { emoji: string; color: string }> = {
  breakfast: { emoji: '🌅', color: THEME.colors.meal.breakfast },
  lunch: { emoji: '☀️', color: THEME.colors.meal.lunch },
  dinner: { emoji: '🌙', color: THEME.colors.meal.dinner },
  snack: { emoji: '🍪', color: THEME.colors.meal.snack },
};

export const CameraScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { currentMealType } = useTime(profile?.timezone);
  const { addMeal } = useMeals();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(currentMealType);
  const [isSaving, setIsSaving] = useState(false);

  const pickImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission Required',
          `Please allow access to your ${useCamera ? 'camera' : 'photo library'}`
        );
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        })
        : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
          base64: true,
        });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setImageBase64(result.assets[0].base64 || null);
        setAnalysis(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to access camera or gallery');
    }
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    const result: AnalyzeImageResult = await analyzeFood(imageBase64, selectedMealType);
    setIsAnalyzing(false);

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
    } else {
      Alert.alert(
        'Analysis Failed',
        result.error || 'Could not analyze the image. Please try again.'
      );
    }
  };

  const handleSaveMeal = async () => {
    if (!analysis) return;

    setIsSaving(true);

    try {
      const foodName = analysis.foods
        .map((f) => f.name)
        .join(', ')
        .substring(0, 200);

      const { error } = await addMeal(
        foodName,
        analysis.totalCalories,
        selectedMealType,
        undefined,
        analysis
      );

      setIsSaving(false);

      if (error) {
        Alert.alert(
          'Save Failed',
          `Could not save meal: ${error.message || 'Unknown error'}.`
        );
      } else {
        Alert.alert('Meal Logged! 🎉', 'Your meal has been saved successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Main') },
        ]);
      }
    } catch (err: any) {
      setIsSaving(false);
      Alert.alert('Error', `Unexpected error: ${err?.message || 'Unknown'}`);
    }
  };

  const handleReset = () => {
    setImageUri(null);
    setImageBase64(null);
    setAnalysis(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <X size={22} color={THEME.colors.neutral.charcoal} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>📸</Text>
          <Text style={styles.headerTitle}>Log Meal</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Section */}
        {imageUri ? (
          <View style={styles.imageSection}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.changeButton} onPress={handleReset}>
              <Text style={styles.changeButtonText}>📷 Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadSection}>
            {/* Main Illustration with Emojis */}
            <View style={styles.uploadIllustration}>
              <View style={styles.mainEmojiCircle}>
                <Text style={styles.mainEmoji}>🍽️</Text>
              </View>
              <View style={[styles.floatingEmoji, styles.floatingEmoji1]}>
                <Text style={styles.smallEmoji}>🥗</Text>
              </View>
              <View style={[styles.floatingEmoji, styles.floatingEmoji2]}>
                <Text style={styles.smallEmoji}>🍕</Text>
              </View>
              <View style={[styles.floatingEmoji, styles.floatingEmoji3]}>
                <Text style={styles.smallEmoji}>🥑</Text>
              </View>
              <View style={[styles.floatingEmoji, styles.floatingEmoji4]}>
                <Text style={styles.smallEmoji}>🍎</Text>
              </View>
            </View>

            <Text style={styles.uploadTitle}>Capture Your Meal</Text>
            <Text style={styles.uploadSubtitle}>
              Take a photo and let AI do the calorie counting! ✨
            </Text>

            {/* Upload Buttons */}
            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => pickImage(true)}
              >
                <Camera size={24} color={THEME.colors.neutral.white} />
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.galleryButton}
                onPress={() => pickImage(false)}
              >
                <ImageIcon size={22} color={THEME.colors.primary.main} />
                <Text style={styles.galleryButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Meal Type Selector */}
        <View style={styles.mealSection}>
          <Text style={styles.sectionLabel}>What meal is this? 🍴</Text>
          <View style={styles.mealPills}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
              const config = MEAL_CONFIG[type];
              const isSelected = selectedMealType === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealPill,
                    isSelected && { backgroundColor: config.color },
                  ]}
                  onPress={() => setSelectedMealType(type)}
                >
                  <Text style={styles.mealPillEmoji}>{config.emoji}</Text>
                  <Text style={[
                    styles.mealPillText,
                    isSelected && styles.mealPillTextActive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Analyze Button */}
        {imageUri && !analysis && (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
          >
            <View style={styles.analyzeIcon}>
              <Sparkles size={24} color={THEME.colors.neutral.white} />
            </View>
            <View style={styles.analyzeContent}>
              <Text style={styles.analyzeTitle}>
                {isAnalyzing ? 'Analyzing... ✨' : 'Analyze with AI'}
              </Text>
              <Text style={styles.analyzeSubtitle}>
                {isAnalyzing ? 'Magic happening!' : 'Get instant calorie estimates'}
              </Text>
            </View>
            <ArrowRight size={24} color={THEME.colors.neutral.white} />
          </TouchableOpacity>
        )}

        {/* Analysis Results */}
        {analysis && (
          <View style={styles.resultsSection}>
            {/* Success Header */}
            <View style={styles.resultsHeader}>
              <View style={styles.successBadge}>
                <Check size={16} color={THEME.colors.neutral.white} />
              </View>
              <Text style={styles.resultsTitle}>Analysis Complete! 🎉</Text>
              <View style={styles.confidencePill}>
                <Zap size={12} color={THEME.colors.accent.orange} />
                <Text style={styles.confidenceText}>
                  {Math.round(analysis.confidence * 100)}%
                </Text>
              </View>
            </View>

            {/* Calories Hero */}
            <View style={styles.caloriesHero}>
              <Text style={styles.caloriesEmoji}>🔥</Text>
              <View style={styles.caloriesInfo}>
                <Text style={styles.caloriesLabel}>Total Calories</Text>
                <View style={styles.caloriesRow}>
                  <Text style={styles.caloriesValue}>{analysis.totalCalories}</Text>
                  <Text style={styles.caloriesUnit}>kcal</Text>
                </View>
              </View>
            </View>

            {/* Food Items List */}
            <View style={styles.foodsList}>
              <Text style={styles.foodsTitle}>Detected Foods 🔍</Text>
              {analysis.foods.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <View style={styles.foodBullet}>
                    <Text style={styles.foodBulletText}>{index + 1}</Text>
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodPortion}>{food.portion}</Text>
                  </View>
                  <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                </View>
              ))}
            </View>

            {/* Macros */}
            {analysis.foods.some((f) => f.macros) && (
              <View style={styles.macrosSection}>
                <Text style={styles.macrosTitle}>Nutrition Breakdown 📊</Text>
                <View style={styles.macrosRow}>
                  <View style={[styles.macroCard, { backgroundColor: THEME.colors.accent.blue + '12' }]}>
                    <Text style={styles.macroEmoji}>💪</Text>
                    <Text style={[styles.macroValue, { color: THEME.colors.accent.blue }]}>
                      {analysis.foods.reduce((sum, f) => sum + (f.macros?.protein || 0), 0)}g
                    </Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={[styles.macroCard, { backgroundColor: THEME.colors.accent.orange + '12' }]}>
                    <Text style={styles.macroEmoji}>⚡</Text>
                    <Text style={[styles.macroValue, { color: THEME.colors.accent.orange }]}>
                      {analysis.foods.reduce((sum, f) => sum + (f.macros?.carbs || 0), 0)}g
                    </Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={[styles.macroCard, { backgroundColor: THEME.colors.accent.purple + '12' }]}>
                    <Text style={styles.macroEmoji}>🥑</Text>
                    <Text style={[styles.macroValue, { color: THEME.colors.accent.purple }]}>
                      {analysis.foods.reduce((sum, f) => sum + (f.macros?.fat || 0), 0)}g
                    </Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveMeal}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonEmoji}>✅</Text>
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : 'Save to My Log'}
              </Text>
            </TouchableOpacity>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <AlertCircle size={14} color={THEME.colors.neutral.gray} />
              <Text style={styles.disclaimerText}>
                Estimates are approximate and based on AI analysis
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.screenPadding,
    paddingVertical: THEME.spacing.md,
    backgroundColor: THEME.colors.neutral.white,
    ...THEME.shadows.sm,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: THEME.spacing.screenPadding,
    paddingBottom: THEME.spacing['5xl'],
  },
  imageSection: {
    marginBottom: THEME.spacing.xl,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: THEME.layout.borderRadius['2xl'],
  },
  changeButton: {
    alignSelf: 'center',
    marginTop: THEME.spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.full,
    ...THEME.shadows.sm,
  },
  changeButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.charcoal,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  uploadSection: {
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing['2xl'],
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.md,
  },
  uploadIllustration: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.xl,
    position: 'relative',
  },
  mainEmojiCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: THEME.colors.primary.light + '20',
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.sm,
  },
  mainEmoji: {
    fontSize: 44,
  },
  floatingEmoji: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: THEME.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...THEME.shadows.sm,
  },
  floatingEmoji1: {
    top: 0,
    right: 5,
  },
  floatingEmoji2: {
    bottom: 10,
    left: 0,
  },
  floatingEmoji3: {
    top: 25,
    left: 5,
  },
  floatingEmoji4: {
    bottom: 0,
    right: 10,
  },
  smallEmoji: {
    fontSize: 20,
  },
  uploadTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.sm,
  },
  uploadSubtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
    textAlign: 'center',
    marginBottom: THEME.spacing.xl,
  },
  uploadActions: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.primary.main,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.layout.borderRadius.full,
    ...THEME.shadows.glow,
  },
  cameraButtonText: {
    color: THEME.colors.neutral.white,
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.neutral.white,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.layout.borderRadius.full,
    borderWidth: 2,
    borderColor: THEME.colors.primary.main,
  },
  galleryButtonText: {
    color: THEME.colors.primary.main,
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  mealSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionLabel: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.md,
  },
  mealPills: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  mealPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: THEME.colors.neutral.white,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.xl,
    ...THEME.shadows.xs,
  },
  mealPillEmoji: {
    fontSize: 14,
  },
  mealPillText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.charcoal,
  },
  mealPillTextActive: {
    color: THEME.colors.neutral.white,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary.main,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
    ...THEME.shadows.glow,
  },
  analyzeIcon: {
    width: 52,
    height: 52,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeContent: {
    flex: 1,
  },
  analyzeTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.white,
    marginBottom: 2,
  },
  analyzeSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  resultsSection: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
    ...THEME.shadows.md,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.xl,
  },
  successBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsTitle: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.accent.orange + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.layout.borderRadius.full,
  },
  confidenceText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.accent.orange,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  caloriesHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.lg,
    backgroundColor: THEME.colors.accent.orange + '12',
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  caloriesEmoji: {
    fontSize: 40,
  },
  caloriesInfo: {
    flex: 1,
  },
  caloriesLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    marginBottom: 4,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  caloriesValue: {
    fontSize: THEME.typography.fontSizes['3xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  caloriesUnit: {
    fontSize: THEME.typography.fontSizes.lg,
    color: THEME.colors.neutral.darkGray,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  foodsList: {
    marginBottom: THEME.spacing.xl,
  },
  foodsTitle: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.md,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.neutral.lightGray,
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    marginBottom: THEME.spacing.sm,
    gap: THEME.spacing.md,
  },
  foodBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodBulletText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.white,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  foodPortion: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  foodCalories: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.charcoal,
  },
  macrosSection: {
    marginBottom: THEME.spacing.xl,
  },
  macrosTitle: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.md,
  },
  macrosRow: {
    flexDirection: 'row',
    gap: THEME.spacing.sm,
  },
  macroCard: {
    flex: 1,
    alignItems: 'center',
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.xl,
    gap: 4,
  },
  macroEmoji: {
    fontSize: 22,
  },
  macroValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  macroLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.accent.green,
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.layout.borderRadius.xl,
    marginBottom: THEME.spacing.md,
    ...THEME.shadows.md,
  },
  saveButtonEmoji: {
    fontSize: 20,
  },
  saveButtonText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.white,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
  },
  disclaimerText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.gray,
    textAlign: 'center',
  },
});
