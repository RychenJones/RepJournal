import { formatDayAbbrev, formatMonthLabel, formatSetLine, formatWeekdayLong } from './format.js';
import { computeDashboardStats } from './stats.js';

function countSets(workout) {
  return workout.exercises.reduce((totalSets, exercise) => totalSets + exercise.sets.length, 0);
}

// ---------------------------------------------------------------------------
// History page
// ---------------------------------------------------------------------------

export function buildHistoryEntry(workout, historyTemplates) {
  const {
    historyEntryTemplate,
    historyDetailExerciseTemplate,
    historyDetailSetTemplate,
    onEdit,
  } = historyTemplates;

  const historyEntry = historyEntryTemplate.content.firstElementChild.cloneNode(true);

  historyEntry.querySelector('.entry-day').textContent = formatDayAbbrev(workout.date);
  historyEntry.querySelector('.entry-title').textContent = workout.title;
  historyEntry.querySelector('.entry-meta').textContent =
    `${workout.exercises.length} exercise${workout.exercises.length === 1 ? '' : 's'} · ${countSets(workout)} sets`;

  const historyExercisesContainer = historyEntry.querySelector('.entry-exercises');

  workout.exercises.forEach((exercise) => {
    const historyExercise = historyDetailExerciseTemplate.content.firstElementChild.cloneNode(true);
    historyExercise.querySelector('.detail-exercise-name').textContent = exercise.name;

    const historySetList = historyExercise.querySelector('.detail-set-list');

    exercise.sets.forEach((set, setIndex) => {
      const historySetRow = historyDetailSetTemplate.content.firstElementChild.cloneNode(true);
      historySetRow.querySelector('.detail-set-num').textContent = setIndex + 1;

      const { base, rpe } = formatSetLine(set);
      const historySetLine = historySetRow.querySelector('.detail-set-line');
      historySetLine.textContent = base + (rpe ? ' ' : '');

      if (rpe) {
        const historyRpeTag = document.createElement('span');
        historyRpeTag.className = 'rpe-tag';
        historyRpeTag.textContent = `@ ${rpe}`;
        historySetLine.appendChild(historyRpeTag);
      }

      historySetList.appendChild(historySetRow);
    });

    historyExercisesContainer.appendChild(historyExercise);
  });

  historyEntry.querySelector('.entry-summary').addEventListener('click', () => {
    historyEntry.classList.toggle('open');
  });

  const editBtn = historyEntry.querySelector('.edit-entry-btn');
  if (editBtn && onEdit) {
    editBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      onEdit(workout, historyEntry);
    });
  }

  return historyEntry;
}

export function renderHistoryPage(historyEntries, historyRenderConfig) {
  const {
    historyGroupsContainer,
    historyEmptyState,
    historySummaryEl,
    historyMonthGroupTemplate,
    historyEntryTemplate,
    historyDetailExerciseTemplate,
    historyDetailSetTemplate,
    onEdit,
  } = historyRenderConfig;

  historyGroupsContainer.innerHTML = '';

  if (historyEntries.length === 0) {
    historyEmptyState.hidden = false;
    historySummaryEl.textContent = '0 workouts logged';
    return;
  }

  historyEmptyState.hidden = true;
  historySummaryEl.textContent = `${historyEntries.length} workout${historyEntries.length === 1 ? '' : 's'} logged`;

  const historyEntriesByMonth = new Map();

  historyEntries.forEach((workout) => {
    const monthLabel = formatMonthLabel(workout.date);

    if (!historyEntriesByMonth.has(monthLabel)) {
      historyEntriesByMonth.set(monthLabel, []);
    }

    historyEntriesByMonth.get(monthLabel).push(workout);
  });

  historyEntriesByMonth.forEach((workoutsForMonth, monthLabel) => {
    const monthGroup = historyMonthGroupTemplate.content.firstElementChild.cloneNode(true);
    monthGroup.querySelector('.month-title').textContent = monthLabel;

    const monthEntriesContainer = monthGroup.querySelector('.month-entries');

    workoutsForMonth.forEach((workout) => {
      monthEntriesContainer.appendChild(
        buildHistoryEntry(workout, {
          historyEntryTemplate,
          historyDetailExerciseTemplate,
          historyDetailSetTemplate,
          onEdit,
        })
      );
    });

    historyGroupsContainer.appendChild(monthGroup);
  });
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------

export function buildDashboardEntry(workout, entryTemplate) {
  const entry = entryTemplate.content.firstElementChild.cloneNode(true);

  entry.querySelector('.entry-day').textContent = formatDayAbbrev(workout.date);
  entry.querySelector('.entry-title').textContent = workout.title;
  entry.querySelector('.entry-meta').textContent =
    `${workout.exercises.length} exercise${workout.exercises.length === 1 ? '' : 's'} · ${countSets(workout)} sets`;

  return entry;
}

export function renderDashboardPage(workouts, dashboardConfig) {
  const {
    greetingSubEl,
    thisWeekEl,
    perMonthEl,
    totalEl,
    entryListEl,
    emptyStateEl,
    entryTemplate,
    maxEntries = 5,
  } = dashboardConfig;

  const stats = computeDashboardStats(workouts);
  thisWeekEl.textContent = stats.thisWeek;
  perMonthEl.textContent = stats.perMonth;
  totalEl.textContent = stats.total;

  entryListEl.innerHTML = '';

  if (workouts.length === 0) {
    emptyStateEl.hidden = false;
    greetingSubEl.textContent = 'No workouts logged yet';
    return;
  }

  emptyStateEl.hidden = true;

  const mostRecent = workouts[0];
  greetingSubEl.textContent = `Last workout: ${formatWeekdayLong(mostRecent.date)} · ${mostRecent.title}`;

  workouts.slice(0, maxEntries).forEach((workout) => {
    entryListEl.appendChild(buildDashboardEntry(workout, entryTemplate));
  });
}