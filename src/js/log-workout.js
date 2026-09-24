// RepJournal — Log workout page
// Builds the exercise/set list, validates it, then saves to PocketBase
// via api/workouts.js on "Finish workout".

import { requireAuth, getCurrentUser } from './modules/auth.js';
import { createWorkoutWithDetails } from './modules/api/workouts.js';
import { toDateInputValue } from './modules/format.js';
import {
  validateRequired,
  validateLength,
  validateNumberInRange,
  showError,
  clearError,
} from './modules/validation.js';
import {
  NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  WEIGHT_MIN,
  WEIGHT_MAX,
  REPS_MIN,
  REPS_MAX,
  RPE_MIN,
  RPE_MAX,
} from './modules/constants.js';

requireAuth();

const exerciseList = document.getElementById('exercise-list');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const finishBtn = document.getElementById('finish-workout-btn');
const sessionDateInput = document.getElementById('session-date');
const workoutNameInput = document.getElementById('workout-name');
const workoutNameError = document.getElementById('workout-name-error');
const formError = document.getElementById('form-error');

const exerciseTemplate = document.getElementById('exercise-template');
const setRowTemplate = document.getElementById('set-row-template');

// ---------- DOM-building (inline for now — only this page uses it) ----------

function createSetRow(setNumber) {
  const wrap = setRowTemplate.content.firstElementChild.cloneNode(true);
  wrap.querySelector('.set-number').textContent = setNumber;
  return wrap;
}

function createExerciseCard() {
  return exerciseTemplate.content.firstElementChild.cloneNode(true);
}

function renumberSets(setRowsContainer) {
  setRowsContainer.querySelectorAll('.set-row-wrap').forEach((wrap, index) => {
    wrap.querySelector('.set-number').textContent = index + 1;
  });
}

function updateFinishSummary() {
  const exerciseCount = exerciseList.querySelectorAll('.exercise-card').length;
  const setCount = exerciseList.querySelectorAll('.set-row-wrap').length;
  document.getElementById('finish-exercise-count').textContent =
    `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`;
  document.getElementById('finish-set-count').textContent =
    `${setCount} set${setCount === 1 ? '' : 's'}`;
}

// ---------- initial state ----------

sessionDateInput.value = toDateInputValue();

// ---------- adding exercises/sets ----------

function addExerciseCard() {
  const card = createExerciseCard();
  card.querySelector('.set-rows').appendChild(createSetRow(1));
  exerciseList.appendChild(card);
  updateFinishSummary();
}

addExerciseBtn.addEventListener('click', addExerciseCard);

exerciseList.addEventListener('click', (event) => {
  const addSetBtn = event.target.closest('.add-set-btn');
  if (addSetBtn) {
    const setRows = addSetBtn.closest('.exercise-card').querySelector('.set-rows');
    const nextNumber = setRows.querySelectorAll('.set-row-wrap').length + 1;
    setRows.appendChild(createSetRow(nextNumber));
    updateFinishSummary();
    return;
  }

  const removeSetBtn = event.target.closest('.remove-set-btn');
  if (removeSetBtn) {
    const wrap = removeSetBtn.closest('.set-row-wrap');
    const setRows = wrap.parentElement;
    wrap.remove();
    renumberSets(setRows);
    updateFinishSummary();
    return;
  }

  const removeExerciseBtn = event.target.closest('.remove-exercise-btn');
  if (removeExerciseBtn) {
    removeExerciseBtn.closest('.exercise-card').remove();
    updateFinishSummary();
  }
});

exerciseList.addEventListener('input', (event) => {
  const input = event.target;
  if (input.classList.contains('exercise-name-input')) {
    clearError(input, input.closest('.exercise-name-field').querySelector('.exercise-name-error'));
  }
  if (input.matches('.weight-input, .reps-input, .rpe-input')) {
    clearError(input, input.closest('.set-row-wrap').querySelector('.set-row-error'));
  }
});

workoutNameInput.addEventListener('input', () => {
  clearError(workoutNameInput, workoutNameError);
});

// ---------- validation + data collection ----------

