// Validate the login form and authenticate with PocketBase.

import { login, redirectIfAuthenticated } from './modules/auth.js';
import { validateRequired, showError, validateField, validateForm } from './modules/validation.js';

// An existing session can go straight to the dashboard.
redirectIfAuthenticated();

const form = document.querySelector('.login-form');
const submitBtn = form.querySelector('.login-btn');

const fields = {
  username: {
    input: document.getElementById('username'),
    error: document.getElementById('username-error'),
    validate: (value) => validateRequired(value, 'Username'),
  },
  password: {
    input: document.getElementById('password'),
    error: document.getElementById('password-error'),
    validate: (value) => validateRequired(value, 'Password'),
  },
};

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? 'Logging in…' : 'Log in';
}

function handlePocketbaseError(error) {
  console.error('Login failed:', error);
  // Keep credential errors generic.
  showError(fields.password.input, fields.password.error, 'Incorrect username or password.');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const isValid = validateForm(fields);
  if (!isValid) {
    const firstInvalidKey = Object.keys(fields).find(
      (key) => fields[key].input.classList.contains('is-invalid')
    );
    fields[firstInvalidKey]?.input.focus();
    return;
  }

  const username = fields.username.input.value.trim();
  const password = fields.password.input.value;

  setSubmitting(true);

  try {
    await login(username, password);
    window.location.href = '/pages/dashboard.html';
  } catch (error) {
    handlePocketbaseError(error);
  } finally {
    setSubmitting(false);
  }
});
