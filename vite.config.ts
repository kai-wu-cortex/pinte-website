import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { prerender } from './prerender';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), {
    ...prerender,
    apply: 'build' as const,
  }],
  // Use relative base path to ensure assets are found regardless of deployment directory
  base: './', 
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    host: true,
    proxy: {
      '/api/notion': {
        target: 'https://api.notion.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/notion/, ''),
      },
    },
  }
});
