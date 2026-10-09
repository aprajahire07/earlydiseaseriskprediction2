import { handleAiChatRequest, parseRequestBody, setCorsHeaders } from "./_lib/gemini.js";
async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method Not Allowed. Use POST.",
      code: "METHOD_NOT_ALLOWED"
    });
  }
  try {
    const body = await parseRequestBody(req);
    const question = (body?.question || body?.message || "").trim();
    const assessmentId = body?.assessmentId || "assessment-session";
    if (!question) {
      return res.status(400).json({
        error: "Missing question in payload.",
        code: "BAD_REQUEST"
      });
    }
    const result = await handleAiChatRequest({
      ...body,
      question,
      assessmentId
    });
    return res.status(200).json(result);
  } catch (err) {
    const status = err?.statusCode || 500;
    const code = err?.code || (err?.limitReached ? "LIMIT_REACHED" : "INTERNAL_ERROR");
    const message = err?.userMessage || err?.message || "AI Assistant is temporarily unavailable.";
    console.error(`[Vercel Serverless /api/ai-chat] Failure (HTTP ${status}, code: ${code}):`, err?.message || err);
    return res.status(status).json({
      error: message,
      code,
      actualError: err?.actualError || err?.message,
      errorCategory: code,
      modelAttempted: err?.modelAttempted,
      limitReached: !!err?.limitReached,
      remaining: err?.remaining ?? 0,
      details: err?.message
    });
  }
}
export {
  handler as default
};
