// RepJournal — History page
// Renders every logged workout for the current user, grouped by month,
// each collapsible to show its exercises and per-set weight/reps/RPE.
// RPE is optional, so it's only shown on the sets where it was
// actually recorded. Streak-row numbers reuse the same stats helper
// as the dashboard.

import { requireAuth, getCurrentUser } from './modules/auth.js';
import { getWorkoutsForUser } from './modules/api/workouts.js';
import { renderHistoryPage as renderHistoryEntries } from './modules/render.js';
import { computeDashboardStats } from './modules/stats.js';

requireAuth();

const historyGroupsContainer = document.getElementById('history-groups');
const historyEmptyState = document.getElementById('empty-state');
const historySummaryEl = document.getElementById('history-summary');

const historyMonthGroupTemplate = document.getElementById('month-group-template');
const historyEntryTemplate = document.getElementById('history-entry-template');
const historyDetailExerciseTemplate = document.getElementById('detail-exercise-template');
const historyDetailSetTemplate = document.getElementById('detail-set-template');

const thisWeekEl = document.getElementById('stat-this-week');
const perMonthEl = document.getElementById('stat-per-month');
const totalEl = document.getElementById('stat-total');

async function renderHistoryView() {
  const user = getCurrentUser();

  try {
    const historyEntries = await getWorkoutsForUser(user.id);

    const stats = computeDashboardStats(historyEntries);
    thisWeekEl.textContent = stats.thisWeek;
    perMonthEl.textContent = stats.perMonth;
    totalEl.textContent = stats.total;

    renderHistoryEntries(historyEntries, {
      historyGroupsContainer,
      historyEmptyState,
      historySummaryEl,
      historyMonthGroupTemplate,
      historyEntryTemplate,
      historyDetailExerciseTemplate,
      historyDetailSetTemplate,
    });
  } catch (error) {
    console.error('Failed to load history:', error);
  }
}

renderHistoryView();