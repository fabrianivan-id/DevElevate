/**
 * DevElevate — Action Plan Component
 * Vertical timeline with numbered step cards.
 */

/**
 * Render the action plan timeline.
 * @param {HTMLElement} container
 * @param {Array} plans - Array of { step, title, action }
 */
export function renderActionPlan(container, plans) {
  if (!plans || !plans.length) return;

  const stepsHtml = plans
    .map(
      (plan) => `
      <div class="action-step">
        <div class="step-marker">${plan.step}</div>
        <div class="glass-card action-card">
          <h4 class="action-title">${escapeHtml(plan.title)}</h4>
          <p class="action-description">${escapeHtml(plan.action)}</p>
        </div>
      </div>
    `
    )
    .join('');

  const html = `
    <section class="actions-section" id="actions-section">
      <h3 class="section-title">
        <span class="section-icon">🗺️</span> Your Action Roadmap
      </h3>
      <div class="action-timeline">
        ${stepsHtml}
      </div>
    </section>
  `;

  container.insertAdjacentHTML('beforeend', html);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
