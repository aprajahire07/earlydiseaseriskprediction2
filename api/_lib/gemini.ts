import { GoogleGenAI } from '@google/genai';

// In-memory tracking for assessment question counts: assessmentId -> count (strictly max 5)
const assessmentQuestionCounts = new Map<string, number>();

/**
 * Retrieves the Gemini API key from server environment variables.
 * Checks GEMINI_API_KEY first, followed by GOOGLE_API_KEY, GEMINI_KEY, or any prefixed alias.
 * NEVER exposed to client.
 */
export function getGeminiApiKey(): string | null {
  const key =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GEMINI_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (key && key.trim().length > 0 && key !== 'MY_GEMINI_API_KEY') {
    return key.trim();
  }
  return null;
}

/**
 * Creates an authorized instance of GoogleGenAI SDK.
 */
export function createGeminiClient(apiKey: string): GoogleGenAI {
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Set standard CORS headers for Vercel Serverless Functions
 */
export function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

/**
 * Clinical educational summary fallback when Gemini is unreachable, timed out, or unconfigured
 */
export function generateClinicalSummaryFallback(assessment: any, renderResult: any): string {
  const risk = renderResult?.risk_level || 'Moderate';
  const disease = renderResult?.target_disease || 'Cardiovascular & Metabolic Health';
  const bmi = assessment?.bmi || 24;
  const bp = assessment?.bloodPressure || 'Normal';
  const act = assessment?.physicalActivity || 'Moderate';

  let multiConditionsNote = '';
  if (Array.isArray(renderResult?.predictions) && renderResult.predictions.length > 0) {
    const list = renderResult.predictions
      .map((p: any) => `${p.disease} (${p.percentageFormatted || p.percentage + '%'})`)
      .join(', ');
    multiConditionsNote = ` The ML model evaluated specific indicators across: ${list}.`;
  }

  return `Based on your clinical ML evaluation, your overall profile indicates a ${risk} risk level, with primary attention directed toward ${disease}.${multiConditionsNote} Your recorded Body Mass Index of ${bmi} and resting blood pressure category (${bp}) are key contributing factors analyzed by the model.\n\nTo proactively support your long-term health, focus on consistent daily physical movement (${String(act).toLowerCase().includes('active') ? 'maintaining your active routine' : 'aiming for 150 minutes of weekly aerobic exercise'}), a balanced diet rich in whole grains and lean proteins, and monitoring your resting blood pressure twice monthly. Please share these findings with your primary healthcare provider for comprehensive clinical oversight.`;
}

/**
 * Clinical chat fallback generator when Gemini is unreachable or timed out
 */
export function generateClinicalChatFallback(
  question: string,
  assessment: any,
  renderResult: any
): string {
  const q = question.toLowerCase();
  const risk = renderResult?.risk_level || 'Moderate';
  const disease = renderResult?.target_disease || 'Cardiovascular & Metabolic Health';
  const bmi = assessment?.bmi || 24;
  const bp = assessment?.bloodPressure || 'Normal';
  const act = assessment?.physicalActivity || 'Moderate';
  const smoking = assessment?.smokingHabit || 'Never';

  if (q.includes('why') || q.includes('result') || q.includes('reason')) {
    return `Your assessment resulted in ${risk} risk because the machine learning model weighed your vital indicators together. The primary drivers include your blood pressure (${bp}), BMI (${bmi}), and physical activity level (${act}). Together, these parameters most closely matched patterns in ${disease}.`;
  }
  if (q.includes('improve') || q.includes('first') || q.includes('next') || q.includes('step')) {
    return `The most impactful first step is establishing consistent aerobic exercise (such as brisk walking for 30 minutes, 5 days a week) and monitoring your sodium intake to support healthy arterial pressure. Even small, sustainable lifestyle shifts can significantly enhance your cardiovascular health index.`;
  }
  if (q.includes('bmi') || q.includes('weight')) {
    const bmiVal = parseFloat(String(bmi));
    let category = 'within the healthy range (18.5–24.9)';
    if (bmiVal >= 30) category = 'in the obesity range (≥30.0)';
    else if (bmiVal >= 25) category = 'in the overweight range (25.0–29.9)';
    else if (bmiVal < 18.5) category = 'in the underweight range (<18.5)';

    return `Your calculated BMI is ${bmi}, which falls ${category}. While BMI is an informative general screening ratio between height and weight, it does not distinguish muscle mass from fat. Balancing nutrient-dense meals and regular physical activity will help maintain optimal body composition.`;
  }
  if (q.includes('blood pressure') || q.includes('bp') || q.includes('hypertension')) {
    return `Your resting blood pressure was reported as "${bp}". Blood pressure measures the tension against your artery walls. Maintaining readings below 120/80 mmHg helps reduce strain on your heart and cerebral blood vessels. Routine cuff checks and limiting excess dietary salt are strongly encouraged.`;
  }
  if (q.includes('risk level') || q.includes('mean') || q.includes('score')) {
    return `Your ${risk} risk level indicates the statistical probability pattern identified by the Render clinical model across chronic health factors. It is an educational early warning indicator designed to empower proactive lifestyle choices, not a definitive clinical diagnosis.`;
  }
  if (q.includes('recalculate') || q.includes('change')) {
    return `Your risk result comes from the authoritative clinical assessment model. I can explain the existing result, but I cannot replace or recalculate it. If your numbers have changed, you can click "Start a New Assessment" to run a fresh evaluation.`;
  }

  return `Regarding your assessment (${disease}, ${risk} risk): maintaining a balanced lifestyle with regular movement, smoke-free habits (${smoking}), and routine health screenings provides the strongest protective foundation. Discuss these results with a licensed doctor for personalized medical evaluation.`;
}

/**
 * Handle AI Health Summary generation with safe timeouts and error handling
 */
export async function handleAiSummaryRequest(reqBody: any): Promise<{ summary: string }> {
  const { assessment, renderResult } = reqBody || {};

  if (!assessment || !renderResult) {
    throw new Error('Missing assessment data or render result');
  }

  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      console.log('[AI Summary] Initiating Gemini request for assessment');
      const ai = createGeminiClient(apiKey);

      const predictionsText = Array.isArray(renderResult.predictions)
        ? renderResult.predictions.map((p: any) => `${p.disease}: ${p.percentageFormatted || p.percentage + '%'}`).join('; ')
        : renderResult.target_disease;

      const prompt = `You are a certified preventive health educator.
Analyze this user's clinical ML assessment results and write a concise, empowering, 2-paragraph educational explanation.

CLINICAL ML GROUND TRUTH (RENDER MODEL RESULT — DO NOT ALTER):
- Overall Risk Level: ${renderResult.risk_level}
- Target Condition Focus: ${renderResult.target_disease}
- Risk Percentage: ${renderResult.risk_percentage}
- Health Index: ${renderResult.health_index ?? 'N/A'}/100
- Multi-Disease Predictions: ${predictionsText}
- Model Recommendations: ${Array.isArray(renderResult.recommendations) ? renderResult.recommendations.join('; ') : renderResult.recommendations}

USER INPUT PARAMETERS:
- Age: ${assessment.age}
- Biological Sex: ${assessment.gender}
- BMI: ${assessment.bmi} (Height: ${assessment.heightCm} cm, Weight: ${assessment.weightKg} kg)
- Resting Blood Pressure: ${assessment.bloodPressure}
- Physical Movement: ${assessment.physicalActivity}
- Smoking Status: ${assessment.smokingHabit}
- Alcohol Intake: ${assessment.alcoholConsumption}
- Family Medical Background: ${assessment.familyHistory || 'None reported'}
- Blood Sugar: ${assessment.bloodSugar || 'Normal'}

STRICT MEDICAL & SAFETY RULES:
1. Do NOT diagnose or claim certainty (avoid "You have diabetes", "You will get heart disease"). Use "Your assessment indicates...", "This pattern is associated with...", "Consult a physician...".
2. Explain how their specific lifestyle factors (BMI, blood pressure, physical activity, family history) relate to the Render risk score and predicted conditions.
3. Keep the tone calm, constructive, and educational.`;

      const genPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
      const result: any = await Promise.race([genPromise, timeoutPromise]);

      if (result && result.text) {
        console.log('[AI Summary] Gemini successfully responded');
        return { summary: result.text.trim() };
      }
      console.warn('[AI Summary] Gemini request timed out (8s), falling back to clinical generator');
    } catch (err: any) {
      console.warn('[AI Summary] Gemini API call exception:', err?.message || err);
    }
  } else {
    console.warn('[AI Summary] No GEMINI_API_KEY detected in environment, using clinical education generator');
  }

  // Graceful clinical educational summary fallback
  const fallbackSummary = generateClinicalSummaryFallback(assessment, renderResult);
  return { summary: fallbackSummary };
}

