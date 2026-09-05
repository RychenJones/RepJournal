// RepJournal — Profile page
// Handles: photo upload/preview/remove, keeping the display name and
// avatar initials in sync with the first-name field, and basic
// new-password/confirm-password matching before "submit".

const photoInput = document.getElementById('photo-input');
const photoEditBtn = document.getElementById('photo-edit-btn');
const photoRemoveBtn = document.getElementById('photo-remove-btn');
const photoPreview = document.getElementById('photo-preview');
const photoFallback = document.getElementById('photo-fallback');
const photoDisplayName = document.getElementById('photo-display-name');
const firstNameInput = document.getElementById('first-name-input');

const accountForm = document.getElementById('account-form');
const passwordForm = document.getElementById('password-form');
const passwordError = document.getElementById('password-error');

/** Initials fallback (e.g. "Alex" -> "A") shown until a photo is set. */
function updateFallbackInitial() {
  const name = firstNameInput.value.trim();
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

firstNameInput.addEventListener('input', () => {
  photoDisplayName.textContent = firstNameInput.value.trim() || 'Your name';
  updateFallbackInitial();
});

accountForm.addEventListener('submit', (e) => {
  e.preventDefault();
  // Hand-off point: wire this into your actual save call (API, etc).
  console.log('Account details ready to save:', {
    firstName: firstNameInput.value.trim(),
    username: document.getElementById('username-input').value.trim(),
  });
});

passwordForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const [currentPw, newPw, confirmPw] = passwordForm.querySelectorAll('input[type="password"]');

  if (newPw.value !== confirmPw.value) {
    passwordError.hidden = false;
    confirmPw.focus();
    return;
  }

  passwordError.hidden = true;
  // Hand-off point: wire this into your actual password-change call.
  console.log('Password change ready to submit:', {
    currentPassword: currentPw.value,
    newPassword: newPw.value,
  });
  passwordForm.reset();
});

// clear the mismatch warning as soon as the person edits either field again
passwordForm.addEventListener('input', (e) => {
  if (!passwordError.hidden && e.target.type === 'password') {
    passwordError.hidden = true;
  }
});

// --- init ---
updateFallbackInitial();