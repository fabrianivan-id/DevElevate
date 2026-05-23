/**
 * DevElevate — Loader Component
 * Animated loading state with rotating status messages.
 */

const MESSAGES = [
  'Connecting to GitHub API...',
  'Fetching repository data...',
  'Analyzing programming languages...',
  'Scanning repository topics...',
  'Building developer profile...',
  'Sending to AI for deep analysis...',
  'Comparing against job requirements...',
  'Evaluating architecture patterns...',
  'Calculating readiness score...',
  'Generating your career roadmap...',
];

let messageInterval = null;

/**
 * Render the loader into the given container.
 */
export function renderLoader(container) {
  const html = `
    <section class="loader-section" id="loader-section">
      <div class="loader-rings">
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
        <div class="loader-ring"></div>
        <div class="loader-core"></div>
      </div>
      <p class="loader-text" id="loader-text">${MESSAGES[0]}</p>
      <p class="loader-subtext">This may take 15–30 seconds</p>
    </section>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Rotate messages
  let index = 0;
  const textEl = document.getElementById('loader-text');

  messageInterval = setInterval(() => {
    index = (index + 1) % MESSAGES.length;
    if (textEl) {
      textEl.style.opacity = '0';
      setTimeout(() => {
        textEl.textContent = MESSAGES[index];
        textEl.style.opacity = '1';
      }, 200);
    }
  }, 2500);
}

/**
 * Clean up the loader interval.
 */
export function destroyLoader() {
  if (messageInterval) {
    clearInterval(messageInterval);
    messageInterval = null;
  }
}
