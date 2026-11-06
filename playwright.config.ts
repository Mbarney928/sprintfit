import { defineConfig, devices } from '@playwright/test';

const ci = Boolean(process.env['CI']);

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:4173', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] }, testIgnore: /storybook/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testIgnore: /storybook/ },
    {
      name: 'storybook',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:6007' },
      testMatch: /storybook/,
    },
  ],
  webServer: [
    {
      command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !ci,
      timeout: 120_000,
    },
    {
      command: 'npx vite preview --outDir storybook-static --host 127.0.0.1 --port 6007 --strictPort',
      url: 'http://127.0.0.1:6007',
      reuseExistingServer: !ci,
    },
  ],
});
