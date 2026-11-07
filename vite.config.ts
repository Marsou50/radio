import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Des chemins relatifs permettent le déploiement sur GitHub Pages (/radio/).
  base: './',
  server: { host: '0.0.0.0', allowedHosts: true },
});
