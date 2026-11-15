import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'next/server': path.resolve(__dirname, './node_modules/next/server.js'),
    },
  },
  test: {
    server: {
      deps: {
        inline: ['next-auth'],
      },
    },
    environment: 'jsdom',
    setupFiles: [],
    include: ['tests/unit/**/*.{test,spec}.{js,jsx}', 'tests/integration/**/*.{test,spec}.{js,jsx}'],
    fileParallelism: false,
  },
});
