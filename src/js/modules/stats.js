function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + diffToMonday);
  result.setHours(0, 0, 0, 0);
  return result;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function computeDashboardStats(workouts, now = new Date()) {
  const weekStart = startOfWeek(now);
  const monthStart = startOfMonth(now);

  let thisWeek = 0;
  let perMonth = 0;

  workouts.forEach((workout) => {
    const workoutDate = new Date(`${workout.date}T00:00:00`);
    if (workoutDate >= weekStart) thisWeek += 1;
    if (workoutDate >= monthStart) perMonth += 1;
  });

  return { thisWeek, perMonth, total: workouts.length };
}