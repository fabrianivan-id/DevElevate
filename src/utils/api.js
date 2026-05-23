/**
 * DevElevate — API Client
 * Handles communication with the Express backend.
 */

const ANALYZE_ENDPOINT = '/api/analyze';
const REQUEST_TIMEOUT = 60000; // 60s — Gemini can be slow

/**
 * Send a GitHub username + Job Description for analysis.
 * Returns the analysis result or throws an error.
 */
export async function analyzeProfile(githubUsername, jobDescription) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(ANALYZE_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubUsername, jobDescription }),
      signal: controller.signal,
    });

    const body = await res.json();

    if (!res.ok) {
      throw new Error(body.message || `Request failed with status ${res.status}`);
    }

    if (!body.success || !body.data) {
      throw new Error('Invalid response from server.');
    }

    return body;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Analysis timed out. The AI service is taking too long — please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
