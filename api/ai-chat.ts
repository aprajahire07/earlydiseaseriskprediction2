import { handleAiChatRequest, setCorsHeaders } from './_lib/gemini';

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
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (parseErr) {
        return res.status(400).json({ error: 'Malformed JSON payload' });
      }
    }

    if (!body || !body.assessmentId || !body.question) {
      return res.status(400).json({ error: 'Missing assessmentId or question in payload.' });
    }

    const result = await handleAiChatRequest(body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Vercel Serverless /api/ai-chat] Error:', err?.message || err);

    if (err?.statusCode === 429 || err?.limitReached) {
      return res.status(429).json({
        error: err.message || "You've reached the 5-question limit for this assessment.",
        limitReached: true,
        remaining: 0,
      });
    }

    return res.status(500).json({
      error: 'AI Assistant is temporarily unavailable. Please try again.',
    });
  }
}
