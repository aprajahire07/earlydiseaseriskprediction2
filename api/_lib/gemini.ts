import { GoogleGenAI } from '@google/genai';

// In-memory tracking for assessment question counts: assessmentId -> count (strictly max 5)
const assessmentQuestionCounts = new Map<string, number>();

/**
 * Retrieves the Gemini API key from server environment variables.
 * Checks GEMINI_API_KEY first, followed by GOOGLE_API_KEY as an official server-side alias.
 * NEVER exposed to client.
 */
export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
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
 * Robust request body parser for Vercel Serverless Functions and Node.js environments.
 * Handles pre-parsed JSON, raw strings, Buffers, and streaming IncomingMessage requests.
 */
export async function parseRequestBody(req: any): Promise<any> {
  if (!req) return null;

  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object') {
      if (Buffer.isBuffer(req.body)) {
        try {
          return JSON.parse(req.body.toString('utf-8'));
        } catch {
          return null;
        }
      }
      return req.body;
    }
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return null;
      }
    }
    return req.body;
  }

  // If req is a Node.js readable stream (IncomingMessage)
  if (typeof req.on === 'function') {
    return new Promise((resolve) => {
      let data = '';
      req.on('data', (chunk: any) => {
        data += chunk;
      });
      req.on('end', () => {
        if (!data || data.trim().length === 0) {
          resolve(null);
          return;
        }
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
      req.on('error', () => resolve(null));
    });
  }

  return null;
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
 * Executes a Gemini request with automatic resilience against temporary upstream high-demand spikes (503) or latency.
 * Prefers gemini-3.8-flash. If Google Cloud reports a temporary high-demand spike (503 UNAVAILABLE) or takes >6s,
 * seamlessly completes with gemini-3.1-flash-lite to guarantee reliable production uptime.
 */
export async function callGeminiWithResilience(
  ai: GoogleGenAI,
  requestParams: { contents: any; config?: any }
): Promise<any> {
  try {
    const flashPromise = ai.models.generateContent({
      ...requestParams,
      model: 'gemini-3.8-flash',
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('GEMINI_FLASH_BUSY_TIMEOUT')), 6000)
    );

    return await Promise.race([flashPromise, timeoutPromise]);
  } catch (err: any) {
    const msg = String(err?.message || '');
    const isHighDemandSpike =
      msg === 'GEMINI_FLASH_BUSY_TIMEOUT' ||
      err?.status === 503 ||
      msg.includes('503') ||
      msg.includes('high demand') ||
      msg.includes('UNAVAILABLE') ||
      msg.includes('overloaded');

    if (isHighDemandSpike) {
      console.warn(`[Gemini Server] Upstream gemini-3.8-flash is experiencing high demand/latency (${msg}). Completing request with gemini-3.1-flash-lite...`);
      return await ai.models.generateContent({
        ...requestParams,
        model: 'gemini-3.1-flash-lite',
      });
    }

    throw err;
  }
}

/**
 * Handle AI Health Summary generation grounded strictly in Render ML assessment
 */
export async function handleAiSummaryRequest(reqBody: any): Promise<{ summary: string }> {
  const { assessment, renderResult } = reqBody || {};

  if (!assessment || !renderResult) {
    const badReqError: any = new Error('Missing assessment data or renderResult in payload.');
    badReqError.statusCode = 400;
    badReqError.code = 'BAD_REQUEST';
    throw badReqError;
  }

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.error('[AI Summary Server] GEMINI_API_KEY is not configured in server environment variables.');
    const configError: any = new Error('AI service is not configured on the server. GEMINI_API_KEY is missing.');
    configError.statusCode = 503;
    configError.code = 'MISSING_API_KEY';
    configError.userMessage = 'AI service is not configured on the server (GEMINI_API_KEY missing).';
    throw configError;
  }

  try {
    console.log('[AI Summary Server] Initiating Gemini request for assessment');
    const ai = createGeminiClient(apiKey);

    // Format all disease predictions evaluated by the Render ML model
    let predictionsText = '';
    if (Array.isArray(renderResult.predictions) && renderResult.predictions.length > 0) {
      predictionsText = renderResult.predictions
        .map((p: any) => `- ${p.disease}: ${p.percentageFormatted || p.percentage + '%'}`)
        .join('\n');
    } else if (renderResult.condition_results && typeof renderResult.condition_results === 'object') {
      predictionsText = Object.entries(renderResult.condition_results)
        .map(([k, v]) => `- ${k}: ${v}%`)
        .join('\n');
    } else {
      predictionsText = `- ${renderResult.target_disease || 'Evaluated Condition'}: ${renderResult.risk_percentage || 'N/A'}`;
    }

    const recommendationsList = Array.isArray(renderResult.recommendations)
      ? renderResult.recommendations.map((r: any) => `- ${r}`).join('\n')
      : `- ${renderResult.recommendations || 'Maintain healthy lifestyle habits'}`;

    // Prompt Gemini strictly as an explanation layer
    const prompt = `You are explaining the results of an ML health-risk model.

The following prediction values were produced by the application's Render ML model.
Do not modify, recalculate, invent, or replace any prediction value.
Explain the provided results in simple, clear, empowering language (2 to 3 paragraphs).
Do not diagnose the user.

Render ML result:
Overall Risk Level: ${renderResult.risk_level || 'Evaluated'}
Overall Risk Score: ${renderResult.risk_percentage || 'N/A'}
Health Index: ${renderResult.health_index ?? 'N/A'}/100
Target Condition Focus: ${renderResult.target_disease || 'Health Assessment'}
Evaluated Disease Predictions:
${predictionsText}
Model Recommendations:
${recommendationsList}

User Assessed Parameters:
- Age: ${assessment.age || 'N/A'}
- Biological Sex: ${assessment.gender || 'N/A'}
- BMI: ${assessment.bmi || 'N/A'} (Height: ${assessment.heightCm || 'N/A'} cm, Weight: ${assessment.weightKg || 'N/A'} kg)
- Blood Pressure Category: ${assessment.bloodPressure || 'N/A'}
- Physical Activity Level: ${assessment.physicalActivity || 'N/A'}
- Smoking Habit: ${assessment.smokingHabit || 'N/A'}
- Alcohol Intake: ${assessment.alcoholConsumption || 'N/A'}
- Blood Sugar: ${assessment.bloodSugar || 'Normal'}
- Family Medical Background: ${assessment.familyHistory || 'None reported'}

Instructions:
1. Explain what each evaluated disease risk probability from the Render ML model signifies in plain language.
2. Discuss how the user's specific reported lifestyle factors and vitals correlate with these findings.
3. Offer constructive preventive habits.
4. Conclude with a clear reminder that this is an educational ML statistical model, not a medical diagnosis, and encourage consultation with a healthcare provider.`;

    const response = await callGeminiWithResilience(ai, {
      contents: prompt,
    });

    const summaryText = response.text?.trim();
    if (!summaryText) {
      console.error('[AI Summary Server] Gemini returned an empty summary text.');
      const emptyError: any = new Error('AI service returned an empty explanation.');
      emptyError.statusCode = 502;
      emptyError.code = 'EMPTY_RESPONSE';
      throw emptyError;
    }

    console.log('[AI Summary Server] Gemini generated summary successfully');
    return { summary: summaryText };
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }

    const msg = String(err?.message || '');
    console.error('[AI Summary Server] Gemini generation error:', msg);

    const mappedErr: any = new Error(msg || 'AI summary generation failed');
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || err?.status === 401 || err?.status === 403) {
      mappedErr.statusCode = 401;
      mappedErr.code = 'AUTH_FAILED';
      mappedErr.userMessage = 'Gemini authentication failed. Please check server GEMINI_API_KEY.';
    } else if (err?.status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      mappedErr.statusCode = 429;
      mappedErr.code = 'RATE_LIMIT';
      mappedErr.userMessage = 'Gemini rate limit or quota exceeded. Please try again shortly.';
    } else if (err?.status === 503 || msg.includes('UNAVAILABLE') || msg.includes('overloaded')) {
      mappedErr.statusCode = 503;
      mappedErr.code = 'SERVICE_UNAVAILABLE';
      mappedErr.userMessage = 'Gemini service is temporarily unavailable. Please try again.';
    } else {
      mappedErr.statusCode = 500;
      mappedErr.code = 'GEMINI_ERROR';
      mappedErr.userMessage = 'AI summary is temporarily unavailable.';
    }

    throw mappedErr;
  }
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
  const { assessment, renderResult, messages } = reqBody || {};
  const question = (reqBody?.question || reqBody?.message || '').trim();
  const assessmentId = reqBody?.assessmentId || 'assessment-session';

  if (!question) {
    const badReqError: any = new Error('Missing question or message in payload.');
    badReqError.statusCode = 400;
    badReqError.code = 'BAD_REQUEST';
    throw badReqError;
  }

  // Strictly enforce 5 user messages limit server-side
  const historyUserCount = Array.isArray(messages)
    ? messages.filter((m: any) => m && (m.role === 'user' || m.role === 'User')).length
    : 0;
  const inMemoryCount = assessmentQuestionCounts.get(assessmentId) || 0;
  const currentCount = Math.max(historyUserCount, inMemoryCount);

  if (currentCount >= 5) {
    console.log(`[AI Chat Server] Assessment ${assessmentId} has reached the 5-question limit.`);
    const limitError: any = new Error("You've reached the 5-question limit for this assessment.");
    limitError.statusCode = 429;
    limitError.code = 'LIMIT_REACHED';
    limitError.limitReached = true;
    limitError.remaining = 0;
    throw limitError;
  }

  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    console.error('[AI Chat Server] GEMINI_API_KEY is not configured in server environment variables.');
    const configError: any = new Error('AI service is not configured on the server. GEMINI_API_KEY is missing.');
    configError.statusCode = 503;
    configError.code = 'MISSING_API_KEY';
    configError.userMessage = 'AI assistant is not configured on the server (GEMINI_API_KEY missing).';
    throw configError;
  }

  try {
    console.log(`[AI Chat Server] Processing question ${currentCount + 1}/5 for assessment ${assessmentId}`);
    const ai = createGeminiClient(apiKey);

    let predictionsText = '';
    if (Array.isArray(renderResult?.predictions) && renderResult.predictions.length > 0) {
      predictionsText = renderResult.predictions
        .map((p: any) => `${p.disease}: ${p.percentageFormatted || p.percentage + '%'}`)
        .join('; ');
    } else if (renderResult?.condition_results && typeof renderResult.condition_results === 'object') {
      predictionsText = Object.entries(renderResult.condition_results)
        .map(([k, v]) => `${k}: ${v}%`)
        .join('; ');
    } else {
      predictionsText = `${renderResult?.target_disease || 'General Health'}: ${renderResult?.risk_percentage || 'N/A'}`;
    }

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
- BMI: ${assessment?.bmi || 'N/A'} (Height: ${assessment?.heightCm || 'N/A'} cm, Weight: ${assessment?.weightKg || 'N/A'} kg)
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

    const response = await callGeminiWithResilience(ai, {
      contents,
      config: {
        systemInstruction,
      },
    });

    const replyText = response.text?.trim();
    if (!replyText) {
      const emptyError: any = new Error('AI service returned an empty answer.');
      emptyError.statusCode = 502;
      emptyError.code = 'EMPTY_RESPONSE';
      throw emptyError;
    }

    // Increment counter ONLY upon successful generation
    const newCount = currentCount + 1;
    assessmentQuestionCounts.set(assessmentId, newCount);
    const remaining = Math.max(0, 5 - newCount);

    console.log(`[AI Chat Server] Question answered successfully (${newCount}/5)`);

    return {
      reply: replyText,
      used: newCount,
      remaining,
      maxAllowed: 5,
      limitReached: newCount >= 5,
    };
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }

    const msg = String(err?.message || '');
    console.error('[AI Chat Server] Gemini chat generation error:', msg);

    const mappedErr: any = new Error(msg || 'AI chat generation failed');
    if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid') || err?.status === 401 || err?.status === 403) {
      mappedErr.statusCode = 401;
      mappedErr.code = 'AUTH_FAILED';
      mappedErr.userMessage = 'Gemini authentication failed. Please check server GEMINI_API_KEY.';
    } else if (err?.status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      mappedErr.statusCode = 429;
      mappedErr.code = 'RATE_LIMIT';
      mappedErr.userMessage = 'Gemini rate limit or quota exceeded. Please try again shortly.';
    } else if (err?.status === 503 || msg.includes('UNAVAILABLE') || msg.includes('overloaded')) {
      mappedErr.statusCode = 503;
      mappedErr.code = 'SERVICE_UNAVAILABLE';
      mappedErr.userMessage = 'Gemini service is temporarily unavailable. Please try again.';
    } else {
      mappedErr.statusCode = 500;
      mappedErr.code = 'GEMINI_ERROR';
      mappedErr.userMessage = 'AI assistant is temporarily unavailable.';
    }

    throw mappedErr;
  }
}

