import pb from '../pocketbase.js';

export function createExercise({ workout, name }) {
  return pb.collection('exercises').create({ workout, name });
}