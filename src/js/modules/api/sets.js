import pb from '../pocketbase.js';

export function createSet({ exercise, weight, reps, rpe }) {
  return pb.collection('sets').create({ exercise, weight, reps, rpe });
}

export function updateSet({ id, weight, reps, rpe }) {
  return pb.collection('sets').update(id, { weight, reps, rpe });
}

export function deleteSet(id) {
  return pb.collection('sets').delete(id);
}