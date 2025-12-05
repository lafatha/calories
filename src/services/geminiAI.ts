import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env';
import { FoodAnalysis, MealType } from '../types';
import {
  EditableIngredient,
  IngredientForRecalc,
  InitialAnalysisResult,
  FinalAnalysisResult,
  generateIngredientId
} from '../types/mealEditor';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

// Enhanced prompt for editable ingredients
const ENHANCED_FOOD_ANALYSIS_PROMPT = `You are an expert nutritionist AI assistant. Analyze the food image provided and identify all food items visible.

For each food item detected, provide detailed information including:
1. Name of the food item
2. Estimated quantity (as a number)
3. Unit of measurement (gram, piece, cup, slice, serving, tablespoon, teaspoon, oz, ml)
4. Estimated weight in grams
5. Estimated calories
6. Macronutrients (protein, carbs, fat in grams)

Return your analysis as a valid JSON object with this exact structure:
{
  "foods": [
    {
      "name": "Food item name",
      "quantity": 1,
      "unit": "piece",
      "weightGrams": 150,
      "calories": 250,
      "macros": {
        "protein": 30,
        "carbs": 5,
        "fat": 10
      }
    }
  ],
  "totalCalories": 250,
  "confidence": 0.85
}

Be accurate and conservative with estimates. Always provide weightGrams as a number (estimate if needed).`;

// Prompt for recalculating macros from edited ingredients
const RECALCULATION_PROMPT = `You are an expert nutritionist. Calculate the nutritional values for the following ingredient list.

For each ingredient, calculate:
- Calories based on the weight in grams
- Protein in grams
- Carbs in grams
- Fat in grams

IMPORTANT: Do NOT change the ingredient names or quantities. Only calculate the nutritional values.

Return ONLY a valid JSON object with this exact structure:
{
  "ingredients": [
    {
      "name": "exact ingredient name from input",
      "calories": number,
      "macros": {
        "protein": number,
        "carbs": number,
        "fat": number
      }
    }
  ],
  "totals": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number
  }
}`;

const FOOD_ANALYSIS_PROMPT = `You are an expert nutritionist AI assistant. Analyze the food image provided and identify all food items visible.

For each food item detected, provide:
1. Name of the food item
2. Estimated portion size
3. Estimated calories
4. Macronutrients (protein, carbs, fat in grams) if possible

Return your analysis as a valid JSON object with this exact structure:
{
  "foods": [
    {
      "name": "Food item name",
      "portion": "estimated portion (e.g., '1 cup', '150g', '1 slice')",
      "calories": number,
      "macros": {
        "protein": number (in grams),
        "carbs": number (in grams),
        "fat": number (in grams)
      }
    }
  ],
  "totalCalories": number (sum of all food calories),
  "confidence": number (0-1 confidence score),
  "notes": "Any relevant nutritional notes or suggestions"
}

Be accurate and conservative with calorie estimates. If you cannot identify a food clearly, provide your best estimate with a lower confidence score.`;

export interface AnalyzeImageResult {
  success: boolean;
  analysis?: FoodAnalysis;
  error?: string;
}

// Original function - kept for backwards compatibility
export async function analyzeFood(
  imageBase64: string,
  mealType: MealType
): Promise<AnalyzeImageResult> {
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: FOOD_ANALYSIS_PROMPT },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = result.text || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    const analysis: FoodAnalysis = {
      foods: parsedResponse.foods || [],
      totalCalories: parsedResponse.totalCalories || 0,
      confidence: parsedResponse.confidence || 0.5,
      mealType,
    };

    return {
      success: true,
      analysis,
    };
  } catch (error) {
    console.error('Error analyzing food:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    };
  }
}

/**
 * NEW: Enhanced food analysis that returns editable ingredients
 * This provides more structured data for editing purposes
 */
export async function analyzeFoodEnhanced(
  imageBase64: string,
  mealType: MealType
): Promise<InitialAnalysisResult> {
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: ENHANCED_FOOD_ANALYSIS_PROMPT },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = result.text || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Convert to EditableIngredient format
    const ingredients: EditableIngredient[] = (parsedResponse.foods || []).map((food: any) => ({
      id: generateIngredientId(),
      name: food.name || 'Unknown Item',
      quantity: food.quantity || 1,
      unit: food.unit || 'serving',
      weightGrams: food.weightGrams || 100,
      calories: food.calories || 0,
      macros: {
        protein: food.macros?.protein || 0,
        carbs: food.macros?.carbs || 0,
        fat: food.macros?.fat || 0,
      },
      isManuallyAdded: false,
      isEdited: false,
    }));

    return {
      success: true,
      ingredients,
      totalCalories: parsedResponse.totalCalories || ingredients.reduce((sum, i) => sum + i.calories, 0),
      confidence: parsedResponse.confidence || 0.5,
    };
  } catch (error) {
    console.error('Error in enhanced food analysis:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image',
    };
  }
}

/**
 * NEW: Recalculate macros for edited ingredients
 * Only calculates nutritional values - does NOT modify ingredient names/quantities
 */
export async function recalculateMacros(
  ingredients: IngredientForRecalc[]
): Promise<FinalAnalysisResult> {
  try {
    if (ingredients.length === 0) {
      return {
        success: false,
        error: 'No ingredients to calculate',
      };
    }

    // Build the ingredient list for the prompt
    const ingredientList = ingredients.map((ing, idx) =>
      `${idx + 1}. ${ing.name}: ${ing.quantity} ${ing.unit} (${ing.weightGrams}g)`
    ).join('\n');

    const fullPrompt = `${RECALCULATION_PROMPT}\n\nIngredients to calculate:\n${ingredientList}`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }],
        },
      ],
    });

    const responseText = result.text || '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI recalculation response');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      ingredients: parsedResponse.ingredients || [],
      totals: parsedResponse.totals || {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
    };
  } catch (error) {
    console.error('Error recalculating macros:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to recalculate nutritional values',
    };
  }
}

// Quick calorie estimation without full analysis
export async function quickEstimate(
  imageBase64: string
): Promise<{ calories: number; foodName: string } | null> {
  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: 'Look at this food image and provide a quick estimate. Return ONLY a JSON object like: {"foodName": "food name", "calories": number}'
            },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const responseText = result.text || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    console.error('Quick estimate error:', error);
    return null;
  }
}
