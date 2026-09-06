// RepJournal — Create account page
// Client-side form validation + PocketBase account creation.
// Rules live in constants.js; validation logic lives in validation.js;
// PocketBase calls live in auth.js and api/users.js. This file only
// wires the DOM to those modules.

import { login } from './modules/auth.js';
import { isUsernameTaken, createUser } from './modules/api/users.js';
import { validateLength, valuesMatch, showError, clearError } from './modules/validation.js';
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from './modules/constants.js';

const form = document.querySelector('.login-form');
const submitBtn = form.querySelector('.login-btn');

const fields = {
  'first-name': {
    input: document.getElementById('first-name'),
    error: document.getElementById('first-name-error'),
    validate: (value) => validateLength(value, NAME_MIN_LENGTH, NAME_MAX_LENGTH, 'First name'),
  },
  username: {
    input: document.getElementById('username'),
    error: document.getElementById('username-error'),
    validate: (value) => validateLength(value, USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, 'Username'),
  },
  password: {
    input: document.getElementById('password'),
    error: document.getElementById('password-error'),
    validate: (value) => validateLength(value, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, 'Password'),
  },
  'confirm-password': {
    input: document.getElementById('confirm-password'),
    error: document.getElementById('confirm-password-error'),
    validate: (value) => valuesMatch(value, fields.password.input.value, 'Passwords do not match.'),
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
  submitBtn.textContent = isSubmitting ? 'Creating account…' : 'Create account';
}

function handlePocketbaseError(error) {
  console.error('Account creation failed:', error);
  const data = error?.data?.data;

  if (data?.username) {
    showError(fields.username.input, fields.username.error, 'That username is already taken.');
  }
  if (data?.password) {
    showError(fields.password.input, fields.password.error, data.password.message || 'Invalid password.');
  }
  if (data?.name) {
    showError(fields['first-name'].input, fields['first-name'].error, data.name.message || 'Invalid name.');
  }
  if (!data) {
    showError(fields.username.input, fields.username.error, 'Something went wrong. Please try again.');
  }
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

  const firstName = fields['first-name'].input.value.trim();
  const username = fields.username.input.value.trim();
  const password = fields.password.input.value;
  const passwordConfirm = fields['confirm-password'].input.value;

  setSubmitting(true);

  try {
    const taken = await isUsernameTaken(username);
    if (taken) {
      showError(fields.username.input, fields.username.error, 'That username is already taken.');
      fields.username.input.focus();
      return;
    }

    await createUser({ name: firstName, username, password, passwordConfirm });
    await login(username, password);

    console.log('Account created and logged in — redirecting.');
    window.location.href = '/pages/dashboard.html';
  } catch (error) {
    handlePocketbaseError(error);
  } finally {
    setSubmitting(false);
  }
});