/**
 * DevElevate — Skill Gaps Component
 * Grid of skill gap cards with severity badges.
 */

/**
 * Render skill gaps as a card grid.
 * @param {HTMLElement} container
 * @param {Array} gaps - Array of { category, missing, severity }
 */
export function renderSkillGaps(container, gaps) {
  if (!gaps || !gaps.length) return;

  const cardsHtml = gaps
    .map(
      (gap) => `
      <div class="glass-card gap-card">
        <div class="gap-header">
          <span class="gap-category">${escapeHtml(gap.category)}</span>
          <span class="severity-badge severity-${gap.severity.toLowerCase()}">${gap.severity}</span>
        </div>
        <p class="gap-description">${escapeHtml(gap.missing)}</p>
      </div>
    `
    )
    .join('');

  const html = `
    <section class="gaps-section" id="gaps-section">
      <h3 class="section-title">
        <span class="section-icon">🎯</span> Skill Gaps Identified
      </h3>
      <div class="gaps-grid">
        ${cardsHtml}
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
