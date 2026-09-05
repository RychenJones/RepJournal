// RepJournal — History page
// Renders logged workouts grouped by month, each collapsible to show
// its exercises and per-set weight/reps/RPE. RPE is optional, so it's
// only shown on the sets where it was actually recorded.
//
// NOTE: WORKOUT_HISTORY below is placeholder sample data standing in
// for whatever your real data source is (API call, local storage,
// etc). Swap loadHistory() to fetch real data — everything else
// (grouping, rendering, expand/collapse) works off the same shape.

const WORKOUT_HISTORY = [
  {
    date: '2026-09-06',
    title: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: [
        { weight: 225, reps: 5, rpe: 8 },
        { weight: 225, reps: 5, rpe: 8.5 },
        { weight: 225, reps: 5, rpe: 9 },
      ] },
      { name: 'Lat Pulldown', sets: [
        { weight: 140, reps: 10 },
        { weight: 140, reps: 10 },
        { weight: 140, reps: 9 },
      ] },
      { name: 'Barbell Row', sets: [
        { weight: 135, reps: 8, rpe: 7 },
        { weight: 135, reps: 8, rpe: 7.5 },
      ] },
    ],
  },
  {
    date: '2026-09-03',
    title: 'Push Day',
    exercises: [
      { name: 'Bench Press', sets: [
        { weight: 185, reps: 5, rpe: 8 },
        { weight: 185, reps: 5, rpe: 8 },
        { weight: 185, reps: 4, rpe: 9 },
      ] },
      { name: 'Overhead Press', sets: [
        { weight: 95, reps: 8 },
        { weight: 95, reps: 8 },
      ] },
    ],
  },
  {
    date: '2026-09-01',
    title: 'Leg Day',
    exercises: [
      { name: 'Back Squat', sets: [
        { weight: 205, reps: 5, rpe: 8 },
        { weight: 205, reps: 5, rpe: 8.5 },
        { weight: 205, reps: 5, rpe: 9 },
      ] },
      { name: 'Romanian Deadlift', sets: [
        { weight: 155, reps: 8 },
        { weight: 155, reps: 8 },
      ] },
      { name: 'Leg Press', sets: [
        { weight: 360, reps: 10 },
        { weight: 360, reps: 10 },
        { weight: 360, reps: 10 },
      ] },
    ],
  },
  {
    date: '2026-08-30',
    title: 'Upper Body',
    exercises: [
      { name: 'Incline Dumbbell Press', sets: [
        { weight: 65, reps: 8, rpe: 7 },
        { weight: 65, reps: 8, rpe: 7.5 },
      ] },
      { name: 'Seated Cable Row', sets: [
        { weight: 120, reps: 10 },
        { weight: 120, reps: 10 },
      ] },
    ],
  },
  {
    date: '2026-08-14',
    title: 'Pull Day',
    exercises: [
      { name: 'Deadlift', sets: [
        { weight: 215, reps: 5, rpe: 8 },
        { weight: 215, reps: 5, rpe: 8 },
      ] },
      { name: 'Pull-Up', sets: [
        { weight: 0, reps: 8 },
        { weight: 0, reps: 7 },
        { weight: 0, reps: 6 },
      ] },
    ],
  },
];

const groupsContainer = document.getElementById('history-groups');
const emptyState = document.getElementById('empty-state');
const summaryEl = document.getElementById('history-summary');

const monthGroupTemplate = document.getElementById('month-group-template');
const entryTemplate = document.getElementById('history-entry-template');
const detailExerciseTemplate = document.getElementById('detail-exercise-template');
const detailSetTemplate = document.getElementById('detail-set-template');

/** Placeholder for wherever this app actually gets its data from. */
function loadHistory() {
  return [...WORKOUT_HISTORY].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function formatDayAbbrev(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
}

function formatMonthLabel(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function setCount(workout) {
  return workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
}

/** "185 lb × 5 @ RPE 8" — the "@ RPE" part only appears when it was recorded. */
function formatSetLine(set) {
  const weightPart = set.weight === 0 ? 'Bodyweight' : `${set.weight} lb`;
  const base = `${weightPart} × ${set.reps}`;
  if (set.rpe === undefined || set.rpe === null || set.rpe === '') {
    return { base, rpe: null };
  }
  return { base, rpe: `RPE ${set.rpe}` };
}

function buildEntry(workout) {
  const entry = entryTemplate.content.firstElementChild.cloneNode(true);

  entry.querySelector('.entry-day').textContent = formatDayAbbrev(workout.date);
  entry.querySelector('.entry-title').textContent = workout.title;
  entry.querySelector('.entry-meta').textContent =
    `${workout.exercises.length} exercise${workout.exercises.length === 1 ? '' : 's'} · ${setCount(workout)} sets`;

  const exercisesEl = entry.querySelector('.entry-exercises');
  workout.exercises.forEach((exercise) => {
    const exerciseEl = detailExerciseTemplate.content.firstElementChild.cloneNode(true);
    exerciseEl.querySelector('.detail-exercise-name').textContent = exercise.name;

    const setListEl = exerciseEl.querySelector('.detail-set-list');
    exercise.sets.forEach((set, i) => {
      const setEl = detailSetTemplate.content.firstElementChild.cloneNode(true);
      setEl.querySelector('.detail-set-num').textContent = i + 1;

      const { base, rpe } = formatSetLine(set);
      const lineEl = setEl.querySelector('.detail-set-line');
      lineEl.textContent = base + (rpe ? ' ' : '');
      if (rpe) {
        const rpeTag = document.createElement('span');
        rpeTag.className = 'rpe-tag';
        rpeTag.textContent = `@ ${rpe}`;
        lineEl.appendChild(rpeTag);
      }

      setListEl.appendChild(setEl);
    });

    exercisesEl.appendChild(exerciseEl);
  });

  entry.querySelector('.entry-summary').addEventListener('click', () => {
    entry.classList.toggle('open');
  });

  return entry;
}

function render() {
  const history = loadHistory();

  if (history.length === 0) {
    emptyState.hidden = false;
    summaryEl.textContent = '0 workouts logged';
    return;
  }

  summaryEl.textContent = `${history.length} workout${history.length === 1 ? '' : 's'} logged`;

  const months = new Map();
  history.forEach((workout) => {
    const label = formatMonthLabel(workout.date);
    if (!months.has(label)) months.set(label, []);
    months.get(label).push(workout);
  });

  months.forEach((workouts, label) => {
    const group = monthGroupTemplate.content.firstElementChild.cloneNode(true);
    group.querySelector('.month-title').textContent = label;

    const entriesEl = group.querySelector('.month-entries');
    workouts.forEach((workout) => entriesEl.appendChild(buildEntry(workout)));

    groupsContainer.appendChild(group);
  });
}

render();