import pb from '../pocketbase.js';

// Ignore the current record when checking an edited username.
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

// PocketBase requires the old password and invalidates the current token.
export function updateUserPassword(userId, { oldPassword, password, passwordConfirm }) {
  return pb.collection('users').update(userId, { oldPassword, password, passwordConfirm });
}

export function getUserAvatarUrl(user, avatar) {
  return pb.files.getURL(user, avatar);
}
