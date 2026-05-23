/**
 * DevElevate — Main Application
 * Orchestrates the form → loading → results flow.
 */

import { analyzeProfile } from './utils/api.js';
import { renderForm, setFormLoading } from './components/form.js';
import { renderLoader, destroyLoader } from './components/loader.js';
import { renderScoreCard } from './components/scoreCard.js';
import { renderSummary } from './components/summary.js';
import { renderSkillGaps } from './components/skillGaps.js';
import { renderActionPlan } from './components/actionPlan.js';

const app = document.getElementById('app');

// App state
let currentView = 'form'; // 'form' | 'loading' | 'results' | 'error'

/**
 * Initialize the application.
 */
function init() {
  renderShell();
  renderForm(document.getElementById('main-content'), handleSubmit);
}

/**
 * Render the app shell (header + footer).
 */
function renderShell() {
  app.innerHTML = `
    <header class="header">
      <div class="container header-inner">
        <div class="logo">
          <div class="logo-icon">⚡</div>
          <span class="logo-text">DevElevate</span>
          <span class="logo-badge">AI</span>
        </div>
      </div>
    </header>

    <main class="container">
      <section class="hero">
        <h1>
          Elevate Your <span class="gradient-text">Tech Career</span>
        </h1>
        <p class="hero-subtitle">
          Analyze your GitHub profile against any job description. Get an AI-powered readiness score, skill gap analysis, and a personalized career roadmap.
        </p>
      </section>

      <div id="main-content"></div>
    </main>

    <footer class="footer">
      <p class="footer-text">
        DevElevate — AI-Powered Career Intelligence · Built with ❤️ and Gemini
      </p>
    </footer>
  `;
}

/**
 * Handle form submission.
 */
async function handleSubmit(username, jobDescription) {
  const mainContent = document.getElementById('main-content');

  // Show loading
  setFormLoading(true);
  currentView = 'loading';

  // Replace form with loader
  mainContent.innerHTML = '';
  renderLoader(mainContent);

  try {
    const result = await analyzeProfile(username, jobDescription);
    destroyLoader();
    showResults(mainContent, result);
  } catch (err) {
    destroyLoader();
    showError(mainContent, err.message, username, jobDescription);
  }
}

/**
 * Show the analysis results.
 */
function showResults(container, result) {
  currentView = 'results';
  const { data, meta } = result;

  container.innerHTML = '';

  // Results wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'results-section';

  // Back button
  wrapper.innerHTML = `
    <button class="back-button" id="back-btn">
      ← New Analysis
    </button>
    <div class="results-header">
      <h2>Analysis Results</h2>
      <div class="results-meta">
        <span>@${escapeHtml(meta.username)}</span>
        <span class="meta-dot"></span>
        <span>${meta.analyzedRepos} of ${meta.totalPublicRepos} repos analyzed</span>
        <span class="meta-dot"></span>
        <span>${new Date(meta.analyzedAt).toLocaleString()}</span>
      </div>
    </div>
  `;

  container.appendChild(wrapper);

  // Render each section
  renderScoreCard(wrapper, data.readiness_score);
  renderSummary(wrapper, data.match_summary);
  renderSkillGaps(wrapper, data.skill_gaps);
  renderActionPlan(wrapper, data.action_plans);

  // Back button handler
  document.getElementById('back-btn').addEventListener('click', () => {
    resetToForm();
  });

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show an error state.
 */
function showError(container, message, username, jobDescription) {
  currentView = 'error';

  container.innerHTML = `
    <section class="error-section">
      <div class="error-icon">😵</div>
      <h3 class="error-title">Analysis Failed</h3>
      <p class="error-message">${escapeHtml(message)}</p>
      <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
        <button class="btn-secondary" id="retry-btn">
          🔄 Try Again
        </button>
        <button class="btn-secondary" id="back-btn-error">
          ← Start Over
        </button>
      </div>
    </section>
  `;

  document.getElementById('retry-btn').addEventListener('click', () => {
    handleSubmit(username, jobDescription);
  });

  document.getElementById('back-btn-error').addEventListener('click', () => {
    resetToForm();
  });
}

/**
 * Reset back to the form view.
 */
function resetToForm() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = '';
  currentView = 'form';
  renderForm(mainContent, handleSubmit);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Boot
init();
