// /src/js/modules/format.js
// RepJournal — data formatting helpers
// Pure functions turning raw data into display text. Not used yet —
// workout history and log-workout will lean on this for dates,
// weights, and set/rep counts.

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}