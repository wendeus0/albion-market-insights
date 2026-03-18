import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const systemChromiumPath = existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'VITE_USE_REAL_API=false npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: systemChromiumPath ? { executablePath: systemChromiumPath } : {},
      },
    },
  ],
});
