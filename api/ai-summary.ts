import { handleAiSummaryRequest, setCorsHeaders } from './_lib/gemini';

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

    if (!body || !body.assessment || !body.renderResult) {
      return res.status(400).json({ error: 'Missing assessment data or renderResult in payload.' });
    }

    const result = await handleAiSummaryRequest(body);
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[Vercel Serverless /api/ai-summary] Error:', err?.message || err);
    return res.status(500).json({
      error: 'AI Health Summary is temporarily unavailable. Please try again.',
    });
  }
}
