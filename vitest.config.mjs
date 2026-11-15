import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: [],
    include: ['tests/unit/**/*.{test,spec}.{js,jsx}', 'tests/integration/**/*.{test,spec}.{js,jsx}'],
  },
});
