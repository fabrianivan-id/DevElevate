/**
 * DevElevate — Summary Component
 * Displays the match summary from the AI analysis.
 */

/**
 * Render the match summary card.
 * @param {HTMLElement} container
 * @param {string} summaryText
 */
export function renderSummary(container, summaryText) {
  const html = `
    <section class="summary-section" id="summary-section">
      <div class="glass-card summary-card">
        <h3 class="section-title">
          <span class="section-icon">💡</span> Match Summary
        </h3>
        <p class="summary-text">${escapeHtml(summaryText)}</p>
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
