import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface NutritionResponse {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  one_line_summary: string;
}

export async function POST(req: NextRequest) {
  try {
    const { items_text } = await req.json();

    if (!items_text || typeof items_text !== 'string' || items_text.trim().length === 0) {
      return NextResponse.json({ error: 'Meal description is required' }, { status: 400 });
    }

    // Input length cap for security
    const cleanText = items_text.trim().slice(0, 500);

    // Collect all available Gemini API keys for automatic failover/rotation
    const rawKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter(Boolean) as string[];

    const apiKeys: string[] = [];
    for (const k of rawKeys) {
      for (const part of k.split(',')) {
        const trimmed = part.trim();
        if (trimmed && !trimmed.includes('YourGeminiApiKey') && !apiKeys.includes(trimmed)) {
          apiKeys.push(trimmed);
        }
      }
    }

    // Try each API key in order (automatic failover if one key runs out of quota)
    for (let i = 0; i < apiKeys.length; i++) {
      const apiKey = apiKeys[i];
      try {
        const ai = new GoogleGenAI({ apiKey });
        const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

        const prompt = `You are an elite sports nutritionist. Analyze the following meal eaten by an athlete during their Winter Arc challenge:
"${cleanText}"

Calculate realistic macronutrients and calories for this meal.
Return ONLY valid JSON matching this exact structure:
{
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "one_line_summary": string
}
Do not include markdown backticks or any preamble, only valid JSON.`;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText.replace(/```json|```/g, '').trim()) as NutritionResponse;

        return NextResponse.json({
          calories: Math.round(Number(parsed.calories) || 350),
          protein_g: Math.round(Number(parsed.protein_g) || 20),
          carbs_g: Math.round(Number(parsed.carbs_g) || 40),
          fat_g: Math.round(Number(parsed.fat_g) || 12),
          one_line_summary: parsed.one_line_summary || `Nutritional estimate for: ${cleanText.slice(0, 50)}`,
        });
      } catch (geminiErr: any) {
        console.warn(`Gemini API key #${i + 1} exhausted or failed. Rotating to next key if available:`, geminiErr?.message || geminiErr);
      }
    }

    // Heuristic fallback if all API keys fail or during offline testing
    const wordCount = cleanText.split(/\s+/).length;
    const baseCalories = Math.max(180, Math.min(1200, 200 + wordCount * 65));
    const protein = Math.round(baseCalories * 0.06);
    const carbs = Math.round(baseCalories * 0.11);
    const fat = Math.round(baseCalories * 0.03);

    return NextResponse.json({
      calories: baseCalories,
      protein_g: protein,
      carbs_g: carbs,
      fat_g: fat,
      one_line_summary: `Estimated baseline for "${cleanText.slice(0, 45)}..."`,
    });
  } catch (error: any) {
    console.error('Diet estimation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to estimate nutrition' }, { status: 500 });
  }
}
