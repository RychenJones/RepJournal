// RepJournal — History page
// Renders logged workouts grouped by month, each collapsible to show
// its exercises and per-set weight/reps/RPE. RPE is optional, so it's
// only shown on the sets where it was actually recorded.
//
// NOTE: WORKOUT_HISTORY below is placeholder sample data standing in
// for whatever your real data source is (API call, local storage,
// etc). Swap loadHistory() to fetch real data — everything else
// (grouping, rendering, expand/collapse) works off the same shape.

import { renderHistoryPage as renderHistoryEntries } from './modules/render.js';

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

const historyGroupsContainer = document.getElementById('history-groups');
const historyEmptyState = document.getElementById('empty-state');
const historySummaryEl = document.getElementById('history-summary');

const historyMonthGroupTemplate = document.getElementById('month-group-template');
const historyEntryTemplate = document.getElementById('history-entry-template');
const historyDetailExerciseTemplate = document.getElementById('detail-exercise-template');
const historyDetailSetTemplate = document.getElementById('detail-set-template');

/** Placeholder for wherever this app actually gets its data from. */
function loadHistory() {
  return [...WORKOUT_HISTORY].sort((a, b) => new Date(b.date) - new Date(a.date));
}

function renderHistoryView() {
  const historyEntries = loadHistory();

  renderHistoryEntries(historyEntries, {
    historyGroupsContainer,
    historyEmptyState,
    historySummaryEl,
    historyMonthGroupTemplate,
    historyEntryTemplate,
    historyDetailExerciseTemplate,
    historyDetailSetTemplate,
  });
}

renderHistoryView();