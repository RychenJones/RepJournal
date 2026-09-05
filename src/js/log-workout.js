// RepJournal — Log workout page interactivity
// Handles: adding/removing exercises, adding/removing sets per exercise,
// renumbering sets, and keeping the sticky finish bar's counts in sync.
// Weight and reps are required per set; RPE is optional.

const exerciseList = document.getElementById('exercise-list');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const finishBtn = document.getElementById('finish-workout-btn');
const exerciseCountEl = document.getElementById('finish-exercise-count');
const setCountEl = document.getElementById('finish-set-count');
const sessionDateEl = document.getElementById('session-date');

const exerciseTemplate = document.getElementById('exercise-template');
const setRowTemplate = document.getElementById('set-row-template');

/**
 * Renumber the "Set" column (1, 2, 3…) within a single exercise card.
 */
function renumberSets(exerciseCard) {
  const rows = exerciseCard.querySelectorAll('.set-rows .set-row');
  rows.forEach((row, i) => {
    row.querySelector('.set-number').textContent = i + 1;
  });
}

/**
 * Recount total exercises and sets, update the sticky finish bar,
 * and disable "Finish workout" until there's at least one logged set.
 */
function updateSummary() {
  const exerciseCards = exerciseList.querySelectorAll('.exercise-card');
  const setRows = exerciseList.querySelectorAll('.set-rows .set-row');

  const exerciseCount = exerciseCards.length;
  const setCount = setRows.length;

  exerciseCountEl.textContent = `${exerciseCount} exercise${exerciseCount === 1 ? '' : 's'}`;
  setCountEl.textContent = `${setCount} set${setCount === 1 ? '' : 's'}`;

  finishBtn.disabled = setCount === 0;
}

/**
 * Append a new (empty) set row to the given exercise card.
 */
function addSetRow(exerciseCard) {
  const row = setRowTemplate.content.firstElementChild.cloneNode(true);
  exerciseCard.querySelector('.set-rows').appendChild(row);
  renumberSets(exerciseCard);
  updateSummary();
  row.querySelector('.weight-input').focus();
}

/**
 * Append a new exercise card (with one starter set row) to the list.
 */
function addExercise() {
  const card = exerciseTemplate.content.firstElementChild.cloneNode(true);
  exerciseList.appendChild(card);
  addSetRow(card);
  card.querySelector('.exercise-name-input').focus();
}

// --- event delegation: one listener handles all cards/rows, present or future ---

exerciseList.addEventListener('click', (e) => {
  const addSetBtn = e.target.closest('.add-set-btn');
  if (addSetBtn) {
    addSetRow(addSetBtn.closest('.exercise-card'));
    return;
  }

  const removeSetBtn = e.target.closest('.remove-set-btn');
  if (removeSetBtn) {
    const card = removeSetBtn.closest('.exercise-card');
    removeSetBtn.closest('.set-row').remove();
    renumberSets(card);
    updateSummary();
    return;
  }

  const removeExerciseBtn = e.target.closest('.remove-exercise-btn');
  if (removeExerciseBtn) {
    removeExerciseBtn.closest('.exercise-card').remove();
    updateSummary();
    return;
  }
});

addExerciseBtn.addEventListener('click', addExercise);

/**
 * Gather the workout into a plain object. RPE is included only when
 * the person entered one — it stays optional all the way through.
 */
function collectWorkout() {
  const exercises = [];

  exerciseList.querySelectorAll('.exercise-card').forEach((card) => {
    const name = card.querySelector('.exercise-name-input').value.trim();
    const sets = [];

    card.querySelectorAll('.set-rows .set-row').forEach((row) => {
      const weight = row.querySelector('.weight-input').value;
      const reps = row.querySelector('.reps-input').value;
      const rpe = row.querySelector('.rpe-input').value;

      sets.push({
        weight: weight === '' ? null : Number(weight),
        reps: reps === '' ? null : Number(reps),
        rpe: rpe === '' ? undefined : Number(rpe), // omitted entirely when blank
      });
    });

    exercises.push({ name, sets });
  });

  return { date: sessionDateEl.value, exercises };
}

finishBtn.addEventListener('click', () => {
  const workout = collectWorkout();
  // Hand off point: wire this into your save/sync logic (API call,
  // local storage, etc). Left as a console log for now.
  console.log('Workout ready to save:', workout);
});

// --- init: friendly date + one exercise to start from ---

sessionDateEl.value = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD, matches <input type="date">


addExercise();