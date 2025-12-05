// Meal Editor Types for Editable Ingredients Feature

export type IngredientUnit =
    | 'gram' | 'kg'
    | 'cup' | 'tablespoon' | 'teaspoon'
    | 'piece' | 'slice' | 'serving'
    | 'oz' | 'lb' | 'ml' | 'liter';

export interface EditableIngredient {
    id: string;
    name: string;
    quantity: number;
    unit: IngredientUnit;
    weightGrams: number;
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
    isManuallyAdded: boolean;
    isEdited: boolean;
}

export type MealAnalysisState =
    | 'idle'
    | 'analyzing_initial'
    | 'ai_initial'
    | 'edited_dirty'
    | 'recalculating'
    | 'recalculated_clean'
    | 'saving'
    | 'saved'
    | 'error';

export interface MealEditorTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface MealEditorState {
    analysisState: MealAnalysisState;
    imageUri: string | null;
    imageBase64: string | null;
    ingredients: EditableIngredient[];
    totals: MealEditorTotals;
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    confidence: number;
    lastAnalyzedAt: Date | null;
    error: string | null;
}

export interface IngredientForRecalc {
    name: string;
    quantity: number;
    unit: IngredientUnit;
    weightGrams: number;
}

export interface NewIngredientInput {
    name: string;
    quantity: number;
    unit: IngredientUnit;
    weightGrams: number;
}

export interface InitialAnalysisResult {
    success: boolean;
    ingredients?: EditableIngredient[];
    totalCalories?: number;
    confidence?: number;
    error?: string;
}

export interface FinalAnalysisResult {
    success: boolean;
    ingredients?: {
        name: string;
        calories: number;
        macros: { protein: number; carbs: number; fat: number };
    }[];
    totals?: MealEditorTotals;
    error?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}

// Helper to generate unique IDs
export const generateIngredientId = (): string => {
    return `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Validation helper
export const validateIngredient = (ing: Partial<EditableIngredient>): ValidationResult => {
    const errors: string[] = [];

    if (!ing.name?.trim()) {
        errors.push('Name is required');
    }

    if (!ing.quantity || ing.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
    }

    if (!ing.weightGrams || ing.weightGrams <= 0) {
        errors.push('Weight must be greater than 0');
    }

    if (!ing.unit) {
        errors.push('Unit is required');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// Unit options for dropdown
export const UNIT_OPTIONS: { value: IngredientUnit; label: string }[] = [
    { value: 'gram', label: 'gram (g)' },
    { value: 'kg', label: 'kilogram (kg)' },
    { value: 'piece', label: 'piece' },
    { value: 'slice', label: 'slice' },
    { value: 'serving', label: 'serving' },
    { value: 'cup', label: 'cup' },
    { value: 'tablespoon', label: 'tablespoon' },
    { value: 'teaspoon', label: 'teaspoon' },
    { value: 'oz', label: 'ounce (oz)' },
    { value: 'lb', label: 'pound (lb)' },
    { value: 'ml', label: 'milliliter (ml)' },
    { value: 'liter', label: 'liter (L)' },
];
