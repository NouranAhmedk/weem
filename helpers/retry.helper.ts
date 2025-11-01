import { Page } from '@playwright/test';
import { MAX_RETRIES, RETRY_DELAY, DEBUG_MODE } from '../utils/app-config';
import { ErrorHelper } from './error.helper';

/**
 * Retry Configuration Options
 */
export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Delay between retries in milliseconds */
  retryDelay?: number;
  /** Exponential backoff multiplier (default: 1 for linear delay) */
  backoffMultiplier?: number;
  /** Custom error message */
  errorMessage?: string;
  /** Whether to take screenshot on final failure */
  takeScreenshot?: boolean;
  /** Callback to run before each retry */
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Retry Helper
 * Provides retry logic for flaky operations
 */
export class RetryHelper {
  constructor(private page: Page) {}

  /**
   * Retry an async operation with configurable options
   * @param operation - The operation to retry
   * @param options - Retry configuration options
   */
  async retry<T>(
    operation: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = MAX_RETRIES,
      retryDelay = RETRY_DELAY,
      backoffMultiplier = 1,
      errorMessage = 'Operation failed after retries',
      takeScreenshot = false,
      onRetry,
    } = options;

    let lastError: any;
    let currentDelay = retryDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (DEBUG_MODE && attempt > 0) {
          ErrorHelper.debug(`Retry attempt ${attempt} of ${maxRetries}`);
        }

        const result = await operation();

        if (DEBUG_MODE && attempt > 0) {
          ErrorHelper.info(`Operation succeeded on attempt ${attempt + 1}`);
        }

        return result;
      } catch (error) {
        lastError = error;

        if (attempt < maxRetries) {
          if (DEBUG_MODE) {
            ErrorHelper.warn(`Attempt ${attempt + 1} failed. Retrying in ${currentDelay}ms...`);
          }

          // Call onRetry callback if provided
          if (onRetry) {
            onRetry(attempt + 1, error);
          }

          // Wait before next retry
          await this.page.waitForTimeout(currentDelay);

          // Apply exponential backoff if configured
          currentDelay = Math.floor(currentDelay * backoffMultiplier);
        }
      }
    }

    // All retries failed
    ErrorHelper.warn(`${errorMessage} (${maxRetries + 1} attempts)`);

    if (takeScreenshot) {
      const errorHandler = new ErrorHelper(this.page);
      await errorHandler.takeErrorScreenshot('retry-failed');
    }

    throw lastError;
  }

  /**
   * Retry a click action (common flaky operation)
   * @param clickFn - Function that performs the click
   * @param elementName - Name of element for error messages
   * @param options - Retry options
   */
  async retryClick(
    clickFn: () => Promise<void>,
    elementName: string,
    options: RetryOptions = {}
  ): Promise<void> {
    return this.retry(clickFn, {
      maxRetries: 3,
      retryDelay: 1000,
      errorMessage: `Failed to click ${elementName}`,
      ...options,
    });
  }

  /**
   * Retry filling an input (common flaky operation)
   * @param fillFn - Function that fills the input
   * @param elementName - Name of element for error messages
   * @param options - Retry options
   */
  async retryFill(
    fillFn: () => Promise<void>,
    elementName: string,
    options: RetryOptions = {}
  ): Promise<void> {
    return this.retry(fillFn, {
      maxRetries: 3,
      retryDelay: 1000,
      errorMessage: `Failed to fill ${elementName}`,
      ...options,
    });
  }

  /**
   * Retry navigation (common flaky operation)
   * @param navigateFn - Function that performs navigation
   * @param url - URL being navigated to
   * @param options - Retry options
   */
  async retryNavigation(
    navigateFn: () => Promise<void>,
    url: string,
    options: RetryOptions = {}
  ): Promise<void> {
    return this.retry(navigateFn, {
      maxRetries: 3,
      retryDelay: 2000,
      backoffMultiplier: 1.5,
      errorMessage: `Failed to navigate to ${url}`,
      ...options,
    });
  }

  /**
   * Retry waiting for element (common flaky operation)
   * @param waitFn - Function that waits for element
   * @param elementName - Name of element for error messages
   * @param options - Retry options
   */
  async retryWait(
    waitFn: () => Promise<void>,
    elementName: string,
    options: RetryOptions = {}
  ): Promise<void> {
    return this.retry(waitFn, {
      maxRetries: 3,
      retryDelay: 1500,
      errorMessage: `Element ${elementName} did not appear`,
      ...options,
    });
  }

  /**
   * Retry an operation until a condition is met
   * @param operation - The operation to perform
   * @param condition - Condition function that returns true when successful
   * @param options - Retry options
   */
  async retryUntil<T>(
    operation: () => Promise<T>,
    condition: (result: T) => boolean,
    options: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = MAX_RETRIES,
      retryDelay = RETRY_DELAY,
      errorMessage = 'Condition not met after retries',
    } = options;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const result = await operation();

      if (condition(result)) {
        if (DEBUG_MODE && attempt > 0) {
          ErrorHelper.info(`Condition met on attempt ${attempt + 1}`);
        }
        return result;
      }

      if (attempt < maxRetries) {
        if (DEBUG_MODE) {
          ErrorHelper.warn(`Condition not met. Retrying in ${retryDelay}ms...`);
        }
        await this.page.waitForTimeout(retryDelay);
      }
    }

    throw new Error(`${errorMessage} (${maxRetries + 1} attempts)`);
  }

  /**
   * Poll for a condition with retry logic
   * @param conditionFn - Function that checks the condition
   * @param timeout - Total timeout in milliseconds
   * @param pollInterval - Interval between polls in milliseconds
   * @param errorMessage - Custom error message
   */
  async pollUntil(
    conditionFn: () => Promise<boolean>,
    timeout: number = 30000,
    pollInterval: number = 500,
    errorMessage: string = 'Condition not met within timeout'
  ): Promise<void> {
    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < timeout) {
      attempts++;

      try {
        if (await conditionFn()) {
          if (DEBUG_MODE) {
            ErrorHelper.debug(`Poll condition met after ${attempts} attempts`);
          }
          return;
        }
      } catch (error) {
        // Ignore errors during polling and continue
        if (DEBUG_MODE) {
          ErrorHelper.debug(`Poll attempt ${attempts} threw error: ${error}`);
        }
      }

      await this.page.waitForTimeout(pollInterval);
    }

    throw new Error(`${errorMessage} (timeout: ${timeout}ms, attempts: ${attempts})`);
  }

  /**
   * Execute operation with timeout and retry
   * @param operation - The operation to execute
   * @param timeout - Timeout in milliseconds
   * @param options - Retry options
   */
  async withTimeout<T>(
    operation: () => Promise<T>,
    timeout: number,
    options: RetryOptions = {}
  ): Promise<T> {
    return Promise.race([
      this.retry(operation, options),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeout}ms`)), timeout)
      ),
    ]);
  }
}
