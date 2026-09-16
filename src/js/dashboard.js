// RepJournal — Dashboard (Home) page
// Pulls the current user's workouts from PocketBase and renders the
// greeting, streak stats, and recent-workouts list from real data.

import { requireAuth, getCurrentUser } from './modules/auth.js';
import { getWorkoutsForUser } from './modules/api/workouts.js';
import { renderDashboardPage } from './modules/render.js';
import { formatWeekdayLong } from './modules/format.js';

requireAuth();

const greetingEl = document.getElementById('greeting');
const greetingSubEl = document.getElementById('greeting-sub');
const thisWeekEl = document.getElementById('stat-this-week');
const perMonthEl = document.getElementById('stat-per-month');
const totalEl = document.getElementById('stat-total');
const entryListEl = document.getElementById('entry-list');
const emptyStateEl = document.getElementById('empty-state');
const entryTemplate = document.getElementById('entry-template');

// Doesn't depend on fetched data, so set it immediately.
greetingEl.textContent = `${formatWeekdayLong(new Date())}'s session`;

async function loadDashboard() {
  const user = getCurrentUser();

  try {
    const workouts = await getWorkoutsForUser(user.id);

    renderDashboardPage(workouts, {
      greetingSubEl,
      thisWeekEl,
      perMonthEl,
      totalEl,
      entryListEl,
      emptyStateEl,
      entryTemplate,
    });
  } catch (error) {
    console.error('Failed to load dashboard:', error);
  }
}

loadDashboard();