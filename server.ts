import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// In-memory tracking for assessment question counts: assessmentId -> count (strictly max 5)
const assessmentQuestionCounts = new Map<string, number>();

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Helper: Intelligent clinical education generator for when Gemini has network/latency timeout
function generateClinicalSummaryFallback(assessment: any, renderResult: any): string {
  const risk = renderResult.risk_level || 'Moderate';
  const disease = renderResult.target_disease || 'Cardiovascular & Metabolic Health';
  const bmi = assessment.bmi || 24;
  const bp = assessment.bloodPressure || 'Normal';
  const act = assessment.physicalActivity || 'Moderate';

  return `Based on your clinical ML evaluation, your overall profile indicates a ${risk} risk level, with primary attention directed toward ${disease}. Your recorded Body Mass Index of ${bmi} and resting blood pressure category (${bp}) are key contributing factors analyzed by the model.\n\nTo proactively support your long-term health, focus on consistent daily physical movement (${act.toLowerCase().includes('active') ? 'maintaining your active routine' : 'aiming for 150 minutes of weekly aerobic exercise'}), a balanced diet rich in whole grains and lean proteins, and monitoring your resting blood pressure twice monthly. Please share these findings with your primary healthcare provider for comprehensive clinical oversight.`;
}

function generateClinicalChatFallback(question: string, assessment: any, renderResult: any): string {
  const q = question.toLowerCase();
  const risk = renderResult.risk_level || 'Moderate';
  const disease = renderResult.target_disease || 'Cardiovascular & Metabolic Health';
  const bmi = assessment.bmi || 24;
  const bp = assessment.bloodPressure || 'Normal';
  const act = assessment.physicalActivity || 'Moderate';
  const smoking = assessment.smokingHabit || 'Never';

  if (q.includes('why') || q.includes('result') || q.includes('reason')) {
    return `Your assessment resulted in ${risk} risk because the machine learning model weighed your vital indicators together. The primary drivers include your blood pressure (${bp}), BMI (${bmi}), and physical activity level (${act}). Together, these parameters most closely matched patterns in ${disease}.`;
  }
  if (q.includes('improve') || q.includes('first') || q.includes('next') || q.includes('step')) {
    return `The most impactful first step is establishing consistent aerobic exercise (such as brisk walking for 30 minutes, 5 days a week) and monitoring your sodium intake to support healthy arterial pressure. Even small, sustainable lifestyle shifts can significantly enhance your cardiovascular health index.`;
  }
  if (q.includes('bmi') || q.includes('weight')) {
    const bmiVal = parseFloat(bmi);
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

// Endpoint 1: Automatic AI Health Summary
app.post('/api/ai-summary', async (req, res) => {
  try {
    const { assessment, renderResult } = req.body;
    if (!assessment || !renderResult) {
      return res.status(400).json({ error: 'Missing assessment data or render result' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const prompt = `You are a certified preventive health educator.
Analyze this user's clinical ML assessment results and write a concise, empowering, 2-paragraph educational explanation.

CLINICAL ML GROUND TRUTH (RENDER MODEL RESULT — DO NOT ALTER):
- Risk Level: ${renderResult.risk_level}
- Target Condition Focus: ${renderResult.target_disease}
- Risk Percentage: ${renderResult.risk_percentage}
- Health Index: ${renderResult.health_index ?? 'N/A'}/100
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
2. Explain how their specific lifestyle factors (BMI, blood pressure, physical activity, family history) relate to the Render risk score.
3. Keep the tone calm, constructive, and educational.`;

        // Promise with 7-second timeout for fast responsive UX
        const genPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 7000));
        const result: any = await Promise.race([genPromise, timeoutPromise]);

        if (result && result.text) {
          return res.json({ summary: result.text.trim() });
        }
      } catch (err) {
        console.warn('Gemini summary call error, using clinical generator:', err);
      }
    }

    // High quality clinical educational summary fallback
    const fallbackSummary = generateClinicalSummaryFallback(assessment, renderResult);
    res.json({ summary: fallbackSummary });
  } catch (err: any) {
    console.error('AI summary error:', err);
    res.status(500).json({ error: 'AI summary temporarily unavailable.' });
  }
});

// Endpoint 2: Check remaining questions for an assessment
app.get('/api/ai-chat-status/:assessmentId', (req, res) => {
  const { assessmentId } = req.params;
  const count = assessmentQuestionCounts.get(assessmentId) || 0;
  const remaining = Math.max(0, 5 - count);
  res.json({
    used: count,
    remaining,
    maxAllowed: 5,
    limitReached: count >= 5,
  });
});

// Endpoint 3: Interactive Inline AI Chat (strictly max 5 user questions per assessment)
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { assessmentId, assessment, renderResult, messages, question } = req.body;

    if (!assessmentId || !question) {
      return res.status(400).json({ error: 'Missing assessmentId or question' });
    }

    // SERVER-SIDE RATE LIMIT: Enforce max 5 user messages per assessment
    const currentCount = assessmentQuestionCounts.get(assessmentId) || 0;
    if (currentCount >= 5) {
      return res.status(429).json({
        error: "You've reached the 5-question limit for this assessment.",
        limitReached: true,
        remaining: 0,
      });
    }

    let replyText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        const systemInstruction = `You are an educational preventive health assistant for the Early Disease Risk Prediction platform.
You are helping the user understand their recent clinical ML assessment result in an inline chat.

AUTHORITATIVE ASSESSMENT CONTEXT (DO NOT OVERRIDE OR RECALCULATE):
- Target Condition Focus: ${renderResult?.target_disease || 'General Health'}
- Predicted Risk Level: ${renderResult?.risk_level || 'Evaluated'}
- Calculated Risk Percentage: ${renderResult?.risk_percentage || 'N/A'}
- Health Index: ${renderResult?.health_index ?? 'N/A'}/100
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
2. NEVER recalculate or alter the Render risk result. If asked to recalculate or change the score, explain: "Your risk result comes from the assessment model. I can explain the existing result, but I can't replace or recalculate it." Suggest "Start a New Assessment" if their vitals changed.
3. If the user reports acute emergency symptoms (severe chest pain, sudden numbness, difficulty breathing), immediately advise seeking emergency medical services.
4. Keep answers concise, direct, helpful, and under 130 words so it fits comfortably in the compact chat UI.
5. If the user asks something completely unrelated to health or this assessment, respond:
   "I can help explain your health assessment and related general health information. Try asking me something about your result."`;

        const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

        if (Array.isArray(messages)) {
          for (const msg of messages) {
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

        const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 7000));
        const aiRes: any = await Promise.race([genPromise, timeoutPromise]);

        if (aiRes && aiRes.text) {
          replyText = aiRes.text.trim();
        }
      } catch (geminiErr) {
        console.warn('Gemini chat call error, using clinical chat generator:', geminiErr);
      }
    }

    if (!replyText) {
      replyText = generateClinicalChatFallback(question, assessment, renderResult);
    }

    // ONLY increment count upon SUCCESSFUL generation
    const newCount = currentCount + 1;
    assessmentQuestionCounts.set(assessmentId, newCount);

    const remaining = Math.max(0, 5 - newCount);

    res.json({
      reply: replyText,
      used: newCount,
      remaining,
      maxAllowed: 5,
      limitReached: newCount >= 5,
    });
  } catch (err: any) {
    console.error('AI chat error:', err);
    // On failure, do NOT consume user's message quota
    res.status(500).json({ error: 'AI is temporarily unavailable.' });
  }
});

async function start() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Application server running on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
});
