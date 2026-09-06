// RepJournal — operations on the "users" collection

import pb from '../pocketbase.js';

export async function isUsernameTaken(username) {
  try {
    await pb.collection('users').getFirstListItem(
      pb.filter('username = {:username}', { username }),
      { fields: 'id' }
    );
    return true;
  } catch (error) {
    if (error?.status === 404) {
      return false;
    }
    console.error('Username availability check failed:', error.status, error.message);
    throw error;
  }
}

export function createUser({ name, username, password, passwordConfirm }) {
  return pb.collection('users').create({
    name,
    username,
    password,
    passwordConfirm,
  });
}