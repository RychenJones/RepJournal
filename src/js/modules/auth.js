import pb from './pocketbase.js';

export function login(username, password) {
  return pb.collection('users').authWithPassword(username, password);
}

export function logout() {
  pb.authStore.clear();
}

export function isLoggedIn() {
  return pb.authStore.isValid;
}

export function getCurrentUser() {
  return pb.authStore.model;
}

export function requireAuth(redirectTo = '/index.html') {
  if (!isLoggedIn()) {
    window.location.href = redirectTo;
  }
}

export function redirectIfAuthenticated(redirectTo = '/pages/dashboard.html') {
  if (isLoggedIn()) {
    window.location.href = redirectTo;
  }
}