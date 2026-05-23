import { buildPrompt } from '../utils/prompt.js';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Send the GitHub profile + JD to Gemini for analysis.
 * Returns the parsed JSON analysis object.
 */
export async function analyzeWithGemini(githubProfile, jobDescription) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('GEMINI: API key is not configured. Set GEMINI_API_KEY in your .env file.');
  }

  const prompt = buildPrompt(githubProfile, jobDescription);

  const requestBody = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 4096,
      responseMimeType: 'application/json',
    },
  };

  let lastError = null;

  // Retry once on failure
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000), // 30s timeout
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(
          `GEMINI: API returned ${res.status} — ${errData.error?.message || res.statusText}`
        );
      }

      const data = await res.json();

      // Extract the generated text
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('GEMINI: No content returned from API.');
      }

      // Parse JSON (handle possible markdown code fences)
      const jsonStr = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const analysis = JSON.parse(jsonStr);

      // Validate required fields
      if (
        typeof analysis.readiness_score !== 'number' ||
        !analysis.match_summary ||
        !Array.isArray(analysis.skill_gaps) ||
        !Array.isArray(analysis.action_plans)
      ) {
        throw new Error('GEMINI: Response missing required fields.');
      }

      // Clamp score to 0-100
      analysis.readiness_score = Math.max(0, Math.min(100, Math.round(analysis.readiness_score)));

      return analysis;
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        console.log(`  ⚠️  Gemini attempt 1 failed, retrying...`);
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  throw lastError;
}
