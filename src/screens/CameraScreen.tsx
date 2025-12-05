import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { 
  X, 
  Camera, 
  ImageIcon, 
  Sparkles,
  Check,
  AlertCircle,
  Utensils,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTime } from '../hooks/useTime';
import { useMeals } from '../hooks/useMeals';
import { analyzeFood, AnalyzeImageResult } from '../services/geminiAI';
import { Button } from '../components/Button';
import { THEME } from '../constants/theme';
import { FoodAnalysis, MealType } from '../types';

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: THEME.colors.meal.breakfast,
  lunch: THEME.colors.meal.lunch,
  dinner: THEME.colors.meal.dinner,
  snack: THEME.colors.meal.snack,
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

export const CameraScreen = () => {
  const navigation = useNavigation();
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
      // Create a combined food name from all detected items (limit length)
      const foodName = analysis.foods
        .map((f) => f.name)
        .join(', ')
        .substring(0, 200); // Limit to 200 chars
      
      console.log('Attempting to save meal:', {
        foodName,
        calories: analysis.totalCalories,
        mealType: selectedMealType,
        foodCount: analysis.foods.length,
      });

      const { error } = await addMeal(
        foodName,
        analysis.totalCalories,
        selectedMealType,
        undefined, // Don't pass imageUri - it's a local file path
        analysis
      );

      setIsSaving(false);

      if (error) {
        console.error('Save meal error:', error);
        Alert.alert(
          'Save Failed', 
          `Could not save meal: ${error.message || 'Unknown error'}. Please check your connection and try again.`
        );
      } else {
        Alert.alert('Meal Logged', 'Your meal has been saved successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      setIsSaving(false);
      console.error('Unexpected error saving meal:', err);
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
          <X size={24} color={THEME.colors.neutral.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Food</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Preview or Upload Area */}
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.changeImageButton} onPress={handleReset}>
              <Text style={styles.changeImageText}>Change Photo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            <View style={styles.uploadIconContainer}>
              <Utensils size={48} color={THEME.colors.neutral.gray} />
            </View>
            <Text style={styles.uploadTitle}>Capture Your Meal</Text>
            <Text style={styles.uploadSubtitle}>
              Take a photo or choose from your gallery
            </Text>
            
            <View style={styles.uploadButtons}>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => pickImage(true)}
              >
                <Camera size={24} color={THEME.colors.neutral.white} />
                <Text style={styles.uploadButtonText}>Camera</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.uploadButton, styles.uploadButtonSecondary]}
                onPress={() => pickImage(false)}
              >
                <ImageIcon size={24} color={THEME.colors.neutral.black} />
                <Text style={styles.uploadButtonTextSecondary}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Meal Type Selector */}
        <View style={styles.mealTypeSection}>
          <Text style={styles.sectionTitle}>Meal Type</Text>
          <View style={styles.mealTypeGrid}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type && {
                    backgroundColor: MEAL_COLORS[type],
                    borderColor: MEAL_COLORS[type],
                  },
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text
                  style={[
                    styles.mealTypeText,
                    selectedMealType === type && styles.mealTypeTextActive,
                  ]}
                >
                  {MEAL_LABELS[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analyze Button */}
        {imageUri && !analysis && (
          <Button
            title="Analyze with AI"
            onPress={handleAnalyze}
            loading={isAnalyzing}
            size="lg"
            icon={<Sparkles size={20} color={THEME.colors.neutral.white} />}
            style={styles.analyzeButton}
          />
        )}

        {/* Analysis Results */}
        {analysis && (
          <View style={styles.resultsSection}>
            <View style={styles.resultsHeader}>
              <View style={styles.resultsTitleRow}>
                <Check size={20} color={THEME.colors.accent.green} />
                <Text style={styles.resultsTitle}>Analysis Complete</Text>
              </View>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>
                  {Math.round(analysis.confidence * 100)}% confidence
                </Text>
              </View>
            </View>

            {/* Total Calories */}
            <View style={styles.totalCaloriesCard}>
              <Text style={styles.totalCaloriesLabel}>Total Calories</Text>
              <Text style={styles.totalCaloriesValue}>
                {analysis.totalCalories}
                <Text style={styles.totalCaloriesUnit}> kcal</Text>
              </Text>
            </View>

            {/* Food Items */}
            <View style={styles.foodItemsSection}>
              <Text style={styles.foodItemsTitle}>Detected Foods</Text>
              {analysis.foods.map((food, index) => (
                <View key={index} style={styles.foodItem}>
                  <View style={styles.foodItemInfo}>
                    <Text style={styles.foodItemName}>{food.name}</Text>
                    <Text style={styles.foodItemPortion}>{food.portion}</Text>
                  </View>
                  <Text style={styles.foodItemCalories}>{food.calories} kcal</Text>
                </View>
              ))}
            </View>

            {/* Macros (if available) */}
            {analysis.foods.some((f) => f.macros) && (
              <View style={styles.macrosSection}>
                <Text style={styles.macrosTitle}>Estimated Macros</Text>
                <View style={styles.macrosGrid}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                      {analysis.foods.reduce((sum, f) => sum + (f.macros?.protein || 0), 0)}g
                    </Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                      {analysis.foods.reduce((sum, f) => sum + (f.macros?.carbs || 0), 0)}g
                    </Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                  </View>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>
                      {analysis.foods.reduce((sum, f) => sum + (f.macros?.fat || 0), 0)}g
                    </Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Save Button */}
            <Button
              title="Save to Log"
              onPress={handleSaveMeal}
              loading={isSaving}
              size="lg"
              style={styles.saveButton}
            />

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <AlertCircle size={14} color={THEME.colors.neutral.darkGray} />
              <Text style={styles.disclaimerText}>
                Calorie estimates are approximate and based on AI analysis
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
    backgroundColor: THEME.colors.neutral.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.screenPadding,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.neutral.lightGray,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: THEME.layout.borderRadius.full,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: THEME.spacing.screenPadding,
    paddingBottom: THEME.spacing['5xl'],
  },
  imageContainer: {
    marginBottom: THEME.spacing.xl,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: THEME.layout.borderRadius.xl,
    backgroundColor: THEME.colors.neutral.lightGray,
  },
  changeImageButton: {
    alignSelf: 'center',
    marginTop: THEME.spacing.md,
  },
  changeImageText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.primary.main,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  uploadArea: {
    alignItems: 'center',
    paddingVertical: THEME.spacing['3xl'],
    paddingHorizontal: THEME.spacing.xl,
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    marginBottom: THEME.spacing.xl,
  },
  uploadIconContainer: {
    width: 100,
    height: 100,
    borderRadius: THEME.layout.borderRadius.xl,
    backgroundColor: THEME.colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.sm,
  },
  uploadTitle: {
    fontSize: THEME.typography.fontSizes.xl,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.sm,
  },
  uploadSubtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: THEME.colors.neutral.darkGray,
    marginBottom: THEME.spacing.xl,
    textAlign: 'center',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: THEME.colors.neutral.black,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.layout.borderRadius.lg,
  },
  uploadButtonSecondary: {
    backgroundColor: THEME.colors.neutral.white,
    borderWidth: 1.5,
    borderColor: THEME.colors.neutral.mediumGray,
  },
  uploadButtonText: {
    color: THEME.colors.neutral.white,
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  uploadButtonTextSecondary: {
    color: THEME.colors.neutral.black,
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  mealTypeSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
    marginBottom: THEME.spacing.md,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: THEME.spacing.sm,
  },
  mealTypeButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.lg,
    borderRadius: THEME.layout.borderRadius.md,
    backgroundColor: THEME.colors.neutral.lightGray,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeText: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.medium,
    color: THEME.colors.neutral.charcoal,
  },
  mealTypeTextActive: {
    color: THEME.colors.neutral.white,
  },
  analyzeButton: {
    marginBottom: THEME.spacing.xl,
  },
  resultsSection: {
    backgroundColor: THEME.colors.neutral.lightGray,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.xl,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.xl,
  },
  resultsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
  },
  resultsTitle: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.black,
  },
  confidenceBadge: {
    backgroundColor: THEME.colors.neutral.white,
    paddingVertical: 4,
    paddingHorizontal: THEME.spacing.sm,
    borderRadius: THEME.layout.borderRadius.sm,
  },
  confidenceText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  totalCaloriesCard: {
    backgroundColor: THEME.colors.neutral.white,
    borderRadius: THEME.layout.borderRadius.lg,
    padding: THEME.spacing.xl,
    alignItems: 'center',
    marginBottom: THEME.spacing.xl,
    ...THEME.shadows.sm,
  },
  totalCaloriesLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
    marginBottom: THEME.spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalCaloriesValue: {
    fontSize: THEME.typography.fontSizes['4xl'],
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
  },
  totalCaloriesUnit: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.regular,
    color: THEME.colors.neutral.darkGray,
  },
  foodItemsSection: {
    marginBottom: THEME.spacing.xl,
  },
  foodItemsTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.charcoal,
    marginBottom: THEME.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.neutral.white,
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.md,
    marginBottom: THEME.spacing.sm,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.medium,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  foodItemPortion: {
    fontSize: THEME.typography.fontSizes.sm,
    color: THEME.colors.neutral.darkGray,
  },
  foodItemCalories: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.charcoal,
  },
  macrosSection: {
    marginBottom: THEME.spacing.xl,
  },
  macrosTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: THEME.colors.neutral.charcoal,
    marginBottom: THEME.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  macrosGrid: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  macroItem: {
    flex: 1,
    backgroundColor: THEME.colors.neutral.white,
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.md,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: THEME.colors.neutral.black,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    textTransform: 'uppercase',
  },
  saveButton: {
    marginBottom: THEME.spacing.md,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
  },
  disclaimerText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: THEME.colors.neutral.darkGray,
    textAlign: 'center',
  },
});

