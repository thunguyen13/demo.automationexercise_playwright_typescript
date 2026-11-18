import { defineConfig, devices } from '@playwright/test';
import { getVietnameseTimestamp } from '@utils/helpers';
import { DEFAULT_URL } from '@config/env.config';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */

const outputDir = process.env.CI
  ? "playwright-report"
  : process.env.TEST_OUTPUT_DIR ??
    path.join(__dirname, "results", getVietnameseTimestamp());
const reportDir = path.join(outputDir, "html-report");

process.env.TEST_OUTPUT_DIR = outputDir;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      'html', { 
        outputFolder: reportDir,
        open: 'never' }
    ],
  ],
  timeout: 180000, // Maximum time one test can run for. Default is 3 minutes
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    actionTimeout: 30000, // Maximum time each action can take. Defaults to 30 seconds, pass 0 to disable timeout.

    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: DEFAULT_URL.BASE_URL,

    screenshot: 'on',

    video: 'on',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',

    /* Set testId attribute for selectors */
    testIdAttribute: 'data-qa',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 630 },
      },
    },
    {
      name: 'ui-firefox',
      testDir: './tests/ui',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 630 },
      },
    },
    {
      name: 'ui-webkit',
      testDir: './tests/ui',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 630 },
      },
    },
    {
      name: 'api',
      testDir: './tests/api',
    }
  ],
});
