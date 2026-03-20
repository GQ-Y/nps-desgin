import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    base: env.VITE_BASE ?? '/',
    build: { outDir: env.VITE_OUT_DIR ?? 'dist' },
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/login': { target: 'http://127.0.0.1:8080', changeOrigin: true },
        '/index': { target: 'http://127.0.0.1:8080', changeOrigin: true },
        '/client': { target: 'http://127.0.0.1:8080', changeOrigin: true },
        '/api': { target: 'http://127.0.0.1:8080', changeOrigin: true },
        '/auth': { target: 'http://127.0.0.1:8080', changeOrigin: true },
      },
    },
  };
});
