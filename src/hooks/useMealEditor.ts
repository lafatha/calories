import { useState, useCallback, useMemo } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MealType } from '../types';
import {
    EditableIngredient,
    MealAnalysisState,
    MealEditorState,
    MealEditorTotals,
    IngredientUnit,
    NewIngredientInput,
    generateIngredientId,
    validateIngredient,
} from '../types/mealEditor';
import { analyzeFoodEnhanced, recalculateMacros } from '../services/geminiAI';
import { useMeals } from './useMeals';

const initialTotals: MealEditorTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
};

const initialState: MealEditorState = {
    analysisState: 'idle',
    imageUri: null,
    imageBase64: null,
    ingredients: [],
    totals: initialTotals,
    mealType: 'lunch',
    confidence: 0,
    lastAnalyzedAt: null,
    error: null,
};

export interface UseMealEditorReturn {
    // State
    state: MealEditorState;

    // Image Actions
    pickImage: (useCamera: boolean) => Promise<void>;
    clearImage: () => void;

    // Ingredient Actions
    updateIngredient: (id: string, updates: Partial<EditableIngredient>) => void;
    deleteIngredient: (id: string) => void;
    addIngredient: (ingredient: NewIngredientInput) => void;

    // Analysis Actions
    runInitialAnalysis: () => Promise<void>;
    runFinalAnalysis: () => Promise<void>;

    // Save Actions
    saveMeal: () => Promise<{ success: boolean; error?: string }>;
    canSave: boolean;

    // Meal Type
    setMealType: (type: MealType) => void;

    // Reset
    reset: () => void;
}

