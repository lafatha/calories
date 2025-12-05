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
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  X,
  Camera,
  ImageIcon,
  Sparkles,
  Check,
  AlertCircle,
  Zap,
  ArrowRight,
  Coffee,
  Sun,
  Moon,
  Cookie,
  UtensilsCrossed,
  Flame,
  Search,
  Beef,
  Wheat,
  Droplets,
  PieChart,
  Edit3,
  Trash2,
  Plus,
  RefreshCw,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTime } from '../hooks/useTime';
import { useMealEditor } from '../hooks/useMealEditor';
import { THEME } from '../constants/theme';
import { MealType, RootStackParamList } from '../types';
import { EditableIngredient, IngredientUnit, UNIT_OPTIONS, validateIngredient } from '../types/mealEditor';

const { width } = Dimensions.get('window');

export const CameraScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { profile } = useAuth();
  const { colors, isDark } = useTheme();
  const { currentMealType } = useTime(profile?.timezone);

  // Use the new meal editor hook
  const {
    state,
    pickImage,
    clearImage,
    updateIngredient,
    deleteIngredient,
    addIngredient,
    runInitialAnalysis,
    runFinalAnalysis,
    saveMeal,
    canSave,
    setMealType,
  } = useMealEditor(currentMealType);

  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<EditableIngredient | null>(null);
  const [unitPickerVisible, setUnitPickerVisible] = useState(false);

  // New ingredient form state
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState('1');
  const [newUnit, setNewUnit] = useState<IngredientUnit>('serving');
  const [newWeight, setNewWeight] = useState('100');

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editQuantity, setEditQuantity] = useState('');
  const [editUnit, setEditUnit] = useState<IngredientUnit>('serving');
  const [editWeight, setEditWeight] = useState('');

  const MEAL_CONFIG: Record<MealType, { icon: any; color: string }> = {
    breakfast: { icon: Coffee, color: colors.meal.breakfast },
    lunch: { icon: Sun, color: colors.meal.lunch },
    dinner: { icon: Moon, color: colors.meal.dinner },
    snack: { icon: Cookie, color: colors.meal.snack },
  };

  const openEditModal = (ingredient: EditableIngredient) => {
    setEditingIngredient(ingredient);
    setEditName(ingredient.name);
    setEditQuantity(ingredient.quantity.toString());
    setEditUnit(ingredient.unit);
    setEditWeight(ingredient.weightGrams.toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editingIngredient) return;

    const validation = validateIngredient({
      name: editName,
      quantity: parseFloat(editQuantity),
      unit: editUnit,
      weightGrams: parseFloat(editWeight),
    });

    if (!validation.isValid) {
      Alert.alert('Invalid Input', validation.errors.join('\n'));
      return;
    }

    updateIngredient(editingIngredient.id, {
      name: editName,
      quantity: parseFloat(editQuantity),
      unit: editUnit,
      weightGrams: parseFloat(editWeight),
    });

    setEditModalVisible(false);
    setEditingIngredient(null);
  };

  const handleDeleteIngredient = () => {
    if (!editingIngredient) return;

    Alert.alert(
      'Delete Ingredient',
      `Remove "${editingIngredient.name}" from the list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteIngredient(editingIngredient.id);
            setEditModalVisible(false);
            setEditingIngredient(null);
          },
        },
      ]
    );
  };

  const openAddModal = () => {
    setNewName('');
    setNewQuantity('1');
    setNewUnit('serving');
    setNewWeight('100');
    setAddModalVisible(true);
  };

  const handleAddIngredient = () => {
    const validation = validateIngredient({
      name: newName,
      quantity: parseFloat(newQuantity),
      unit: newUnit,
      weightGrams: parseFloat(newWeight),
    });

    if (!validation.isValid) {
      Alert.alert('Invalid Input', validation.errors.join('\n'));
      return;
    }

    addIngredient({
      name: newName,
      quantity: parseFloat(newQuantity),
      unit: newUnit,
      weightGrams: parseFloat(newWeight),
    });

    setAddModalVisible(false);
  };

  const handleSaveMeal = async () => {
    try {
      console.log('[CameraScreen] Starting save...');
      const result = await saveMeal();
      console.log('[CameraScreen] Save result:', result);
      
      if (result.success) {
        Alert.alert('Meal Logged!', 'Your meal has been saved successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('Main') },
        ]);
      } else if (result.error) {
        Alert.alert('Save Failed', result.error, [
          { text: 'OK', onPress: () => {
            // Reset state on error so user can try again
            if (state.analysisState === 'saving' || state.analysisState === 'error') {
              // State will be reset by useMealEditor, but we can navigate back
            }
          }},
        ]);
      }
    } catch (error) {
      console.error('[CameraScreen] Save meal exception:', error);
      Alert.alert('Error', 'Failed to save meal. Please try again.', [
        { text: 'OK' }
      ]);
    }
  };

  const styles = createStyles(colors, isDark);
  const isAnalyzing = state.analysisState === 'analyzing_initial';
  const isRecalculating = state.analysisState === 'recalculating';
  const isSaving = state.analysisState === 'saving';
  const isDirty = state.analysisState === 'edited_dirty';
  const hasResults = state.ingredients.length > 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <X size={22} color={colors.text.primary} />
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
        {state.imageUri ? (
          <View style={styles.imageSection}>
            <Image source={{ uri: state.imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.changeButton} onPress={clearImage}>
              <Camera size={16} color={colors.text.primary} />
              <Text style={styles.changeButtonText}>Change Photo</Text>
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
              Take a photo and let AI do the calorie counting!
            </Text>

            {/* Upload Buttons */}
            <View style={styles.uploadActions}>
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={() => pickImage(true)}
              >
                <Camera size={24} color={colors.text.inverse} />
                <Text style={styles.cameraButtonText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.galleryButton}
                onPress={() => pickImage(false)}
              >
                <ImageIcon size={22} color={colors.primary.main} />
                <Text style={styles.galleryButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Meal Type Selector */}
        <View style={styles.mealSection}>
          <View style={styles.sectionLabelRow}>
            <UtensilsCrossed size={18} color={colors.text.primary} />
            <Text style={styles.sectionLabel}>What meal is this?</Text>
          </View>
          <View style={styles.mealPills}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => {
              const config = MEAL_CONFIG[type];
              const Icon = config.icon;
              const isSelected = state.mealType === type;

              return (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.mealPill,
                    isSelected && { backgroundColor: config.color },
                  ]}
                  onPress={() => setMealType(type)}
                >
                  <Icon size={18} color={isSelected ? colors.text.inverse : config.color} />
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
        {state.imageUri && !hasResults && (
          <TouchableOpacity
            style={styles.analyzeButton}
            onPress={runInitialAnalysis}
            disabled={isAnalyzing}
          >
            <View style={styles.analyzeIcon}>
              {isAnalyzing ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Sparkles size={24} color={colors.text.inverse} />
              )}
            </View>
            <View style={styles.analyzeContent}>
              <Text style={styles.analyzeTitle}>
                {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
              </Text>
              <Text style={styles.analyzeSubtitle}>
                {isAnalyzing ? 'Processing your meal' : 'Get instant calorie estimates'}
              </Text>
            </View>
            <ArrowRight size={24} color={colors.text.inverse} />
          </TouchableOpacity>
        )}

        {/* Error State */}
        {state.analysisState === 'error' && state.error && (
          <View style={styles.errorBanner}>
            <AlertCircle size={20} color={colors.semantic.error} />
            <Text style={styles.errorText}>{state.error}</Text>
            <TouchableOpacity onPress={runInitialAnalysis}>
              <RefreshCw size={20} color={colors.semantic.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Dirty State Warning */}
        {isDirty && (
          <View style={styles.warningBanner}>
            <AlertTriangle size={20} color={colors.accent.orange} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Ingredients Modified</Text>
              <Text style={styles.warningText}>
                Tap "Analyze Final" to recalculate nutrition values
              </Text>
            </View>
          </View>
        )}

        {/* Analysis Results */}
        {hasResults && (
          <View style={styles.resultsSection}>
            {/* Success Header */}
            <View style={styles.resultsHeader}>
              <View style={styles.successBadge}>
                <Check size={16} color={colors.text.inverse} />
              </View>
              <Text style={styles.resultsTitle}>
                {state.analysisState === 'recalculated_clean' ? 'Recalculated!' : 'Analysis Complete!'}
              </Text>
              <View style={styles.confidencePill}>
                <Zap size={12} color={colors.accent.orange} />
                <Text style={styles.confidenceText}>
                  {Math.round(state.confidence * 100)}%
                </Text>
              </View>
            </View>

            {/* Calories Hero */}
            <View style={[styles.caloriesHero, isDirty && styles.caloriesHeroDirty]}>
              <View style={styles.caloriesIconContainer}>
                <Flame size={28} color={colors.accent.orange} fill={colors.accent.orange} />
              </View>
              <View style={styles.caloriesInfo}>
                <Text style={styles.caloriesLabel}>
                  Total Calories {isDirty && '(outdated)'}
                </Text>
                <View style={styles.caloriesRow}>
                  <Text style={[styles.caloriesValue, isDirty && styles.caloriesValueDirty]}>
                    {Math.round(state.totals.calories)}
                  </Text>
                  <Text style={styles.caloriesUnit}>kcal</Text>
                </View>
              </View>
            </View>

            {/* Ingredients List */}
            <View style={styles.foodsList}>
              <View style={styles.foodsTitleRow}>
                <Search size={16} color={colors.text.primary} />
                <Text style={styles.foodsTitle}>Ingredients</Text>
                <Text style={styles.foodsCount}>{state.ingredients.length} items</Text>
              </View>
              {state.ingredients.map((ingredient, index) => (
                <TouchableOpacity
                  key={ingredient.id}
                  style={[
                    styles.foodItem,
                    ingredient.isEdited && styles.foodItemEdited,
                    ingredient.isManuallyAdded && styles.foodItemManual,
                  ]}
                  onPress={() => openEditModal(ingredient)}
                >
                  <View style={styles.foodBullet}>
                    <Text style={styles.foodBulletText}>{index + 1}</Text>
                  </View>
                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName}>{ingredient.name}</Text>
                    <Text style={styles.foodPortion}>
                      {ingredient.quantity} {ingredient.unit} · {ingredient.weightGrams}g
                    </Text>
                  </View>
                  <View style={styles.foodRight}>
                    <Text style={[styles.foodCalories, isDirty && styles.foodCaloriesDirty]}>
                      {ingredient.calories} kcal
                    </Text>
                    <Edit3 size={14} color={colors.text.secondary} />
                  </View>
                </TouchableOpacity>
              ))}

              {/* Add Ingredient Button */}
              <TouchableOpacity style={styles.addIngredientButton} onPress={openAddModal}>
                <Plus size={20} color={colors.primary.main} />
                <Text style={styles.addIngredientText}>Add Ingredient</Text>
              </TouchableOpacity>
            </View>

            {/* Macros */}
            <View style={styles.macrosSection}>
              <View style={styles.macrosTitleRow}>
                <PieChart size={16} color={colors.text.primary} />
                <Text style={styles.macrosTitle}>Nutrition Breakdown</Text>
              </View>
              <View style={styles.macrosRow}>
                <View style={[styles.macroCard, { backgroundColor: colors.accent.blue + '12' }]}>
                  <Beef size={22} color={colors.accent.blue} />
                  <Text style={[styles.macroValue, { color: colors.accent.blue }]}>
                    {Math.round(state.totals.protein)}g
                  </Text>
                  <Text style={styles.macroLabel}>Protein</Text>
                </View>
                <View style={[styles.macroCard, { backgroundColor: colors.accent.orange + '12' }]}>
                  <Wheat size={22} color={colors.accent.orange} />
                  <Text style={[styles.macroValue, { color: colors.accent.orange }]}>
                    {Math.round(state.totals.carbs)}g
                  </Text>
                  <Text style={styles.macroLabel}>Carbs</Text>
                </View>
                <View style={[styles.macroCard, { backgroundColor: colors.accent.purple + '12' }]}>
                  <Droplets size={22} color={colors.accent.purple} />
                  <Text style={[styles.macroValue, { color: colors.accent.purple }]}>
                    {Math.round(state.totals.fat)}g
                  </Text>
                  <Text style={styles.macroLabel}>Fat</Text>
                </View>
              </View>
            </View>

            {/* Analyze Final Button (only when dirty) */}
            {isDirty && (
              <TouchableOpacity
                style={styles.analyzeFinalButton}
                onPress={runFinalAnalysis}
                disabled={isRecalculating}
              >
                {isRecalculating ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <RefreshCw size={20} color={colors.text.inverse} />
                )}
                <Text style={styles.analyzeFinalText}>
                  {isRecalculating ? 'Recalculating...' : 'Analyze Final'}
                </Text>
              </TouchableOpacity>
            )}

            {/* Save Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!canSave || isDirty) && styles.saveButtonDisabled,
              ]}
              onPress={handleSaveMeal}
              disabled={!canSave || isSaving || isDirty}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Check size={20} color={colors.text.inverse} />
              )}
              <Text style={styles.saveButtonText}>
                {isSaving ? 'Saving...' : isDirty ? 'Analyze First' : 'Save to My Log'}
              </Text>
            </TouchableOpacity>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <AlertCircle size={14} color={colors.text.tertiary} />
              <Text style={styles.disclaimerText}>
                Estimates are approximate and based on AI analysis
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Edit Ingredient Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setEditModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Ingredient</Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setEditModalVisible(false);
              }}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Ingredient name"
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="next"
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Quantity</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editQuantity}
                    onChangeText={setEditQuantity}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={colors.text.tertiary}
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <TouchableOpacity
                    style={styles.unitPicker}
                    onPress={() => {
                      Keyboard.dismiss();
                      setUnitPickerVisible(!unitPickerVisible);
                    }}
                  >
                    <Text style={styles.unitPickerText}>{editUnit}</Text>
                    <ChevronDown size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                  {unitPickerVisible && (
                    <ScrollView style={styles.unitDropdown} nestedScrollEnabled>
                      {UNIT_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={styles.unitOption}
                          onPress={() => {
                            setEditUnit(option.value);
                            setUnitPickerVisible(false);
                          }}
                        >
                          <Text style={styles.unitOptionText}>{option.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              <Text style={styles.inputLabel}>Weight (grams)</Text>
              <TextInput
                style={styles.textInput}
                value={editWeight}
                onChangeText={setEditWeight}
                keyboardType="decimal-pad"
                placeholder="100"
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDeleteIngredient}
              >
                <Trash2 size={18} color={colors.semantic.error} />
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveEditButton}
                onPress={() => {
                  Keyboard.dismiss();
                  handleSaveEdit();
                }}
              >
                <Check size={18} color={colors.text.inverse} />
                <Text style={styles.saveEditButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Ingredient Modal */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          Keyboard.dismiss();
          setAddModalVisible(false);
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalBackdrop} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Ingredient</Text>
              <TouchableOpacity onPress={() => {
                Keyboard.dismiss();
                setAddModalVisible(false);
              }}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalBody}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.textInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g., Steamed Broccoli"
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="next"
              />

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Quantity *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newQuantity}
                    onChangeText={setNewQuantity}
                    keyboardType="decimal-pad"
                    placeholder="1"
                    placeholderTextColor={colors.text.tertiary}
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.inputLabel}>Unit *</Text>
                  <TouchableOpacity
                    style={styles.unitPicker}
                    onPress={() => {
                      Keyboard.dismiss();
                      setUnitPickerVisible(!unitPickerVisible);
                    }}
                  >
                    <Text style={styles.unitPickerText}>{newUnit}</Text>
                    <ChevronDown size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                  {unitPickerVisible && (
                    <ScrollView style={styles.unitDropdown} nestedScrollEnabled>
                      {UNIT_OPTIONS.map((option) => (
                        <TouchableOpacity
                          key={option.value}
                          style={styles.unitOption}
                          onPress={() => {
                            setNewUnit(option.value);
                            setUnitPickerVisible(false);
                          }}
                        >
                          <Text style={styles.unitOptionText}>{option.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>

              <Text style={styles.inputLabel}>Weight (grams) *</Text>
              <TextInput
                style={styles.textInput}
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                placeholder="100"
                placeholderTextColor={colors.text.tertiary}
                returnKeyType="done"
                onSubmitEditing={Keyboard.dismiss}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setAddModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  Keyboard.dismiss();
                  handleAddIngredient();
                }}
              >
                <Plus size={18} color={colors.text.inverse} />
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.screenPadding,
    paddingVertical: THEME.spacing.md,
    backgroundColor: colors.background.card,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
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
    color: colors.text.primary,
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: THEME.spacing.screenPadding,
    paddingBottom: THEME.spacing['3xl'],
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
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: THEME.spacing.md,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.full,
  },
  changeButtonText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.primary,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  uploadSection: {
    alignItems: 'center',
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing['2xl'],
    marginBottom: THEME.spacing.xl,
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
    backgroundColor: colors.primary.main + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainEmoji: {
    fontSize: 44,
  },
  floatingEmoji: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  uploadSubtitle: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.secondary,
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
    backgroundColor: colors.primary.main,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.layout.borderRadius.full,
  },
  cameraButtonText: {
    color: colors.text.inverse,
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  galleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: colors.background.card,
    paddingVertical: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.xl,
    borderRadius: THEME.layout.borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary.main,
  },
  galleryButtonText: {
    color: colors.primary.main,
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
  },
  mealSection: {
    marginBottom: THEME.spacing.xl,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  sectionLabel: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
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
    gap: 6,
    backgroundColor: colors.background.card,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.xl,
  },
  mealPillText: {
    fontSize: THEME.typography.fontSizes.xs,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  mealPillTextActive: {
    color: colors.text.inverse,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.main,
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
    gap: THEME.spacing.md,
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
    color: colors.text.inverse,
    marginBottom: 2,
  },
  analyzeSubtitle: {
    fontSize: THEME.typography.fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    backgroundColor: colors.semantic.error + '15',
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    marginBottom: THEME.spacing.md,
  },
  errorText: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.semantic.error,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
    backgroundColor: colors.accent.orange + '15',
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    marginBottom: THEME.spacing.md,
    borderWidth: 1,
    borderColor: colors.accent.orange + '30',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.accent.orange,
    marginBottom: 2,
  },
  warningText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.accent.orange,
  },
  resultsSection: {
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius['2xl'],
    padding: THEME.spacing.xl,
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
    backgroundColor: colors.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsTitle: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent.orange + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: THEME.layout.borderRadius.full,
  },
  confidenceText: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.accent.orange,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  caloriesHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.lg,
    backgroundColor: colors.accent.orange + '12',
    borderRadius: THEME.layout.borderRadius.xl,
    padding: THEME.spacing.lg,
    marginBottom: THEME.spacing.xl,
  },
  caloriesHeroDirty: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: colors.accent.orange + '50',
    borderStyle: 'dashed',
  },
  caloriesIconContainer: {
    width: 56,
    height: 56,
    borderRadius: THEME.layout.borderRadius.xl,
    backgroundColor: colors.background.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesInfo: {
    flex: 1,
  },
  caloriesLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
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
    color: colors.text.primary,
  },
  caloriesValueDirty: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  caloriesUnit: {
    fontSize: THEME.typography.fontSizes.lg,
    color: colors.text.secondary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  foodsList: {
    marginBottom: THEME.spacing.xl,
  },
  foodsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  foodsTitle: {
    flex: 1,
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  foodsCount: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    marginBottom: THEME.spacing.sm,
    gap: THEME.spacing.md,
  },
  foodItemEdited: {
    borderWidth: 1,
    borderColor: colors.accent.orange + '50',
  },
  foodItemManual: {
    borderWidth: 1,
    borderColor: colors.accent.green + '50',
    backgroundColor: colors.accent.green + '08',
  },
  foodBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodBulletText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.inverse,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  foodPortion: {
    fontSize: THEME.typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  foodRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  foodCalories: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  foodCaloriesDirty: {
    color: colors.text.tertiary,
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    padding: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary.main + '40',
    marginTop: THEME.spacing.sm,
  },
  addIngredientText: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.primary.main,
  },
  macrosSection: {
    marginBottom: THEME.spacing.xl,
  },
  macrosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.sm,
    marginBottom: THEME.spacing.md,
  },
  macrosTitle: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
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
  macroValue: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
  },
  macroLabel: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.secondary,
    fontWeight: THEME.typography.fontWeights.medium,
  },
  analyzeFinalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: colors.accent.orange,
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.layout.borderRadius.xl,
    marginBottom: THEME.spacing.md,
  },
  analyzeFinalText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.inverse,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    backgroundColor: colors.accent.green,
    paddingVertical: THEME.spacing.lg,
    borderRadius: THEME.layout.borderRadius.xl,
    marginBottom: THEME.spacing.md,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: THEME.typography.fontSizes.md,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.inverse,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
  },
  disclaimerText: {
    fontSize: THEME.typography.fontSizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: THEME.layout.borderRadius['2xl'],
    borderTopRightRadius: THEME.layout.borderRadius['2xl'],
    paddingBottom: Platform.OS === 'ios' ? THEME.spacing['3xl'] : THEME.spacing.xl,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: THEME.spacing.sm,
    marginBottom: THEME.spacing.xs,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: THEME.spacing.lg,
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: THEME.typography.fontSizes.lg,
    fontWeight: THEME.typography.fontWeights.bold,
    color: colors.text.primary,
  },
  modalBody: {
    paddingHorizontal: THEME.spacing.lg,
    paddingTop: THEME.spacing.md,
    paddingBottom: THEME.spacing.sm,
    maxHeight: 300,
  },
  inputLabel: {
    fontSize: THEME.typography.fontSizes.sm,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.secondary,
    marginBottom: THEME.spacing.xs,
  },
  textInput: {
    backgroundColor: colors.background.tertiary,
    borderRadius: THEME.layout.borderRadius.lg,
    padding: THEME.spacing.md,
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.primary,
    marginBottom: THEME.spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: THEME.spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  unitPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.tertiary,
    borderRadius: THEME.layout.borderRadius.lg,
    padding: THEME.spacing.md,
    marginBottom: THEME.spacing.md,
  },
  unitPickerText: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.primary,
  },
  unitDropdown: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: colors.background.card,
    borderRadius: THEME.layout.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.medium,
    zIndex: 1000,
  },
  unitOption: {
    padding: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  unitOptionText: {
    fontSize: THEME.typography.fontSizes.base,
    color: colors.text.primary,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.semantic.error,
  },
  deleteButtonText: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.semantic.error,
  },
  saveEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: colors.accent.green,
  },
  saveEditButtonText: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: colors.background.tertiary,
  },
  cancelButtonText: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: THEME.spacing.sm,
    flex: 1,
    paddingVertical: THEME.spacing.md,
    borderRadius: THEME.layout.borderRadius.lg,
    backgroundColor: colors.primary.main,
  },
  addButtonText: {
    fontSize: THEME.typography.fontSizes.base,
    fontWeight: THEME.typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
});
