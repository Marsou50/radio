import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    {
      name: 'development-source-index',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          if (req.url === '/' || req.url === '/index.html') req.url = '/index.source.html';
          next();
        });
      },
    },
  ],
  // Le site public est servi sous https://marsou50.github.io/radio/.
  base: command === 'build' ? '/radio/' : '/',
  server: { host: '0.0.0.0', allowedHosts: true },
  build: {
    rollupOptions: {
      input: fileURLToPath(new URL('./index.source.html', import.meta.url)),
    },
  },
}));
