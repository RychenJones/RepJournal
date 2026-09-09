export function validateLength(value, min, max, label) {
  if (value.length < min || value.length > max) {
    return `${label} must be between ${min} and ${max} characters.`;
  }
  return '';
}

export function validateRequired(value, label) {
  return value.length > 0 ? '' : `${label} is required.`;
}

export function validateNumberInRange(value, min, max, label) {
  if (value === '') return '';
  const num = Number(value);
  if (Number.isNaN(num)) return `${label} must be a number.`;
  if (num < min || num > max) return `${label} must be between ${min} and ${max}.`;
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