function collectAndValidateWorkout() {
  let isValid = true;
  formError.textContent = '';

  const name = workoutNameInput.value.trim();
  const nameError =
    validateRequired(name, 'Workout name') ||
    validateLength(name, NAME_MIN_LENGTH, NAME_MAX_LENGTH, 'Workout name');
  if (nameError) {
    showError(workoutNameInput, workoutNameError, nameError);
    isValid = false;
  } else {
    clearError(workoutNameInput, workoutNameError);
  }

  const date = sessionDateInput.value;
  if (!date) {
    formError.textContent = 'Please choose a date.';
    isValid = false;
  }

  const exerciseCards = Array.from(exerciseList.querySelectorAll('.exercise-card'));
  const exercises = [];

  for (const card of exerciseCards) {
    const nameInput = card.querySelector('.exercise-name-input');
    const nameErrorEl = card.querySelector('.exercise-name-error');
    const exerciseName = nameInput.value.trim();

    const exerciseNameError =
      validateRequired(exerciseName, 'Exercise name') ||
      validateLength(exerciseName, NAME_MIN_LENGTH, NAME_MAX_LENGTH, 'Exercise name');
    if (exerciseNameError) {
      showError(nameInput, nameErrorEl, exerciseNameError);
      isValid = false;
    } else {
      clearError(nameInput, nameErrorEl);
    }

    const setRowWraps = Array.from(card.querySelectorAll('.set-row-wrap'));
    const setsErrorEl = card.querySelector('.exercise-sets-error');
    if (setRowWraps.length === 0) {
      setsErrorEl.textContent = 'Add at least one set.';
      isValid = false;
    } else {
      setsErrorEl.textContent = '';
    }

    const sets = [];

    for (const wrap of setRowWraps) {
      const weightInput = wrap.querySelector('.weight-input');
      const repsInput = wrap.querySelector('.reps-input');
      const rpeInput = wrap.querySelector('.rpe-input');
      const rowErrorEl = wrap.querySelector('.set-row-error');

      const weightError = validateNumberInRange(weightInput.value, WEIGHT_MIN, WEIGHT_MAX, 'Weight');
      const repsError = validateNumberInRange(repsInput.value, REPS_MIN, REPS_MAX, 'Reps');
      const rpeError = validateNumberInRange(rpeInput.value, RPE_MIN, RPE_MAX, 'RPE');
      const rowError = weightError || repsError || rpeError;

      if (rowError) {
        showError(weightInput, rowErrorEl, rowError);
        isValid = false;
      } else {
        clearError(weightInput, rowErrorEl);
      }
      weightInput.classList.toggle('is-invalid', Boolean(weightError));
      repsInput.classList.toggle('is-invalid', Boolean(repsError));
      rpeInput.classList.toggle('is-invalid', Boolean(rpeError));

      sets.push({
        weight: weightInput.value === '' ? null : Number(weightInput.value),
        reps: repsInput.value === '' ? null : Number(repsInput.value),
        rpe: rpeInput.value === '' ? null : Number(rpeInput.value),
      });
    }

    exercises.push({ name: exerciseName, sets });
  }

  if (!isValid) {
    return { isValid: false };
  }

  return {
    isValid: true,
    data: {
      user: getCurrentUser().id,
      name,
      date,
      exercises,
    },
  };
}

// ---------- finish workout ----------

function setSaving(isSaving) {
  finishBtn.disabled = isSaving;
  finishBtn.textContent = isSaving ? 'Saving…' : 'Finish workout';
}

finishBtn.addEventListener('click', async () => {
  const result = collectAndValidateWorkout();
  if (!result.isValid) {
    const firstInvalid = exerciseList.querySelector('.is-invalid') || workoutNameInput;
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  setSaving(true);

  try {
    await createWorkoutWithDetails(result.data);
    window.location.href = '/pages/dashboard.html';
  } catch (error) {
    console.error('Failed to save workout:', error);
    formError.textContent = 'Something went wrong saving your workout. Please try again.';
  } finally {
    setSaving(false);
  }
});

// ---------- start with one exercise ----------

addExerciseCard();