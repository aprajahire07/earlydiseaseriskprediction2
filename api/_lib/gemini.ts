import { GoogleGenAI } from '@google/genai';

// In-memory tracking for assessment question counts: assessmentId -> count (strictly max 5)
const assessmentQuestionCounts = new Map<string, number>();

/**
 * Retrieves the Gemini API key from server environment variables.
 * Checks GEMINI_API_KEY first, followed by GOOGLE_API_KEY as an official server-side alias.
 * Sanitizes quotation marks and whitespace. NEVER exposed to client.
 */
export function getGeminiApiKey(): string | null {
  const rawKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!rawKey) return null;
  const key = rawKey.trim().replace(/^["']|["']$/g, '').trim();
  if (key.length > 0 && key !== 'MY_GEMINI_API_KEY') {
    return key;
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
 * Executes a Gemini request with automatic multi-model resilience.
 * Uses GEMINI_MODEL if configured, otherwise falls back gracefully through the available models:
 * 'gemini-3.1-flash-lite' (proven high responsiveness and quota availability),
 * 'gemini-flash-lite-latest', 'gemini-3.8-flash', and 'gemini-flash-latest'.
 * Guarantees reliable production uptime even under serverless environments and upstream quota limits.
 */
export async function callGeminiWithResilience(
  ai: GoogleGenAI,
  requestParams: { contents: any; config?: any }
): Promise<{ response: any; model: string }> {
  const configuredModel = (process.env.GEMINI_MODEL || '').trim();
  const candidateModels: string[] = [];

  if (configuredModel) {
    candidateModels.push(configuredModel);
  }
  // Prioritized fallback list: gemini-3.1-flash-lite is the fastest and most available model
  const standardFallbacks = [
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];
  for (const m of standardFallbacks) {
    if (!candidateModels.includes(m)) {
      candidateModels.push(m);
    }
  }

  // Ensure default fast token limit for serverless execution if not provided
  const mergedConfig = {
    maxOutputTokens: 350,
    temperature: 0.3,
    ...(requestParams.config || {}),
  };

  let lastError: any = null;
  const attemptedModels: string[] = [];

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    attemptedModels.push(model);
    console.log(`[Gemini Server Diagnostics] Selected Gemini model: ${model} (Candidate ${i + 1}/${candidateModels.length})`);
    console.log(`[Gemini Server Diagnostics] Gemini request started at: ${new Date().toISOString()}`);

    const startTime = Date.now();
    try {
      // 7.5s per-model timeout to guarantee response within Vercel serverless window
      const modelPromise = ai.models.generateContent({
        ...requestParams,
        config: mergedConfig,
        model,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`GEMINI_TIMEOUT_ON_${model}`)), 7500)
      );

      const response = await Promise.race([modelPromise, timeoutPromise]);
      const elapsedMs = Date.now() - startTime;
      console.log(`[Gemini Server Diagnostics] Gemini response status: SUCCESS (HTTP 200 equivalent) in ${elapsedMs}ms with model: ${model}`);
      return { response, model };
    } catch (err: any) {
      const elapsedMs = Date.now() - startTime;
      lastError = err;
      const status = err?.status || err?.statusCode || (String(err?.message || '').includes('TIMEOUT') ? 504 : 'UNKNOWN');
      const rawMsg = String(err?.message || '');
      console.warn(`[Gemini Server Diagnostics] Model ${model} failed after ${elapsedMs}ms (status: ${status}, error category: ${rawMsg.slice(0, 180)})`);

      // If this is an authentication error (invalid API key), stop retries to avoid wasting time
      if (
        status === 401 ||
        status === 403 ||
        rawMsg.includes('API_KEY_INVALID') ||
        rawMsg.includes('API key not valid') ||
        rawMsg.includes('invalid api key')
      ) {
        console.error('[Gemini Server Diagnostics] Halting model retries: Gemini API key is invalid or rejected by Google API.');
        throw err;
      }

      // If we have more models, continue fallback loop
      if (i < candidateModels.length - 1) {
        console.log(`[Gemini Server Diagnostics] Falling back to next resilient model: ${candidateModels[i + 1]}`);
      }
    }
  }

  if (lastError) {
    lastError.attemptedModels = attemptedModels;
  }
  throw lastError;
}

/**
 * Handle AI Health Summary generation grounded strictly in Render ML assessment
 */
