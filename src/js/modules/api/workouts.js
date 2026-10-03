import pb from '../pocketbase.js';
import { createExercise, updateExercise, deleteExercise } from './exercises.js';
import { createSet, updateSet, deleteSet } from './sets.js';

export function createWorkout({ user, name, date }) {
  return pb.collection('workouts').create({ user, name, date });
}

// Create the workout tree in parent-to-child order so each relation has an id.
export async function createWorkoutWithDetails({ user, name, date, exercises }) {
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

// Updates existing records only; the edit form cannot add or remove rows.
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

// Delete children first because the relations do not cascade.
export async function deleteWorkoutWithDetails({ id, exercises }) {
  for (const exercise of exercises) {
    for (const set of exercise.sets) {
      await deleteSet(set.id);
    }
    await deleteExercise(exercise.id);
  }

  await deleteWorkout(id);
}

// Return the nested shape used by the dashboard and history pages.
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
      // Keep only the date portion for local date formatting.
      date: workout.date.slice(0, 10),
      title: workout.name,
      exercises,
    };
  });
}
