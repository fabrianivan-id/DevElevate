/**
 * DevElevate — Input Form Component
 * GitHub username + Job Description input with validation.
 */

/**
 * Render the input form and return the form element.
 * @param {Function} onSubmit - Callback with (username, jobDescription)
 */
export function renderForm(container, onSubmit) {
  const html = `
    <section class="form-section" id="form-section">
      <div class="glass-card">
        <form id="analyze-form" autocomplete="off">
          <div class="form-group">
            <label class="form-label" for="github-username">
              <span class="label-icon">👤</span> GitHub Username
            </label>
            <div class="input-wrapper">
              <input
                type="text"
                id="github-username"
                class="form-input"
                placeholder="e.g. torvalds"
                spellcheck="false"
                required
              />
            </div>
            <p class="form-hint">Enter a public GitHub username to analyze</p>
            <p class="form-error" id="username-error"></p>
          </div>

          <div class="form-group">
            <label class="form-label" for="job-description">
              <span class="label-icon">📄</span> Target Job Description
            </label>
            <textarea
              id="job-description"
              class="form-textarea"
              placeholder="Paste the full job description here...&#10;&#10;Example:&#10;We are looking for a Senior Full-Stack Engineer with experience in React, Node.js, TypeScript, PostgreSQL, and AWS. The ideal candidate has built scalable microservices, is familiar with CI/CD pipelines, and has strong testing practices..."
              required
            ></textarea>
            <p class="form-hint">Paste the complete job description for the most accurate analysis</p>
            <p class="form-error" id="jd-error"></p>
          </div>

          <button type="submit" class="btn-primary" id="submit-btn">
            <span class="btn-icon">🚀</span>
            Analyze My Profile
          </button>
        </form>
      </div>
    </section>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Form submission
  const form = document.getElementById('analyze-form');
  const usernameInput = document.getElementById('github-username');
  const jdInput = document.getElementById('job-description');
  const usernameError = document.getElementById('username-error');
  const jdError = document.getElementById('jd-error');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Reset errors
    usernameError.classList.remove('visible');
    jdError.classList.remove('visible');

    const username = usernameInput.value.trim();
    const jd = jdInput.value.trim();

    let valid = true;

    if (!username) {
      usernameError.textContent = 'Please enter a GitHub username.';
      usernameError.classList.add('visible');
      valid = false;
    } else if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
      usernameError.textContent = 'Invalid GitHub username format.';
      usernameError.classList.add('visible');
      valid = false;
    }

    if (!jd) {
      jdError.textContent = 'Please paste a job description.';
      jdError.classList.add('visible');
      valid = false;
    } else if (jd.length < 50) {
      jdError.textContent = 'Job description seems too short. Paste the full JD for better results.';
      jdError.classList.add('visible');
      valid = false;
    }

    if (valid) {
      onSubmit(username, jd);
    }
  });
}

/**
 * Disable/enable the form during loading.
 */
export function setFormLoading(loading) {
  const btn = document.getElementById('submit-btn');
  const inputs = document.querySelectorAll('#analyze-form input, #analyze-form textarea');

  if (btn) {
    btn.disabled = loading;
    btn.innerHTML = loading
      ? '<span class="btn-icon">⏳</span> Analyzing...'
      : '<span class="btn-icon">🚀</span> Analyze My Profile';
  }

  inputs.forEach((input) => {
    input.disabled = loading;
  });
}