export const useMealEditor = (initialMealType: MealType = 'lunch'): UseMealEditorReturn => {
    const { addMeal } = useMeals();
    const [state, setState] = useState<MealEditorState>({
        ...initialState,
        mealType: initialMealType,
    });

    // Calculate totals from ingredients
    const calculateTotals = useCallback((ingredients: EditableIngredient[]): MealEditorTotals => {
        return ingredients.reduce(
            (acc, ing) => ({
                calories: acc.calories + (ing.calories || 0),
                protein: acc.protein + (ing.macros?.protein || 0),
                carbs: acc.carbs + (ing.macros?.carbs || 0),
                fat: acc.fat + (ing.macros?.fat || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
        );
    }, []);

    // Computed: can save only if not in dirty state
    const canSave = useMemo(() => {
        return (
            state.analysisState === 'ai_initial' ||
            state.analysisState === 'recalculated_clean'
        ) && state.ingredients.length > 0;
    }, [state.analysisState, state.ingredients.length]);

    // Pick image from camera or gallery
    const pickImage = useCallback(async (useCamera: boolean) => {
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
                setState(prev => ({
                    ...prev,
                    imageUri: result.assets[0].uri,
                    imageBase64: result.assets[0].base64 || null,
                    ingredients: [],
                    totals: initialTotals,
                    analysisState: 'idle',
                    error: null,
                }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to access camera or gallery');
        }
    }, []);

    // Clear image and reset
    const clearImage = useCallback(() => {
        setState(prev => ({
            ...prev,
            imageUri: null,
            imageBase64: null,
            ingredients: [],
            totals: initialTotals,
            analysisState: 'idle',
            confidence: 0,
            error: null,
        }));
    }, []);

    // Run initial AI analysis on image
    const runInitialAnalysis = useCallback(async () => {
        if (!state.imageBase64) {
            setState(prev => ({ ...prev, error: 'No image to analyze' }));
            return;
        }

        setState(prev => ({ ...prev, analysisState: 'analyzing_initial', error: null }));

        try {
            const result = await analyzeFoodEnhanced(state.imageBase64, state.mealType);

            if (result.success && result.ingredients) {
                const totals = calculateTotals(result.ingredients);
                setState(prev => ({
                    ...prev,
                    analysisState: 'ai_initial',
                    ingredients: result.ingredients!,
                    totals,
                    confidence: result.confidence || 0.5,
                    lastAnalyzedAt: new Date(),
                    error: null,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    analysisState: 'error',
                    error: result.error || 'Failed to analyze image',
                }));
            }
        } catch (error) {
            console.error('Analysis error:', error);
            setState(prev => ({
                ...prev,
                analysisState: 'error',
                error: error instanceof Error ? error.message : 'Analysis failed',
            }));
        }
    }, [state.imageBase64, state.mealType, calculateTotals]);

    // Update an ingredient (marks as dirty)
    const updateIngredient = useCallback((id: string, updates: Partial<EditableIngredient>) => {
        setState(prev => {
            const newIngredients = prev.ingredients.map(ing =>
                ing.id === id
                    ? { ...ing, ...updates, isEdited: true }
                    : ing
            );

            return {
                ...prev,
                ingredients: newIngredients,
                analysisState: 'edited_dirty',
                // Keep old totals but they're now "stale"
            };
        });
    }, []);

    // Delete an ingredient (marks as dirty)
    const deleteIngredient = useCallback((id: string) => {
        setState(prev => {
            const newIngredients = prev.ingredients.filter(ing => ing.id !== id);
            const newTotals = calculateTotals(newIngredients);

            return {
                ...prev,
                ingredients: newIngredients,
                totals: newTotals,
                analysisState: newIngredients.length > 0 ? 'edited_dirty' : 'ai_initial',
            };
        });
    }, [calculateTotals]);

    // Add a new ingredient manually (marks as dirty)
    const addIngredient = useCallback((input: NewIngredientInput) => {
        const validation = validateIngredient({
            name: input.name,
            quantity: input.quantity,
            unit: input.unit,
            weightGrams: input.weightGrams,
        });

        if (!validation.isValid) {
            Alert.alert('Invalid Ingredient', validation.errors.join('\n'));
            return;
        }

        const newIngredient: EditableIngredient = {
            id: generateIngredientId(),
            name: input.name,
            quantity: input.quantity,
            unit: input.unit as IngredientUnit,
            weightGrams: input.weightGrams,
            calories: 0, // Will be calculated by AI
            macros: { protein: 0, carbs: 0, fat: 0 },
            isManuallyAdded: true,
            isEdited: false,
        };

        setState(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, newIngredient],
            analysisState: 'edited_dirty',
        }));
    }, []);

    // Run final analysis to recalculate macros
    const runFinalAnalysis = useCallback(async () => {
        if (state.ingredients.length === 0) {
            Alert.alert('No Ingredients', 'Please add at least one ingredient');
            return;
        }

        setState(prev => ({ ...prev, analysisState: 'recalculating', error: null }));

        try {
            const ingredientsForRecalc = state.ingredients.map(ing => ({
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
                weightGrams: ing.weightGrams,
            }));

            const result = await recalculateMacros(ingredientsForRecalc);

            if (result.success && result.ingredients && result.totals) {
                // Merge recalculated values back into ingredients
                const updatedIngredients = state.ingredients.map(ing => {
                    const recalc = result.ingredients!.find(
                        r => r.name.toLowerCase() === ing.name.toLowerCase()
                    );

                    if (recalc) {
                        return {
                            ...ing,
                            calories: recalc.calories,
                            macros: recalc.macros,
                            isEdited: false, // Reset edit flag after recalc
                        };
                    }
                    return ing;
                });

                setState(prev => ({
                    ...prev,
                    analysisState: 'recalculated_clean',
                    ingredients: updatedIngredients,
                    totals: result.totals!,
                    lastAnalyzedAt: new Date(),
                    error: null,
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    analysisState: 'error',
                    error: result.error || 'Failed to recalculate',
                }));
            }
        } catch (error) {
            console.error('Recalculation error:', error);
            setState(prev => ({
                ...prev,
                analysisState: 'error',
                error: error instanceof Error ? error.message : 'Recalculation failed',
            }));
        }
    }, [state.ingredients]);

    // Save meal to database
    const saveMeal = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
        if (state.analysisState === 'edited_dirty') {
            Alert.alert(
                'Updates Required',
                'Please tap "Analyze Final" to recalculate nutritional values before saving.'
            );
            return { success: false, error: 'Dirty state - needs recalculation' };
        }

        if (state.ingredients.length === 0) {
            Alert.alert('No Ingredients', 'Please add at least one ingredient');
            return { success: false, error: 'No ingredients' };
        }

        setState(prev => ({ ...prev, analysisState: 'saving' }));

        try {
            const foodName = state.ingredients
                .map(i => i.name)
                .join(', ')
                .substring(0, 200);

            const analysis = {
                totalCalories: state.totals.calories,
                confidence: state.confidence,
                foods: state.ingredients.map(ing => ({
                    name: ing.name,
                    calories: ing.calories,
                    portion: `${ing.quantity} ${ing.unit} (${ing.weightGrams}g)`,
                    macros: ing.macros,
                })),
            };

            const { error } = await addMeal(
                foodName,
                state.totals.calories,
                state.mealType,
                undefined,
                analysis as any
            );

            if (error) {
                setState(prev => ({
                    ...prev,
                    analysisState: 'error',
                    error: error.message || 'Failed to save meal',
                }));
                return { success: false, error: error.message };
            }

            setState(prev => ({ ...prev, analysisState: 'saved' }));
            return { success: true };
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Save failed';
            setState(prev => ({
                ...prev,
                analysisState: 'error',
                error: errorMsg,
            }));
            return { success: false, error: errorMsg };
        }
    }, [state, addMeal]);

    // Set meal type
    const setMealType = useCallback((type: MealType) => {
        setState(prev => ({ ...prev, mealType: type }));
    }, []);

    // Reset everything
    const reset = useCallback(() => {
        setState({ ...initialState, mealType: state.mealType });
    }, [state.mealType]);

    return {
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
        reset,
    };
};
