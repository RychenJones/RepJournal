import { formatDayAbbrev, formatMonthLabel, formatSetLine } from './format.js';

function countHistorySets(workout) {
  return workout.exercises.reduce((totalSets, exercise) => totalSets + exercise.sets.length, 0);
}

export function buildHistoryEntry(workout, historyTemplates) {
  const {
    historyEntryTemplate,
    historyDetailExerciseTemplate,
    historyDetailSetTemplate,
  } = historyTemplates;

  const historyEntry = historyEntryTemplate.content.firstElementChild.cloneNode(true);

  historyEntry.querySelector('.entry-day').textContent = formatDayAbbrev(workout.date);
  historyEntry.querySelector('.entry-title').textContent = workout.title;
  historyEntry.querySelector('.entry-meta').textContent =
    `${workout.exercises.length} exercise${workout.exercises.length === 1 ? '' : 's'} · ${countHistorySets(workout)} sets`;

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
        })
      );
    });

    historyGroupsContainer.appendChild(monthGroup);
  });
}
