import pb from '../pocketbase.js';

export function createSet({ exercise, weight, reps, rpe }) {
  return pb.collection('sets').create({ exercise, weight, reps, rpe });
}