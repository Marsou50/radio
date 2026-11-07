import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // GitHub Pages publie ce dépôt sous /radio/ ; l’aperçu local reste à la racine.
  base: process.env.GITHUB_ACTIONS ? '/radio/' : '/',
  server: { host: '0.0.0.0', allowedHosts: true },
});
