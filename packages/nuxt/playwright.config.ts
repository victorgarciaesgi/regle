import type { ConfigOptions } from '@nuxt/test-utils/playwright';
import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { isCI, isWindows } from 'std-env';

const frontAppPort = 3864;

export default defineConfig<ConfigOptions>({
  testDir: 'test/ui-tests',
  testMatch: /.*\.uispec\.ts/,
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: isWindows ? 60000 : undefined,
  reporter: 'html',
  use: {
    baseURL: `https://localhost:${frontAppPort}`,
    trace: 'on-first-retry',
    launchOptions: {
      args: ['--disable-web-security', '--allow-insecure-localhost'],
    },
    screenshot: 'only-on-failure',
    nuxt: {
      rootDir: fileURLToPath(new URL('./test/fixtures', import.meta.url)),
      port: frontAppPort,
      dev: true,
    },
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
});
