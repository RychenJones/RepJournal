import pb from '../pocketbase.js';
import { createExercise } from './exercises.js';
import { createSet } from './sets.js';

export function createWorkout({ user, name, date }) {
  return pb.collection('workouts').create({ user, name, date });
}

export async function saveWorkoutWithDetails({ user, name, date, exercises }) {
  const workout = await createWorkout({ user, name, date });

  for (const exercise of exercises) {
    const savedExercise = await createExercise({ workout: workout.id, name: exercise.name });

    for (const set of exercise.sets) {
      await createSet({
        exercise: savedExercise.id,
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
      });
    }
  }

  return workout;
}

/**
 * Fetch every workout for a user, with exercises and sets expanded via
 * PocketBase back-relations, newest first. Returned shape matches what
 * render.js expects: { id, date, title, exercises: [{ name, sets }] }.
 */
export async function getWorkoutsForUser(userId) {
  const workouts = await pb.collection('workouts').getFullList({
    filter: pb.filter('user = {:user}', { user: userId }),
    sort: '-date',
    expand: 'exercises_via_workout.sets_via_exercise',
  });

  return workouts.map((workout) => {
    const rawExercises = workout.expand?.exercises_via_workout ?? [];

    const exercises = [...rawExercises]
      .sort((a, b) => new Date(a.created) - new Date(b.created))
      .map((exercise) => {
        const rawSets = exercise.expand?.sets_via_exercise ?? [];

        const sets = [...rawSets]
          .sort((a, b) => new Date(a.created) - new Date(b.created))
          .map((set) => ({
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
          }));

        return { name: exercise.name, sets };
      });

    return {
      id: workout.id,
      // PocketBase date fields come back as "2026-09-06 00:00:00.000Z";
      // slice to the YYYY-MM-DD format format.js's helpers expect.
      date: workout.date.slice(0, 10),
      title: workout.name,
      exercises,
    };
  });
}