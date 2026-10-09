import { setCorsHeaders } from "./_lib/gemini.js";
async function handler(req, res) {
  setCorsHeaders(res);
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed. Use GET." });
  }
  const assessmentId = req.query?.assessmentId || "default";
  return res.status(200).json({
    assessmentId,
    maxAllowed: 5,
    note: "Server-side question limit (max 5) is enforced per assessment session on Vercel"
  });
}
export {
  handler as default
};
