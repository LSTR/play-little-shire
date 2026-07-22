import { defineConfig } from 'vite';

// base './' so the built app also works from inside the Android WebView (Capacitor)
export default defineConfig({
  base: './',
  server: { host: true },
});
