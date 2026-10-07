import { setCorsHeaders } from './_lib/gemini';

export default async function handler(req: any, res: any) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  return res.status(200).json({ status: 'ok', runtime: 'vercel-serverless' });
}
