import { Page } from '@playwright/test';
import { DEBUG_MODE } from '../utils/app-config';

/**
 * Custom Error Classes for better error identification
 */

export class ElementNotFoundError extends Error {
  constructor(selector: string, timeout?: number) {
    super(`Element not found: ${selector}${timeout ? ` (timeout: ${timeout}ms)` : ''}`);
    this.name = 'ElementNotFoundError';
  }
}

export class NavigationError extends Error {
  constructor(url: string, message?: string) {
    super(`Navigation failed to ${url}${message ? `: ${message}` : ''}`);
    this.name = 'NavigationError';
  }
}

export class ActionError extends Error {
  constructor(action: string, element: string, message?: string) {
    super(`Failed to ${action} on ${element}${message ? `: ${message}` : ''}`);
    this.name = 'ActionError';
  }
}

export class AssertionError extends Error {
  constructor(message: string) {
    super(`Assertion failed: ${message}`);
    this.name = 'AssertionError';
  }
}

/**
 * Error Handler Helper
 * Provides utilities for error handling, logging, and debugging
 */
export class ErrorHelper {
  constructor(private page: Page) {}

  /**
   * Wrap an async action with error handling
   * @param action - The action to perform
   * @param errorMessage - Custom error message
   * @param takeScreenshot - Whether to take screenshot on error
   */
  async tryAction<T>(
    action: () => Promise<T>,
    errorMessage: string,
    takeScreenshot: boolean = true
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      await this.handleError(error, errorMessage, takeScreenshot);
      throw error;
    }
  }

  /**
   * Handle errors with logging and optional screenshot
   * @param error - The error object
   * @param context - Context about where the error occurred
   * @param takeScreenshot - Whether to take a screenshot
   */
  async handleError(
    error: unknown,
    context: string,
    takeScreenshot: boolean = true
  ): Promise<void> {
    const errorMessage = this.formatError(error);
    const timestamp = new Date().toISOString();

    // Log error details
    console.error(`\n[${timestamp}] ERROR in ${context}`);
    console.error(`Error Type: ${this.getErrorType(error)}`);
    console.error(`Message: ${errorMessage}`);

    if (DEBUG_MODE) {
      console.error(`Current URL: ${this.page.url()}`);
      console.error(`Page Title: ${await this.page.title()}`);
      console.error(`Stack: ${error instanceof Error ? error.stack : 'N/A'}`);
    }

    // Take screenshot if requested
    if (takeScreenshot) {
      await this.takeErrorScreenshot(context);
    }
  }

  /**
   * Take a screenshot when error occurs
   * @param context - Context for the screenshot filename
   */
  async takeErrorScreenshot(context: string): Promise<void> {
    try {
      const timestamp = new Date().getTime();
      const filename = `error-${context.replace(/\s+/g, '-')}-${timestamp}.png`;
      const screenshotPath = `test-results/errors/${filename}`;

      await this.page.screenshot({
        path: screenshotPath,
        fullPage: true,
      });

      console.log(`Screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      console.error('Failed to take error screenshot:', screenshotError);
    }
  }

  /**
   * Format error message for logging
   * @param error - The error object
   */
  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  /**
   * Get error type name
   * @param error - The error object
   */
  private getErrorType(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }
    return typeof error;
  }

  /**
   * Wait with error handling
   * @param condition - Condition function to wait for
   * @param timeout - Timeout in milliseconds
   * @param errorMessage - Custom error message
   */
  async waitFor(
    condition: () => Promise<boolean>,
    timeout: number,
    errorMessage: string
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          return;
        }
      } catch (error) {
        // Continue waiting even if condition check throws
      }
      await this.page.waitForTimeout(100);
    }

    throw new Error(`${errorMessage} (timeout: ${timeout}ms)`);
  }

  /**
   * Log debug information
   * @param message - Debug message
   * @param data - Optional data to log
   */
  static debug(message: string, data?: any): void {
    if (DEBUG_MODE) {
      const timestamp = new Date().toISOString();
      console.log(`\n[${timestamp}] DEBUG: ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }

  /**
   * Log info message
   * @param message - Info message
   */
  static info(message: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] INFO: ${message}`);
  }

  /**
   * Log warning message
   * @param message - Warning message
   */
  static warn(message: string): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] WARN: ${message}`);
  }

  /**
   * Validate element exists before action
   * @param elementName - Name of the element for error messages
   * @param condition - Validation condition
   */
  static validate(elementName: string, condition: boolean): void {
    if (!condition) {
      throw new ElementNotFoundError(elementName);
    }
  }

  /**
   * Create a detailed error message with context
   * @param action - The action being performed
   * @param element - The element being acted upon
   * @param additionalInfo - Additional context
   */
  static createErrorMessage(
    action: string,
    element: string,
    additionalInfo?: string
  ): string {
    let message = `Failed to ${action} on ${element}`;
    if (additionalInfo) {
      message += `\nAdditional info: ${additionalInfo}`;
    }
    return message;
  }
}
