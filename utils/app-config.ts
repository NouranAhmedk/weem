import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Environment
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

// Base URL
export const BASE_URL = process.env.BASE_URL || 'https://dev.weem.sa/en';

// Test Credentials
export const TEST_OTP = process.env.TEST_OTP || '00000';

// Phone Number Generation
export const PHONE_BASE = process.env.PHONE_BASE || '500000';
export const PHONE_RANDOM_DIGITS = Number(process.env.PHONE_RANDOM_DIGITS || '3');

// Timeouts (in milliseconds)
export const DEFAULT_TIMEOUT = Number(process.env.DEFAULT_TIMEOUT || '60000');
export const NAVIGATION_TIMEOUT = Number(process.env.NAVIGATION_TIMEOUT || '60000');
export const ELEMENT_TIMEOUT = Number(process.env.ELEMENT_TIMEOUT || '10000');

// Retry Configuration
export const MAX_RETRIES = Number(process.env.MAX_RETRIES || '3');
export const RETRY_DELAY = Number(process.env.RETRY_DELAY || '1000');

// Logging
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
export const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

// Browser Settings
export const HEADLESS = process.env.HEADLESS === 'true';
export const SLOW_MO = Number(process.env.SLOW_MO || '0');

// Screenshots & Videos
export const SCREENSHOT_ON_FAILURE = process.env.SCREENSHOT_ON_FAILURE !== 'false';
export const VIDEO_ON_FAILURE = process.env.VIDEO_ON_FAILURE !== 'false';
export const TRACE_ON_RETRY = process.env.TRACE_ON_RETRY !== 'false';

// CI/CD
export const IS_CI = process.env.CI === 'true';
export const PARALLEL_WORKERS = Number(process.env.PARALLEL_WORKERS || '1');
