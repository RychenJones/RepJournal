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