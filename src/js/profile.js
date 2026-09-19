// RepJournal — Profile page
// Handles: photo preview (local only — not yet persisted to PocketBase),
// loading the signed-in user's real name/username on page load, saving
// account detail changes, changing password, and logging out.
//
// Rules live in constants.js; validation logic lives in validation.js;
// PocketBase calls live in auth.js and api/users.js. This file only
// wires the DOM to those modules.

import { requireAuth, getCurrentUser, login, logout } from './modules/auth.js';
import { isUsernameTaken, updateUserDetails, updateUserPassword } from './modules/api/users.js';
import pb from './modules/pocketbase.js';
import {
  validateLength,
  validateRequired,
  valuesMatch,
  showError,
  clearError,
  validateField,
  validateForm,
} from './modules/validation.js';
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
} from './modules/constants.js';

requireAuth();

const user = getCurrentUser();

// --- DOM refs ---
const photoInput = document.getElementById('photo-input');
const photoEditBtn = document.getElementById('photo-edit-btn');
const photoRemoveBtn = document.getElementById('photo-remove-btn');
const photoPreview = document.getElementById('photo-preview');
const photoFallback = document.getElementById('photo-fallback');
const photoDisplayName = document.getElementById('photo-display-name');

const accountForm = document.getElementById('account-form');
const accountSaveBtn = document.getElementById('account-save-btn');
const passwordForm = document.getElementById('password-form');
const passwordSaveBtn = document.getElementById('password-save-btn');
const logoutBtn = document.getElementById('logout-btn');

const accountFields = {
  'first-name': {
    input: document.getElementById('first-name-input'),
    error: document.getElementById('first-name-error'),
    validate: (value) => validateLength(value, NAME_MIN_LENGTH, NAME_MAX_LENGTH, 'First name'),
  },
  username: {
    input: document.getElementById('username-input'),
    error: document.getElementById('username-error'),
    validate: (value) => validateLength(value, USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, 'Username'),
  },
};

const passwordFields = {
  'current-password': {
    input: document.getElementById('current-password-input'),
    error: document.getElementById('current-password-error'),
    validate: (value) => validateRequired(value, 'Current password'),
  },
  'new-password': {
    input: document.getElementById('new-password-input'),
    error: document.getElementById('new-password-error'),
    validate: (value) => validateLength(value, PASSWORD_MIN_LENGTH, PASSWORD_MAX_LENGTH, 'New password'),
  },
  'confirm-password': {
    input: document.getElementById('confirm-password-input'),
    error: document.getElementById('confirm-password-error'),
    validate: (value) =>
      valuesMatch(value, passwordFields['new-password'].input.value, "New passwords don't match."),
  },
};

// --- photo preview (local only) ---

/** Initials fallback (e.g. "Alex" -> "A") shown until a photo is set. */
function updateFallbackInitial() {
  const name = accountFields['first-name'].input.value.trim();
  photoFallback.textContent = name ? name[0].toUpperCase() : '?';
}

function showPhoto(src) {
  photoPreview.src = src;
  photoPreview.classList.add('has-image');
  photoFallback.classList.add('hidden');
}

function clearPhoto() {
  photoPreview.src = '';
  photoPreview.classList.remove('has-image');
  photoFallback.classList.remove('hidden');
}

photoEditBtn.addEventListener('click', () => photoInput.click());

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => showPhoto(reader.result);
  reader.readAsDataURL(file);
});

photoRemoveBtn.addEventListener('click', () => {
  photoInput.value = '';
  clearPhoto();
});

accountFields['first-name'].input.addEventListener('input', () => {
  photoDisplayName.textContent = accountFields['first-name'].input.value.trim() || 'Your name';
  updateFallbackInitial();
});

// --- init from the signed-in user ---

function initFromUser() {
  accountFields['first-name'].input.value = user.name || '';
  accountFields.username.input.value = user.username || '';
  photoDisplayName.textContent = user.name?.trim() || 'Your name';
  updateFallbackInitial();

  if (user.avatar) {
    showPhoto(pb.files.getURL(user, user.avatar));
  } else {
    clearPhoto();
  }
}

