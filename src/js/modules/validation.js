// RepJournal — generic form validation helpers
// These know nothing about specific pages or limits — they're the
// toolbox. Pages supply their own rules (often from constants.js).

export function validateLength(value, min, max, label) {
  if (value.length < min || value.length > max) {
    return `${label} must be between ${min} and ${max} characters.`;
  }
  return '';
}

export function valuesMatch(a, b, message) {
  return a === b ? '' : message;
}

export function showError(input, errorEl, message) {
  input.classList.add('is-invalid');
  errorEl.textContent = message;
}

export function clearError(input, errorEl) {
  input.classList.remove('is-invalid');
  errorEl.textContent = '';
}

export function validateRequired(value, label) {
  return value.length > 0 ? '' : `${label} is required.`;
}