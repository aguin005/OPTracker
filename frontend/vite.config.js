import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the build works from any folder, including the
  // /OPTracker/ path GitHub Pages serves this repository's site from.
  base: './',
})