// --- clear a field's error as soon as it's edited again ---

accountForm.addEventListener('input', (event) => {
  const field = accountFields[event.target.name];
  if (field && field.input.classList.contains('is-invalid')) {
    clearError(field.input, field.error);
  }
});

passwordForm.addEventListener('input', (event) => {
  const field = passwordFields[event.target.name];
  if (field && field.input.classList.contains('is-invalid')) {
    clearError(field.input, field.error);
  }
});

// --- account details (name + username) ---

function setAccountSubmitting(isSubmitting) {
  accountSaveBtn.disabled = isSubmitting;
  accountSaveBtn.textContent = isSubmitting ? 'Saving…' : 'Save changes';
}

function handleAccountError(error) {
  console.error('Account update failed:', error);
  const data = error?.data?.data;

  if (data?.username) {
    showError(accountFields.username.input, accountFields.username.error, 'That username is already taken.');
  }
  if (data?.name) {
    showError(accountFields['first-name'].input, accountFields['first-name'].error, data.name.message || 'Invalid name.');
  }
  if (!data) {
    showError(accountFields.username.input, accountFields.username.error, 'Something went wrong. Please try again.');
  }
}

accountForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const isValid = validateForm(accountFields);
  if (!isValid) {
    const firstInvalidKey = Object.keys(accountFields).find(
      (key) => accountFields[key].input.classList.contains('is-invalid')
    );
    accountFields[firstInvalidKey]?.input.focus();
    return;
  }

  const name = accountFields['first-name'].input.value.trim();
  const username = accountFields.username.input.value.trim();

  setAccountSubmitting(true);

  try {
    if (username !== user.username) {
      const taken = await isUsernameTaken(username, user.id);
      if (taken) {
        showError(accountFields.username.input, accountFields.username.error, 'That username is already taken.');
        accountFields.username.input.focus();
        return;
      }
    }

    const updated = await updateUserDetails(user.id, { name, username });
    user.name = updated.name;
    user.username = updated.username;

    photoDisplayName.textContent = user.name?.trim() || 'Your name';
    updateFallbackInitial();
  } catch (error) {
    handleAccountError(error);
  } finally {
    setAccountSubmitting(false);
  }
});

// --- password ---

function setPasswordSubmitting(isSubmitting) {
  passwordSaveBtn.disabled = isSubmitting;
  passwordSaveBtn.textContent = isSubmitting ? 'Updating…' : 'Update password';
}

function handlePasswordError(error) {
  console.error('Password update failed:', error);
  const data = error?.data?.data;

  if (data?.oldPassword) {
    showError(
      passwordFields['current-password'].input,
      passwordFields['current-password'].error,
      'Current password is incorrect.'
    );
  }
  if (data?.password) {
    showError(
      passwordFields['new-password'].input,
      passwordFields['new-password'].error,
      data.password.message || 'Invalid password.'
    );
  }
  if (!data) {
    showError(
      passwordFields['current-password'].input,
      passwordFields['current-password'].error,
      'Something went wrong. Please try again.'
    );
  }
}

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const isValid = validateForm(passwordFields);
  if (!isValid) {
    const firstInvalidKey = Object.keys(passwordFields).find(
      (key) => passwordFields[key].input.classList.contains('is-invalid')
    );
    passwordFields[firstInvalidKey]?.input.focus();
    return;
  }

  const oldPassword = passwordFields['current-password'].input.value;
  const password = passwordFields['new-password'].input.value;
  const passwordConfirm = passwordFields['confirm-password'].input.value;

  setPasswordSubmitting(true);

  try {
    await updateUserPassword(user.id, { oldPassword, password, passwordConfirm });

    // Changing the password invalidates the current auth token server-side,
    // so log back in immediately with the new password to stay signed in.
    await login(user.username, password);

    passwordForm.reset();
  } catch (error) {
    handlePasswordError(error);
  } finally {
    setPasswordSubmitting(false);
  }
});

// --- logout ---

logoutBtn.addEventListener('click', () => {
  logout();
  window.location.href = '/index.html';
});

// --- init ---
initFromUser();