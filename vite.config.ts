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
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three'],
          notion: ['@notionhq/client', 'notion-to-md'],
        },
      },
    },
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
