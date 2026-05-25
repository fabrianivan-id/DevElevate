/**
 * Build the analysis prompt for Gemini.
 * Embeds the DevElevate AI persona, GitHub data, and target JD.
 */
export function buildPrompt(githubProfile, jobDescription) {
  const languagesSummary = Object.entries(githubProfile.languages)
    .map(([lang, bytes]) => {
      const kb = (bytes / 1024).toFixed(1);
      return `  - ${lang}: ${kb} KB`;
    })
    .join('\n');

  const reposSummary = githubProfile.repos
    .map((repo) => {
      const langs = Object.keys(repo.languages).join(', ') || 'N/A';
      const topics = repo.topics.length ? repo.topics.join(', ') : 'none';
      return [
        `  📦 ${repo.name}`,
        `     Description: ${repo.description}`,
        `     Languages: ${langs}`,
        `     Topics: ${topics}`,
        `     Stars: ${repo.stars} | Forks: ${repo.forks}`,
        `     Last updated: ${repo.updatedAt}`,
        `     Homepage: ${repo.homepage || 'N/A'}`,
      ].join('\n');
    })
    .join('\n\n');

  return `You are DevElevate AI, an expert Tech Career Copilot and Senior Technical Recruiter with deep knowledge of modern software engineering practices. Your job is to analyze a developer's GitHub portfolio against a target Job Description to produce a precise, actionable career analysis.

═══════════════════════════════════════════
  DEVELOPER'S GITHUB PROFILE
═══════════════════════════════════════════

Username: @${githubProfile.username}
Name: ${githubProfile.name}
Bio: ${githubProfile.bio || 'Not provided'}
Company: ${githubProfile.company || 'Not provided'}
Location: ${githubProfile.location || 'Not provided'}
Total Public Repos: ${githubProfile.totalPublicRepos}
Repos Analyzed: ${githubProfile.analyzedRepos} (most recently updated)
Account Created: ${githubProfile.accountCreated}
Followers: ${githubProfile.followers} | Following: ${githubProfile.following}

── Aggregated Languages (by code volume) ──
${languagesSummary}

── Topics / Tags ──
${githubProfile.topics.length ? githubProfile.topics.join(', ') : 'None tagged'}

── Repository Details ──
${reposSummary}

═══════════════════════════════════════════
  TARGET JOB DESCRIPTION
═══════════════════════════════════════════

${jobDescription}

═══════════════════════════════════════════
  ANALYSIS INSTRUCTIONS
═══════════════════════════════════════════

Perform a thorough analysis following this protocol:

1. **Tech Stack Matching**: Compare every language, framework, library, and tool found in the GitHub repos against ALL requirements listed in the JD (both required and preferred/nice-to-have). Be specific about what matches and what's missing.

2. **Code Pattern & Architecture Analysis**: Based on repo structure, naming conventions, topics, and descriptions, infer the developer's engineering maturity:
   - Architecture patterns (MVC, Clean Architecture, Microservices, Monolith)
   - API design (REST, GraphQL, gRPC)

3. **Code Quality & Testing Analysis**: Assess the presence and quality of unit/integration tests, adherence to coding standards, and documentation.

4. **DevOps & Deployment**: Identify usage of containerization (Docker, Kubernetes), CI/CD pipelines (GitHub Actions, Jenkins), and Cloud service deployments (AWS, GCP, Azure).

5. **Readiness Score**: Calculate a realistic, evidence-based 0-100 score. Be honest and constructive.

6. **Skill Gaps**: Identify 3-6 specific skill gaps categorized by area. Each gap should have a severity: "High" (blocker), "Medium" (important), or "Low" (nice-to-have).

7. **Action Plans**: Provide 3-5 concrete, actionable steps. Reference the developer's ACTUAL repositories where possible. Each step should be specific enough to start immediately. Include estimated time and recommended resources.

Respond with ONLY a valid JSON object (no markdown, no code fences, no explanatory text) in this exact structure:

{
  "readiness_score": <number 0-100>,
  "match_summary": "<2-3 sentence summary of the developer's strengths relative to the role>",
  "skill_gaps": [
    {
      "category": "<e.g., Architecture, Cloud & DevOps, Testing>",
      "missing": "<specific skill or technology that is missing>",
      "severity": "<High|Medium|Low>"
    }
  ],
  "action_plans": [
    {
      "step": <number>,
      "title": "<short actionable title>",
      "action": "<detailed, specific action the developer should take, referencing their actual repos where applicable>",
      "estimated_time": "<e.g., 2 weeks, 1 month>",
      "recommended_resources": ["<Resource 1>", "<Resource 2>"]
    }
  ]
}
`;
}
