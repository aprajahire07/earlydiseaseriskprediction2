import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleAiSummaryRequest, handleAiChatRequest } from './api/_lib/gemini';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', server: 'express-local' });
});

// Endpoint 1: Automatic AI Health Summary
app.post('/api/ai-summary', async (req, res) => {
  try {
    const { assessment, renderResult } = req.body || {};
    if (!assessment || !renderResult) {
      return res.status(400).json({
        error: 'Missing assessment data or renderResult in payload.',
        code: 'BAD_REQUEST',
      });
    }

    const result = await handleAiSummaryRequest(req.body);
    res.json(result);
  } catch (err: any) {
    const status = err?.statusCode || 500;
    const code = err?.code || 'INTERNAL_ERROR';
    const message = err?.userMessage || err?.message || 'AI summary is temporarily unavailable.';
    console.error(`[Express /api/ai-summary] Failure (HTTP ${status}, code: ${code}):`, err?.message || err);
    res.status(status).json({
      error: message,
      code,
      details: err?.message,
    });
  }
});

// Endpoint 2: Interactive Inline AI Chat (strictly max 5 user questions per assessment)
app.post('/api/ai-chat', async (req, res) => {
  try {
    const question = (req.body?.question || req.body?.message || '').trim();
    const assessmentId = req.body?.assessmentId || 'assessment-session';

    if (!question) {
      return res.status(400).json({
        error: 'Missing question in payload.',
        code: 'BAD_REQUEST',
      });
    }

    const result = await handleAiChatRequest({
      ...req.body,
      question,
      assessmentId,
    });
    res.json(result);
  } catch (err: any) {
    const status = err?.statusCode || 500;
    const code = err?.code || (err?.limitReached ? 'LIMIT_REACHED' : 'INTERNAL_ERROR');
    const message = err?.userMessage || err?.message || 'AI Assistant is temporarily unavailable.';
    console.error(`[Express /api/ai-chat] Failure (HTTP ${status}, code: ${code}):`, err?.message || err);

    res.status(status).json({
      error: message,
      code,
      limitReached: !!err?.limitReached,
      remaining: err?.remaining ?? 0,
      details: err?.message,
    });
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