export async function handleAiSummaryRequest(reqBody: any): Promise<{ summary: string; modelUsed?: string }> {
  console.log('[AI Summary Server Diagnostics] AI endpoint reached: /api/ai-summary');

  const { assessment, renderResult } = reqBody || {};

  if (!assessment || !renderResult) {
    console.warn('[AI Summary Server Diagnostics] Request validation result: FAIL (Missing assessment data or renderResult in payload)');
    const badReqError: any = new Error('Missing assessment data or renderResult in payload.');
    badReqError.statusCode = 400;
    badReqError.code = 'BAD_REQUEST';
    badReqError.userMessage = 'Assessment input and Render ML predictions are required.';
    throw badReqError;
  }

  console.log('[AI Summary Server Diagnostics] Request validation result: PASS');

  const apiKey = getGeminiApiKey();
  const hasKey = !!apiKey;
  console.log(`[AI Summary Server Diagnostics] GEMINI_API_KEY exists: ${hasKey} (Server environment check: ${hasKey ? 'configured' : 'missing'})`);

  if (!apiKey) {
    console.error('[AI Summary Server Diagnostics] Actual error category: MISSING_API_KEY - process.env.GEMINI_API_KEY is not set on the server.');
    const configError: any = new Error('AI service is not configured on the server. GEMINI_API_KEY is missing.');
    configError.statusCode = 503;
    configError.code = 'MISSING_API_KEY';
    configError.userMessage = 'AI service is not configured on the server (GEMINI_API_KEY missing).';
    throw configError;
  }

  try {
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
Explain the provided results in simple, clear, empowering language (2 to 3 concise paragraphs).
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
- Blood Pressure: ${assessment.bloodPressure || 'N/A'}
- Physical Activity: ${assessment.physicalActivity || 'N/A'}
- Smoking Habit: ${assessment.smokingHabit || 'N/A'}
- Blood Sugar: ${assessment.bloodSugar || 'Normal'}
- Family History: ${assessment.familyHistory || 'None reported'}

Instructions:
1. Explain what the evaluated disease risk probabilities from the Render ML model signify in clear language.
2. Discuss how the user's reported vitals and habits relate to these statistical findings.
3. Offer 2-3 positive preventive lifestyle habits.
4. Conclude with a reminder that this is an educational ML statistical model, not a medical diagnosis.`;

    const { response, model: modelUsed } = await callGeminiWithResilience(ai, {
      contents: prompt,
      config: {
        maxOutputTokens: 350,
        temperature: 0.3,
      },
    });

    const summaryText = response.text?.trim();
    if (!summaryText) {
      console.error('[AI Summary Server Diagnostics] Gemini response parsing result: FAIL (Empty text generated)');
      const emptyError: any = new Error('AI service returned an empty explanation.');
      emptyError.statusCode = 502;
      emptyError.code = 'EMPTY_RESPONSE';
      emptyError.userMessage = 'AI service returned an empty response. Please try again.';
      throw emptyError;
    }

    console.log(`[AI Summary Server Diagnostics] Gemini response parsing result: PASS (${summaryText.length} characters parsed) using ${modelUsed}`);
    return { summary: summaryText, modelUsed };
  } catch (err: any) {
    if (err.statusCode) {
      throw err;
    }

    const msg = String(err?.message || '');
    const status = err?.status || err?.statusCode || 500;
    console.error(`[AI Summary Server Diagnostics] Actual error category/message: HTTP ${status} - ${msg}`);

    const mappedErr: any = new Error(msg || 'AI summary generation failed');
    mappedErr.modelAttempted = err?.attemptedModels || 'gemini-3.1-flash-lite';

    if (
      msg.includes('API_KEY_INVALID') ||
      msg.includes('API key not valid') ||
      msg.includes('invalid api key') ||
      status === 401 ||
      status === 403
    ) {
      mappedErr.statusCode = 401;
      mappedErr.code = 'AUTH_FAILED';
      mappedErr.actualError = 'Google Gemini API key was rejected as invalid or unauthorized.';
      mappedErr.userMessage = 'Gemini authentication error: Please verify GEMINI_API_KEY in Vercel Environment Variables.';
    } else if (status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      mappedErr.statusCode = 429;
      mappedErr.code = 'RATE_LIMIT';
      mappedErr.actualError = 'Gemini API rate limit or billing quota exceeded.';
      mappedErr.userMessage = 'Gemini rate limit exceeded. Please wait a moment and try again.';
    } else if (msg.includes('TIMEOUT')) {
      mappedErr.statusCode = 504;
      mappedErr.code = 'TIMEOUT';
      mappedErr.actualError = 'Gemini upstream generation exceeded execution deadline.';
      mappedErr.userMessage = 'AI summary timed out. Please try again.';
    } else if (status === 503 || msg.includes('UNAVAILABLE') || msg.includes('overloaded')) {
      mappedErr.statusCode = 503;
      mappedErr.code = 'SERVICE_UNAVAILABLE';
      mappedErr.actualError = 'Gemini model service is currently experiencing upstream demand spikes.';
      mappedErr.userMessage = 'Gemini service is temporarily unavailable. Please try again.';
    } else if (status === 404 || msg.includes('not found') || msg.includes('no longer available')) {
      mappedErr.statusCode = 404;
      mappedErr.code = 'MODEL_UNAVAILABLE';
      mappedErr.actualError = `Selected Gemini model is not accessible: ${msg.slice(0, 100)}`;
      mappedErr.userMessage = 'Configured AI model is unavailable. Falling back automatically.';
    } else {
      mappedErr.statusCode = 500;
      mappedErr.code = 'GEMINI_ERROR';
      mappedErr.actualError = msg.slice(0, 200);
      mappedErr.userMessage = 'AI summary generation encountered an error. Please try again.';
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
  const hasKey = !!apiKey;
  console.log(`[AI Chat Server] Endpoint reached. Validation: PASS. GEMINI_API_KEY present: ${hasKey}. Question ${currentCount + 1}/5 for assessment ${assessmentId}`);

  if (!apiKey) {
    console.error('[AI Chat Server] GEMINI_API_KEY is not configured in server environment variables.');
    const configError: any = new Error('AI service is not configured on the server. GEMINI_API_KEY is missing.');
    configError.statusCode = 503;
    configError.code = 'MISSING_API_KEY';
    configError.userMessage = 'AI assistant is not configured on the server (GEMINI_API_KEY missing).';
    throw configError;
  }

  try {
    console.log(`[AI Chat Server] Gemini request started for question ${currentCount + 1}/5`);
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

    const { response, model: modelUsed } = await callGeminiWithResilience(ai, {
      contents,
      config: {
        systemInstruction,
        maxOutputTokens: 250,
        temperature: 0.4,
      },
    });

    const replyText = response.text?.trim();
    if (!replyText) {
      console.error('[AI Chat Server Diagnostics] Gemini chat response parsing result: FAIL (Empty answer generated)');
      const emptyError: any = new Error('AI service returned an empty answer.');
      emptyError.statusCode = 502;
      emptyError.code = 'EMPTY_RESPONSE';
      emptyError.userMessage = 'AI assistant returned an empty response. Please try again.';
      throw emptyError;
    }

    // Increment counter ONLY upon successful generation
    const newCount = currentCount + 1;
    assessmentQuestionCounts.set(assessmentId, newCount);
    const remaining = Math.max(0, 5 - newCount);

    console.log(`[AI Chat Server Diagnostics] Gemini chat response status: PASS (${replyText.length} chars) using ${modelUsed} (${newCount}/5 answered)`);

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
    const status = err?.status || err?.statusCode || 500;
    console.error(`[AI Chat Server Diagnostics] Actual error category/message: HTTP ${status} - ${msg}`);

    const mappedErr: any = new Error(msg || 'AI chat generation failed');
    mappedErr.modelAttempted = err?.attemptedModels || 'gemini-3.1-flash-lite';

    if (
      msg.includes('API_KEY_INVALID') ||
      msg.includes('API key not valid') ||
      msg.includes('invalid api key') ||
      status === 401 ||
      status === 403
    ) {
      mappedErr.statusCode = 401;
      mappedErr.code = 'AUTH_FAILED';
      mappedErr.actualError = 'Google Gemini API key was rejected as invalid or unauthorized.';
      mappedErr.userMessage = 'Gemini authentication error: Please verify GEMINI_API_KEY in Vercel Environment Variables.';
    } else if (status === 429 || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
      mappedErr.statusCode = 429;
      mappedErr.code = 'RATE_LIMIT';
      mappedErr.actualError = 'Gemini API rate limit or billing quota exceeded.';
      mappedErr.userMessage = 'Gemini rate limit exceeded. Please wait a moment and try again.';
    } else if (msg.includes('TIMEOUT')) {
      mappedErr.statusCode = 504;
      mappedErr.code = 'TIMEOUT';
      mappedErr.actualError = 'Gemini upstream chat generation exceeded execution deadline.';
      mappedErr.userMessage = 'AI assistant timed out. Please try again.';
    } else if (status === 503 || msg.includes('UNAVAILABLE') || msg.includes('overloaded')) {
      mappedErr.statusCode = 503;
      mappedErr.code = 'SERVICE_UNAVAILABLE';
      mappedErr.actualError = 'Gemini model service is currently experiencing upstream demand spikes.';
      mappedErr.userMessage = 'Gemini service is temporarily unavailable. Please try again.';
    } else if (status === 404 || msg.includes('not found') || msg.includes('no longer available')) {
      mappedErr.statusCode = 404;
      mappedErr.code = 'MODEL_UNAVAILABLE';
      mappedErr.actualError = `Selected Gemini model is not accessible: ${msg.slice(0, 100)}`;
      mappedErr.userMessage = 'Configured AI model is unavailable. Falling back automatically.';
    } else {
      mappedErr.statusCode = 500;
      mappedErr.code = 'GEMINI_ERROR';
      mappedErr.actualError = msg.slice(0, 200);
      mappedErr.userMessage = 'AI assistant encountered an error. Please try again.';
    }

    throw mappedErr;
  }
}

