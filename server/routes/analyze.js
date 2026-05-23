import { Router } from 'express';
import { buildGitHubProfile } from '../services/github.js';
import { analyzeWithGemini } from '../services/gemini.js';

const router = Router();

router.post('/analyze', async (req, res) => {
  const { githubUsername, jobDescription } = req.body;

  // Validate input
  if (!githubUsername || typeof githubUsername !== 'string' || !githubUsername.trim()) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'GitHub username is required.',
    });
  }

  if (!jobDescription || typeof jobDescription !== 'string' || !jobDescription.trim()) {
    return res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: 'Job Description is required.',
    });
  }

  const username = githubUsername.trim();

  try {
    console.log(`\n📡 Analyzing GitHub profile: ${username}`);

    // Step 1: Fetch GitHub profile data
    const profile = await buildGitHubProfile(username);
    console.log(`  ✅ Fetched ${profile.analyzedRepos} repos for @${username}`);

    // Step 2: Analyze with Gemini
    console.log(`  🤖 Sending to Gemini for analysis...`);
    const analysis = await analyzeWithGemini(profile, jobDescription.trim());
    console.log(`  ✅ Analysis complete — Readiness Score: ${analysis.readiness_score}%`);

    return res.json({
      success: true,
      data: analysis,
      meta: {
        username: profile.username,
        analyzedRepos: profile.analyzedRepos,
        totalPublicRepos: profile.totalPublicRepos,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error(`  ❌ Error:`, err.message);

    // GitHub 404
    if (err.message.includes('not found')) {
      return res.status(404).json({
        error: 'GITHUB_USER_NOT_FOUND',
        message: `GitHub user "${username}" was not found. Please check the username and try again.`,
      });
    }

    // GitHub rate limit
    if (err.message.includes('rate limit')) {
      return res.status(429).json({
        error: 'GITHUB_RATE_LIMITED',
        message: 'GitHub API rate limit exceeded. Please wait a few minutes and try again.',
      });
    }

    // Gemini API errors
    if (err.message.includes('GEMINI')) {
      return res.status(502).json({
        error: 'GEMINI_ERROR',
        message: 'The AI analysis service encountered an error. Please try again.',
      });
    }

    // Generic error
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
});

export default router;
