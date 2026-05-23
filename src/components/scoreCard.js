/**
 * DevElevate — Score Card Component
 * Animated circular gauge with counter animation.
 */

/**
 * Render the readiness score gauge.
 * @param {HTMLElement} container
 * @param {number} score - 0 to 100
 */
export function renderScoreCard(container, score) {
  const circumference = 2 * Math.PI * 88; // radius = 88
  const scoreClass = getScoreClass(score);
  const verdict = getVerdict(score);

  const html = `
    <section class="score-section" id="score-section">
      <div class="glass-card score-card ${scoreClass}">
        <div class="score-gauge">
          <svg viewBox="0 0 200 200">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--accent-blue)" />
                <stop offset="50%" stop-color="var(--accent-purple)" />
                <stop offset="100%" stop-color="var(--accent-cyan)" />
              </linearGradient>
            </defs>
            <circle class="score-gauge-bg" cx="100" cy="100" r="88" />
            <circle
              class="score-gauge-fill"
              cx="100" cy="100" r="88"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference}"
              id="score-arc"
            />
          </svg>
          <div class="score-value">
            <div class="score-number">
              <span id="score-counter">0</span><span class="score-percent">%</span>
            </div>
            <div class="score-label">Readiness</div>
          </div>
        </div>
        <p class="score-verdict">${verdict}</p>
      </div>
    </section>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Animate after a brief delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      animateScore(score, circumference);
    }, 300);
  });
}

function animateScore(targetScore, circumference) {
  const arc = document.getElementById('score-arc');
  const counter = document.getElementById('score-counter');

  if (!arc || !counter) return;

  // Animate the arc
  const offset = circumference - (targetScore / 100) * circumference;
  arc.style.strokeDashoffset = offset;

  // Animate the counter
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * targetScore);

    counter.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function getScoreClass(score) {
  if (score <= 40) return 'score-low';
  if (score <= 70) return 'score-mid';
  if (score <= 85) return 'score-high';
  return 'score-excellent';
}

function getVerdict(score) {
  if (score <= 30) return '⚠️ Significant Gaps — Major upskilling needed';
  if (score <= 50) return '🔶 Developing — Critical gaps remain';
  if (score <= 70) return '📈 Moderate Match — Focused improvement needed';
  if (score <= 85) return '✅ Strong Match — Minor gaps to address';
  return '🌟 Excellent Match — Well qualified!';
}
