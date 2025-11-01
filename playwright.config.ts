import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import * as dotenv from 'dotenv';
import {
  BASE_URL,
  DEFAULT_TIMEOUT,
  IS_CI,
  PARALLEL_WORKERS,
  SCREENSHOT_ON_FAILURE,
  VIDEO_ON_FAILURE,
  TRACE_ON_RETRY
} from './utils/app-config';

/**
 * Playwright Configuration
 * See https://playwright.dev/docs/test-configuration
 */

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  // Test directory
  testDir: './tests',

  // Test timeout (configurable via environment)
  timeout: DEFAULT_TIMEOUT,

  // Expect timeout (10 seconds)
  expect: {
    timeout: 10 * 1000,
  },

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: IS_CI,

  // Retry on CI only
  retries: IS_CI ? 2 : 0,

  // Run tests sequentially or in parallel (configurable via environment)
  workers: PARALLEL_WORKERS,

  // Run tests in files in parallel
  fullyParallel: true,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    // Enhanced custom reporter with HTML, JSON, and failure analysis
    ['./reporting/reporters/enhanced-reporter.ts', {
      outputFolder: 'test-results/reports',
      outputHTML: true,
      outputJSON: true,
    }],
    IS_CI ? ['json', { outputFile: 'test-results/results.json' }] : null,
  ].filter(Boolean) as any,

  // Shared settings for all projects
  use: {
    // Base URL for Weem website (configurable via environment)
    baseURL: BASE_URL,

    // Collect trace when retrying the failed test (configurable via environment)
    trace: TRACE_ON_RETRY ? 'on-first-retry' : 'off',

    // Screenshot on failure (configurable via environment)
    screenshot: SCREENSHOT_ON_FAILURE ? 'only-on-failure' : 'off',

    // Video on failure (configurable via environment)
    video: VIDEO_ON_FAILURE ? 'retain-on-failure' : 'off',

    // Browser context options
    viewport: { width: 1920, height: 1080 },

    // Slower navigation to help with loading times
    actionTimeout: 15000,
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // You can also use mobile device viewport if needed:
        // viewport: { width: 375, height: 667 }, // iPhone
      },
    },
    // Only Chromium browser for Weem testing
  ],

  // Global setup/teardown
  // globalSetup: require.resolve('./fixtures/global-setup.ts'),
  // globalTeardown: require.resolve('./fixtures/global-teardown.ts'),

  // Output directory for test artifacts
  outputDir: 'test-results',
});
