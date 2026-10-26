import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes the build work on any static host (also GitHub Pages sub-paths)
export default defineConfig({
  base: './',
  plugins: [react()],
});
