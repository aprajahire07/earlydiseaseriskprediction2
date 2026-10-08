import { handleAiChatRequest, parseRequestBody, setCorsHeaders } from './_lib/gemini';

/**
 * Vercel Serverless Function: POST /api/ai-chat
 * Handles interactive inline educational AI chat with strict server-side 5-message limit
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
    const question = (body?.question || body?.message || '').trim();
    const assessmentId = body?.assessmentId || 'assessment-session';

    if (!question) {
      return res.status(400).json({
        error: 'Missing question in payload.',
        code: 'BAD_REQUEST',
      });
    }

    const result = await handleAiChatRequest({
      ...body,
      question,
      assessmentId,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    const status = err?.statusCode || 500;
    const code = err?.code || (err?.limitReached ? 'LIMIT_REACHED' : 'INTERNAL_ERROR');
    const message = err?.userMessage || err?.message || 'AI Assistant is temporarily unavailable.';

    console.error(`[Vercel Serverless /api/ai-chat] Failure (HTTP ${status}, code: ${code}):`, err?.message || err);

    return res.status(status).json({
      error: message,
      code,
      limitReached: !!err?.limitReached,
      remaining: err?.remaining ?? 0,
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined,
    });
  }
}
