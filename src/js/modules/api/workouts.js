import pb from '../pocketbase.js';
import { createExercise, updateExercise, deleteExercise } from './exercises.js';
import { createSet, updateSet, deleteSet } from './sets.js';

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

export function updateWorkout({ id, name, date }) {
  return pb.collection('workouts').update(id, { name, date });
}

/**
 * Updates an existing workout plus all of its already-created exercises
 * and sets. `exercises` must be the full list, each with the id of the
 * existing exercise/set record to update (this does not add or remove
 * exercises/sets — only edits values on records that already exist).
 */
export async function updateWorkoutWithDetails({ id, name, date, exercises }) {
  const workout = await updateWorkout({ id, name, date });

  for (const exercise of exercises) {
    await updateExercise({ id: exercise.id, name: exercise.name });

    for (const set of exercise.sets) {
      await updateSet({
        id: set.id,
        weight: set.weight,
        reps: set.reps,
        rpe: set.rpe,
      });
    }
  }

  return workout;
}

export function deleteWorkout(id) {
  return pb.collection('workouts').delete(id);
}

/**
 * Deletes a workout along with all of its exercises and sets. The
 * workout/exercise/sets relations all have cascadeDelete off, so this
 * removes children explicitly (sets, then exercises, then the workout)
 * rather than leaving orphaned rows behind.
 */
export async function deleteWorkoutWithDetails({ id, exercises }) {
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      await deleteSet(set.id);
    }
    await deleteExercise(exercise.id);
  }

  await deleteWorkout(id);
}

/**
 * Fetch every workout for a user, with exercises and sets expanded via
 * PocketBase back-relations, newest first. Returned shape matches what
 * render.js expects: { id, date, title, exercises: [{ id, name, sets }] },
 * where each set is { id, weight, reps, rpe }. Ids are included so the
 * history page can edit or delete existing records in place.
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
            id: set.id,
            weight: set.weight,
            reps: set.reps,
            rpe: set.rpe,
          }));

        return { id: exercise.id, name: exercise.name, sets };
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