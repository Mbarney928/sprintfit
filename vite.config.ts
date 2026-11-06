/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// GitHub Pages serves the demo from /<repo>/; local dev and preview use /.
const base = process.env['BASE_PATH'] ?? '/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // Keep framework code in its own long-cached chunk.
        manualChunks: (id) => (/node_modules\/(react|react-dom|scheduler|react-router)\//.test(id) ? 'react' : undefined),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx', 'src/**/index.ts', 'src/vite-env.d.ts'],
      thresholds: { lines: 85, functions: 85, statements: 85, branches: 80 },
    },
  },
});
