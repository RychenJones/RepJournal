import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        createAccount: resolve(__dirname, 'pages/create-account.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        logWorkout: resolve(__dirname, 'pages/log-workout.html'),
        history: resolve(__dirname, 'pages/history.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
      },
    },
  },
});