/**
 * Handle AI Inline Chat with strict server-side 5-message limit and automatic context
 */
export async function handleAiChatRequest(reqBody: any): Promise<{
  reply: string;
  used: number;
  remaining: number;
  maxAllowed: number;
  limitReached: boolean;
}> {
  const { assessmentId, assessment, renderResult, messages, question } = reqBody || {};

  if (!assessmentId || !question) {
    throw new Error('Missing assessmentId or question');
  }

  // 1. Strictly enforce 5 user messages limit server-side
  // Check both verified conversation history and server map
  const historyUserCount = Array.isArray(messages)
    ? messages.filter((m: any) => m && (m.role === 'user' || m.role === 'User')).length
    : 0;
  const inMemoryCount = assessmentQuestionCounts.get(assessmentId) || 0;
  const currentCount = Math.max(historyUserCount, inMemoryCount);

  if (currentCount >= 5) {
    console.log(`[AI Chat] Assessment ${assessmentId} has reached the 5-question limit.`);
    const limitError: any = new Error("You've reached the 5-question limit for this assessment.");
    limitError.statusCode = 429;
    limitError.limitReached = true;
    limitError.remaining = 0;
    throw limitError;
  }

  let replyText = '';
  const apiKey = getGeminiApiKey();

  if (apiKey) {
    try {
      console.log(`[AI Chat] Processing question ${currentCount + 1}/5 for assessment ${assessmentId}`);
      const ai = createGeminiClient(apiKey);

      const predictionsText = Array.isArray(renderResult?.predictions)
        ? renderResult.predictions.map((p: any) => `${p.disease}: ${p.percentageFormatted || p.percentage + '%'}`).join('; ')
        : renderResult?.target_disease || 'None';

      const systemInstruction = `You are an educational preventive health assistant for the Early Disease Risk Prediction platform.
You are helping the user understand their recent clinical ML assessment result in an inline chat.

AUTHORITATIVE ASSESSMENT CONTEXT (DO NOT OVERRIDE OR RECALCULATE):
- Target Condition Focus: ${renderResult?.target_disease || 'General Health'}
- Predicted Risk Level: ${renderResult?.risk_level || 'Evaluated'}
- Calculated Risk Percentage: ${renderResult?.risk_percentage || 'N/A'}
- Health Index: ${renderResult?.health_index ?? 'N/A'}/100
- Multi-Disease Predictions: ${predictionsText}
- Model Recommendations: ${Array.isArray(renderResult?.recommendations) ? renderResult.recommendations.join('; ') : renderResult?.recommendations || 'None'}

USER ASSESSED PARAMETERS:
- Name: ${assessment?.fullName || 'User'}
- Age: ${assessment?.age || 'N/A'}
- Biological Sex: ${assessment?.gender || 'N/A'}
- BMI: ${assessment?.bmi || 'N/A'} (Height: ${assessment?.heightCm} cm, Weight: ${assessment?.weightKg} kg)
- Blood Pressure: ${assessment?.bloodPressure || 'N/A'}
- Physical Activity: ${assessment?.physicalActivity || 'N/A'}
- Smoking Habit: ${assessment?.smokingHabit || 'N/A'}
- Alcohol Consumption: ${assessment?.alcoholConsumption || 'N/A'}
- Family History: ${assessment?.familyHistory || 'None reported'}
- Blood Sugar: ${assessment?.bloodSugar || 'Normal'}

MANDATORY RULES:
1. NEVER diagnose the user or make clinical guarantees (no "You definitely have hypertension").
2. NEVER recalculate or alter the Render risk result or disease probabilities. If asked to recalculate or change the score, explain: "Your risk result comes from the assessment model. I can explain the existing result, but I can't replace or recalculate it." Suggest "Start a New Assessment" if their vitals changed.
3. If the user reports acute emergency symptoms (severe chest pain, sudden numbness, difficulty breathing), immediately advise seeking emergency medical services.
4. Keep answers concise, direct, helpful, and under 130 words so it fits comfortably in the compact chat UI.
5. If the user asks something completely unrelated to health or this assessment, respond:
   "I can only help explain your health assessment and preventive health topics. Feel free to ask about your result or lifestyle recommendations."`;

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(messages)) {
        for (const msg of messages) {
          if (!msg || !msg.text) continue;
          if (msg.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: msg.text }] });
          } else if (msg.role === 'assistant' || msg.role === 'model') {
            contents.push({ role: 'model', parts: [{ text: msg.text }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: question }] });

      const genPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000));
      const aiRes: any = await Promise.race([genPromise, timeoutPromise]);

      if (aiRes && aiRes.text) {
        replyText = aiRes.text.trim();
        console.log(`[AI Chat] Gemini responded successfully for assessment ${assessmentId}`);
      }
    } catch (geminiErr: any) {
      console.warn('[AI Chat] Gemini call error:', geminiErr?.message || geminiErr);
    }
  } else {
    console.warn('[AI Chat] No GEMINI_API_KEY found, using clinical chat generator');
  }

  if (!replyText) {
    replyText = generateClinicalChatFallback(question, assessment, renderResult);
  }

  // Increment counter ONLY upon successful generation
  const newCount = currentCount + 1;
  assessmentQuestionCounts.set(assessmentId, newCount);

  const remaining = Math.max(0, 5 - newCount);

  return {
    reply: replyText,
    used: newCount,
    remaining,
    maxAllowed: 5,
    limitReached: newCount >= 5,
  };
}
