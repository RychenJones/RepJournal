// RepJournal — Log in page
// Client-side validation (required fields only — login shouldn't
// re-enforce signup-time length rules) + PocketBase authentication.

import { login, redirectIfAuthenticated } from './modules/auth.js';
import { validateRequired, showError, clearError } from './modules/validation.js';

// If there's already a valid session, skip the login form entirely.
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

function validateField(key) {
  const field = fields[key];
  const message = field.validate(field.input.value.trim());
  if (message) {
    showError(field.input, field.error, message);
    return false;
  }
  clearError(field.input, field.error);
  return true;
}

function validateForm() {
  let isValid = true;
  for (const key of Object.keys(fields)) {
    const fieldIsValid = validateField(key);
    if (!fieldIsValid) isValid = false;
  }
  return isValid;
}

function setSubmitting(isSubmitting) {
  submitBtn.disabled = isSubmitting;
  submitBtn.textContent = isSubmitting ? 'Logging in…' : 'Log in';
}

function handlePocketbaseError(error) {
  console.error('Login failed:', error);
  // PocketBase returns a generic 400 for bad credentials — don't reveal
  // which field was wrong, just surface it under password.
  showError(fields.password.input, fields.password.error, 'Incorrect username or password.');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const isValid = validateForm();
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