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
      return res.status(400).json({ error: 'Missing assessment data or render result' });
    }

    const result = await handleAiSummaryRequest(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('AI summary error:', err?.message || err);
    res.status(500).json({ error: 'AI summary temporarily unavailable.' });
  }
});

// Endpoint 2: Interactive Inline AI Chat (strictly max 5 user questions per assessment)
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { assessmentId, question } = req.body || {};

    if (!assessmentId || !question) {
      return res.status(400).json({ error: 'Missing assessmentId or question' });
    }

    const result = await handleAiChatRequest(req.body);
    res.json(result);
  } catch (err: any) {
    console.error('AI chat error:', err?.message || err);

    if (err?.statusCode === 429 || err?.limitReached) {
      return res.status(429).json({
        error: err.message || "You've reached the 5-question limit for this assessment.",
        limitReached: true,
        remaining: 0,
      });
    }

    // On server failure, do NOT consume user quota
    res.status(500).json({ error: 'AI is temporarily unavailable. Please try again.' });
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
