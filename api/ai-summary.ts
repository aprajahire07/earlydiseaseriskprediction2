import { handleAiSummaryRequest, parseRequestBody, setCorsHeaders } from './_lib/gemini';

/**
 * Vercel Serverless Function: POST /api/ai-summary
 * Synthesizes automatic educational AI health summary from Render ML assessment
 */
export default async function handler(req: any, res: any) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed. Use POST.',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    const body = await parseRequestBody(req);

    if (!body || !body.assessment || !body.renderResult) {
      console.warn('[Vercel Serverless /api/ai-summary] Invalid request payload structure:', {
        hasBody: !!body,
        hasAssessment: !!body?.assessment,
        hasRenderResult: !!body?.renderResult,
      });
      return res.status(400).json({
        error: 'Missing assessment data or renderResult in payload.',
        code: 'BAD_REQUEST',
      });
    }

    const result = await handleAiSummaryRequest(body);
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err?.statusCode || 500;
    const code = err?.code || 'INTERNAL_ERROR';
    const message = err?.userMessage || err?.message || 'AI Health Summary is temporarily unavailable.';

    console.error(`[Vercel Serverless /api/ai-summary] Failure (HTTP ${status}, code: ${code}):`, err?.message || err);

    return res.status(status).json({
      error: message,
      code,
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined,
    });
  }
}
