import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3010',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // webServer commented out - assumes dev server already running on port 3001
  // webServer: {
  //   command: 'npm run dev -- -p 3001',
  //   url: 'http://localhost:3001',
  //   reuseExistingServer: true,
  //   timeout: 120000,
  // },
});
