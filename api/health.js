import { setCorsHeaders } from "./_lib/gemini.js";
async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  return res.status(200).json({ status: "ok", runtime: "vercel-serverless" });
}
export {
  handler as default
};
