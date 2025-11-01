import { FullConfig } from '@playwright/test';

/**
 * Global Setup
 * Runs once before all tests
 * Use for: authentication, test data setup, environment checks
 */
async function globalSetup(config: FullConfig) {
  // Example: Setup authentication, create test data, etc.
  // console.log('Global setup running...');
}

export default globalSetup;