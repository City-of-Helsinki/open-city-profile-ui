import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',

  // Timeout for each test in milliseconds
  timeout: 120 * 1000,

  // Configuration for the expect assertion library
  expect: {
    timeout: 15000,
  },

  /* Run tests in files in parallel */
  fullyParallel: false,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['junit', { outputFile: 'report/e2e-junit-results.xml' }],
    ['html', { open: 'never', outputFolder: 'report/html' }],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chrome',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/*.spec.ts',
    },
  ],
});
