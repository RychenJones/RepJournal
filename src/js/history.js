// RepJournal — History page
// Renders every logged workout for the current user, grouped by month,
// each collapsible to show its exercises and per-set weight/reps/RPE.
// RPE is optional, so it's only shown on the sets where it was
// actually recorded. Streak-row numbers reuse the same stats helper
// as the dashboard.
//
// Each entry has an Edit button that swaps its expanded detail for an
// inline form (workout name/date, exercise names, set values — no
// add/remove of exercises or sets), and a Delete button that removes
// the whole workout after a confirm prompt.

import { requireAuth, getCurrentUser } from './modules/auth.js';
import {
  getWorkoutsForUser,
  updateWorkoutWithDetails,
  deleteWorkoutWithDetails,
} from './modules/api/workouts.js';
import { renderHistoryPage } from './modules/render.js';
import { computeDashboardStats } from './modules/stats.js';
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

const historyGroupsContainer = document.getElementById('history-groups');
const historyEmptyState = document.getElementById('empty-state');
const historySummaryEl = document.getElementById('history-summary');

const historyMonthGroupTemplate = document.getElementById('month-group-template');
const historyEntryTemplate = document.getElementById('history-entry-template');
const historyDetailExerciseTemplate = document.getElementById('detail-exercise-template');
const historyDetailSetTemplate = document.getElementById('detail-set-template');

const entryEditTemplate = document.getElementById('entry-edit-template');
const editExerciseTemplate = document.getElementById('edit-exercise-template');
const editSetRowTemplate = document.getElementById('edit-set-row-template');

const thisWeekEl = document.getElementById('stat-this-week');
const perMonthEl = document.getElementById('stat-per-month');
const totalEl = document.getElementById('stat-total');

// Workouts currently on screen, kept around so Cancel can redraw the
// read-only view instantly without a refetch.
let currentWorkouts = [];

const historyRenderConfig = {
  historyGroupsContainer,
  historyEmptyState,
  historySummaryEl,
  historyMonthGroupTemplate,
  historyEntryTemplate,
  historyDetailExerciseTemplate,
  historyDetailSetTemplate,
  onEdit: enterEditMode,
  onDelete: handleDeleteWorkout,
};

// ---------- edit form building ----------

function buildEditSetRow(set, setIndex) {
  const row = editSetRowTemplate.content.firstElementChild.cloneNode(true);
  row.querySelector('.set-number').textContent = setIndex + 1;
  row.querySelector('.weight-input').value = set.weight;
  row.querySelector('.reps-input').value = set.reps;
  row.querySelector('.rpe-input').value = set.rpe;
  row.dataset.setId = set.id;
  return row;
}

function buildEditExercise(exercise) {
  const block = editExerciseTemplate.content.firstElementChild.cloneNode(true);
  block.querySelector('.exercise-name-input').value = exercise.name;
  block.dataset.exerciseId = exercise.id;

  const setRowsContainer = block.querySelector('.edit-set-rows');
  exercise.sets.forEach((set, index) => {
    setRowsContainer.appendChild(buildEditSetRow(set, index));
  });

  return block;
}

function buildEditForm(workout) {
  const form = entryEditTemplate.content.firstElementChild.cloneNode(true);
  form.querySelector('.workout-name-input').value = workout.title;
  form.querySelector('.session-date-input').value = workout.date;

  const exercisesContainer = form.querySelector('.edit-exercises');
  workout.exercises.forEach((exercise) => {
    exercisesContainer.appendChild(buildEditExercise(exercise));
  });

  return form;
}

function readEditForm(form) {
  const name = form.querySelector('.workout-name-input').value.trim();
  const date = form.querySelector('.session-date-input').value;

  const exercises = [...form.querySelectorAll('.edit-exercise')].map((exerciseBlock) => {
    const setRowsContainer = exerciseBlock.querySelector('.edit-set-rows');

    return {
      id: exerciseBlock.dataset.exerciseId,
      name: exerciseBlock.querySelector('.exercise-name-input').value.trim(),
      sets: [...setRowsContainer.querySelectorAll('.set-row')].map((row) => ({
        id: row.dataset.setId,
        weight: row.querySelector('.weight-input').value,
        reps: row.querySelector('.reps-input').value,
        rpe: row.querySelector('.rpe-input').value,
      })),
    };
  });

  return { name, date, exercises };
}

