import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      // Next.js entry points and wiring are covered by the end-to-end suite.
      exclude: ['src/**/*.test.{ts,tsx}', 'src/app/**', 'src/server/**', 'src/instrumentation.ts'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 95, functions: 95, branches: 90, statements: 95 },
    },
  },
});
