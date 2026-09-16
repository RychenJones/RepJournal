export function toDateInputValue(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - offsetMs);
  return localDate.toISOString().slice(0, 10);
}

export function formatDayAbbrev(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatWeekdayLong(date) {
  const parsedDate = typeof date === 'string' ? new Date(`${date}T00:00:00`) : date;
  return parsedDate.toLocaleDateString(undefined, { weekday: 'long' });
}

export function formatMonthLabel(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatSetLine(set) {
  const weightPart = set.weight === 0 ? 'Bodyweight' : `${set.weight} lb`;
  const base = `${weightPart} × ${set.reps}`;
  if (set.rpe === undefined || set.rpe === null || set.rpe === '') {
    return { base, rpe: null };
  }
  return { base, rpe: `RPE ${set.rpe}` };
}