function validateEditForm(form) {
  const errorEl = form.querySelector('.edit-error');
  const nameInput = form.querySelector('.workout-name-input');
  const nameValue = nameInput.value.trim();

  const nameError =
    validateRequired(nameValue, 'Workout name') ||
    validateLength(nameValue, NAME_MIN_LENGTH, NAME_MAX_LENGTH, 'Workout name');

  if (nameError) {
    showError(nameInput, errorEl, nameError);
    return false;
  }
  clearError(nameInput, errorEl);

  for (const exerciseBlock of form.querySelectorAll('.edit-exercise')) {
    const exerciseNameInput = exerciseBlock.querySelector('.exercise-name-input');
    const exerciseNameValue = exerciseNameInput.value.trim();

    const exerciseNameError =
      validateRequired(exerciseNameValue, 'Exercise name') ||
      validateLength(exerciseNameValue, NAME_MIN_LENGTH, NAME_MAX_LENGTH, 'Exercise name');

    if (exerciseNameError) {
      showError(exerciseNameInput, errorEl, exerciseNameError);
      return false;
    }
    clearError(exerciseNameInput, errorEl);

    const setRowsContainer = exerciseBlock.querySelector('.edit-set-rows');

    for (const row of setRowsContainer.querySelectorAll('.set-row')) {
      const weightInput = row.querySelector('.weight-input');
      const repsInput = row.querySelector('.reps-input');
      const rpeInput = row.querySelector('.rpe-input');

      const weightError = validateNumberInRange(weightInput.value, WEIGHT_MIN, WEIGHT_MAX, 'Weight');
      const repsError = validateNumberInRange(repsInput.value, REPS_MIN, REPS_MAX, 'Reps');
      const rpeError = validateNumberInRange(rpeInput.value, RPE_MIN, RPE_MAX, 'RPE');

      const firstError = weightError || repsError || rpeError;

      if (firstError) {
        const firstInput = weightError ? weightInput : repsError ? repsInput : rpeInput;
        showError(firstInput, errorEl, firstError);
        return false;
      }

      clearError(weightInput, errorEl);
      clearError(repsInput, errorEl);
      clearError(rpeInput, errorEl);
    }
  }

  return true;
}

// ---------- edit mode lifecycle ----------

function exitEditMode() {
  renderHistoryPage(currentWorkouts, historyRenderConfig);
}

async function saveEdit(workout, form) {
  if (!validateEditForm(form)) return;

  const saveBtn = form.querySelector('.save-edit-btn');
  const cancelBtn = form.querySelector('.cancel-edit-btn');
  const errorEl = form.querySelector('.edit-error');

  saveBtn.disabled = true;
  cancelBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  const { name, date, exercises } = readEditForm(form);

  try {
    await updateWorkoutWithDetails({ id: workout.id, name, date, exercises });
    await renderHistoryView();
  } catch (error) {
    console.error('Failed to save workout edits:', error);
    errorEl.textContent = 'Something went wrong saving your changes. Please try again.';
    saveBtn.disabled = false;
    cancelBtn.disabled = false;
    saveBtn.textContent = 'Save changes';
  }
}

function enterEditMode(workout, historyEntryEl) {
  historyEntryEl.classList.add('open', 'editing');
  historyEntryEl.querySelector('.entry-summary').disabled = true;

  const expandBtn = historyEntryEl.querySelector('.expand-toggle-btn');
  if (expandBtn) expandBtn.disabled = true;

  const deleteBtn = historyEntryEl.querySelector('.delete-entry-btn');
  if (deleteBtn) deleteBtn.disabled = true;

  const editBtn = historyEntryEl.querySelector('.edit-entry-btn');
  if (editBtn) editBtn.disabled = true;

  const exercisesContainer = historyEntryEl.querySelector('.entry-exercises');
  exercisesContainer.innerHTML = '';

  const form = buildEditForm(workout);

  form.querySelector('.cancel-edit-btn').addEventListener('click', () => {
    exitEditMode();
  });

  form.querySelector('.save-edit-btn').addEventListener('click', () => {
    saveEdit(workout, form);
  });

  exercisesContainer.appendChild(form);
}

// ---------- delete ----------

async function handleDeleteWorkout(workout, historyEntryEl) {
  const confirmed = window.confirm(`Delete "${workout.title}"? This can't be undone.`);
  if (!confirmed) return;

  const deleteBtn = historyEntryEl.querySelector('.delete-entry-btn');
  const editBtn = historyEntryEl.querySelector('.edit-entry-btn');
  const summaryBtn = historyEntryEl.querySelector('.entry-summary');
  const expandBtn = historyEntryEl.querySelector('.expand-toggle-btn');

  deleteBtn.disabled = true;
  editBtn.disabled = true;
  summaryBtn.disabled = true;
  if (expandBtn) expandBtn.disabled = true;

  try {
    await deleteWorkoutWithDetails({ id: workout.id, exercises: workout.exercises });
    await renderHistoryView();
  } catch (error) {
    console.error('Failed to delete workout:', error);
    window.alert('Failed to delete workout. Please try again.');
    deleteBtn.disabled = false;
    editBtn.disabled = false;
    summaryBtn.disabled = false;
    if (expandBtn) expandBtn.disabled = false;
  }
}

// ---------- initial load ----------

async function renderHistoryView() {
  const user = getCurrentUser();

  try {
    currentWorkouts = await getWorkoutsForUser(user.id);

    const stats = computeDashboardStats(currentWorkouts);
    thisWeekEl.textContent = stats.thisWeek;
    perMonthEl.textContent = stats.perMonth;
    totalEl.textContent = stats.total;

    renderHistoryPage(currentWorkouts, historyRenderConfig);
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

renderHistoryView();