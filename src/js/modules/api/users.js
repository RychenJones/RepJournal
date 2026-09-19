// RepJournal — operations on the "users" collection

import pb from '../pocketbase.js';

// excludeId lets the profile page re-check availability while editing a
// user's own record without the check tripping on their current username.
export async function isUsernameTaken(username, excludeId = null) {
  try {
    const filter = excludeId
      ? pb.filter('username = {:username} && id != {:id}', { username, id: excludeId })
      : pb.filter('username = {:username}', { username });

    await pb.collection('users').getFirstListItem(filter, { fields: 'id' });
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

export function updateUserDetails(userId, { name, username }) {
  return pb.collection('users').update(userId, { name, username });
}

// PocketBase requires oldPassword for a non-superuser to change their own
// password (server-enforced, not optional) — it also invalidates the
// caller's current auth token, so the page must re-login after this.
export function updateUserPassword(userId, { oldPassword, password, passwordConfirm }) {
  return pb.collection('users').update(userId, { oldPassword, password, passwordConfirm });
}