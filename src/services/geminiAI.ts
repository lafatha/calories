import { GoogleGenAI } from '@google/genai';
import { ENV } from '../config/env';
import { FoodAnalysis, MealType } from '../types';

// Initialize Gemini AI client
const genAI = new GoogleGenAI({ apiKey: ENV.GEMINI_API_KEY });

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
