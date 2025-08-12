import { defineConfig, devices } from '@playwright/test';

const appPortForTests = 9130;

export default defineConfig({
  testDir: './ui-tests/specs',
  testMatch: /.*\.uispec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 30000,
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    baseURL: `http://localhost:${appPortForTests}`,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
  webServer: [
    {
      command: 'pnpm run ui-tests:server',
      url: `http://localhost:${appPortForTests}`,
    },
  ],
});
