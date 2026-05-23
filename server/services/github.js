const GITHUB_API = 'https://api.github.com';
const MAX_REPOS = 10;

/**
 * Fetch a user's public repos, sorted by most recently updated.
 */
async function fetchUserRepos(username) {
  const url = `${GITHUB_API}/users/${username}/repos?sort=updated&direction=desc&per_page=${MAX_REPOS}&type=owner`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'DevElevate-App',
    },
  });

  if (res.status === 404) {
    throw new Error(`GitHub user "${username}" not found.`);
  }

  if (res.status === 403 && res.headers.get('x-ratelimit-remaining') === '0') {
    throw new Error('GitHub API rate limit exceeded.');
  }

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch languages for a specific repo.
 */
async function fetchRepoLanguages(owner, repo) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/languages`;

  const res = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'DevElevate-App',
    },
  });

  if (!res.ok) return {};
  return res.json();
}

/**
 * Build a comprehensive GitHub profile from public data.
 * Returns structured data optimized for LLM analysis.
 */
export async function buildGitHubProfile(username) {
  // Fetch basic user info
  const userRes = await fetch(`${GITHUB_API}/users/${username}`, {
    headers: {
      'Accept': 'application/vnd.github+json',
      'User-Agent': 'DevElevate-App',
    },
  });

  if (userRes.status === 404) {
    throw new Error(`GitHub user "${username}" not found.`);
  }

  if (userRes.status === 403) {
    throw new Error('GitHub API rate limit exceeded.');
  }

  const userData = await userRes.json();

  // Fetch repos
  const repos = await fetchUserRepos(username);

  if (!repos.length) {
    throw new Error(`GitHub user "${username}" has no public repositories to analyze.`);
  }

  // Fetch languages for each repo in parallel
  const repoDetails = await Promise.all(
    repos.map(async (repo) => {
      const languages = await fetchRepoLanguages(username, repo.name);
      return {
        name: repo.name,
        description: repo.description || 'No description',
        languages,
        topics: repo.topics || [],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        hasWiki: repo.has_wiki,
        hasPages: repo.has_pages,
        license: repo.license?.spdx_id || null,
        size: repo.size,
        defaultBranch: repo.default_branch,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at,
        homepage: repo.homepage || null,
      };
    })
  );

  // Aggregate all languages across repos
  const aggregatedLanguages = {};
  for (const repo of repoDetails) {
    for (const [lang, bytes] of Object.entries(repo.languages)) {
      aggregatedLanguages[lang] = (aggregatedLanguages[lang] || 0) + bytes;
    }
  }

  // Sort languages by bytes (descending)
  const sortedLanguages = Object.fromEntries(
    Object.entries(aggregatedLanguages).sort(([, a], [, b]) => b - a)
  );

  // Collect all unique topics
  const allTopics = [...new Set(repoDetails.flatMap((r) => r.topics))];

  return {
    username: userData.login,
    name: userData.name || userData.login,
    bio: userData.bio || null,
    company: userData.company || null,
    location: userData.location || null,
    publicReposUrl: userData.html_url,
    totalPublicRepos: userData.public_repos,
    analyzedRepos: repoDetails.length,
    followers: userData.followers,
    following: userData.following,
    accountCreated: userData.created_at,
    languages: sortedLanguages,
    topics: allTopics,
    repos: repoDetails,
  };
}
