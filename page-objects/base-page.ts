import { Page, Locator } from '@playwright/test';
import { LocatorHelper } from '../helpers/locator.helper';
import { BrowserHelper } from '../helpers/browser.helper';
import { ErrorHelper } from '../helpers/error.helper';
import { RetryHelper } from '../helpers/retry.helper';
import { ELEMENT_TIMEOUT, NAVIGATION_TIMEOUT } from '../utils/app-config';

/**
 * BasePage - Base class for all Page Objects
 * Contains common properties and methods shared across all pages
 */
export abstract class BasePage {
  protected page: Page;
  protected locators: LocatorHelper;
  protected browser: BrowserHelper;
  protected errorHandler: ErrorHelper;
  protected retryHelper: RetryHelper;

  constructor(page: Page) {
    this.page = page;
    this.locators = new LocatorHelper(page);
    this.browser = new BrowserHelper(page, page.context());
    this.errorHandler = new ErrorHelper(page);
    this.retryHelper = new RetryHelper(page);
  }

  /**
   * Navigate to a specific URL
   * @param url - URL to navigate to (can be relative or absolute)
   */
  async navigateTo(url: string): Promise<void> {
    await this.browser.navigateTo(url);
  }

  /**
   * Get current page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.browser.getPageTitle();
  }

  /**
   * Wait for element to be visible
   * @param locator - Playwright locator
   * @param timeout - Custom timeout (optional)
   */
  async waitForVisible(locator: Locator, timeout: number = ELEMENT_TIMEOUT): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   * @param locator - Playwright locator
   * @param timeout - Custom timeout (optional)
   */
  async waitForHidden(locator: Locator, timeout: number = ELEMENT_TIMEOUT): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Wait for element to be attached to DOM
   * @param locator - Playwright locator
   * @param timeout - Custom timeout (optional)
   */
  async waitForAttached(locator: Locator, timeout: number = ELEMENT_TIMEOUT): Promise<void> {
    await locator.waitFor({ state: 'attached', timeout });
  }

  /**
   * Click on an element with automatic waiting
   * @param locator - Playwright locator
   */
  async click(locator: Locator): Promise<void> {
    await locator.click();
  }

  /**
   * Fill an input field with automatic waiting
   * @param locator - Playwright locator
   * @param text - Text to fill
   */
  async fill(locator: Locator, text: string): Promise<void> {
    await locator.fill(text);
  }

  /**
   * Get text content of an element
   * @param locator - Playwright locator
   */
  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) || '';
  }

  /**
   * Check if element is visible
   * @param locator - Playwright locator
   * @param timeout - Custom timeout (optional)
   */
  async isVisible(locator: Locator, timeout: number = ELEMENT_TIMEOUT): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists in DOM
   * @param locator - Playwright locator
   */
  async exists(locator: Locator): Promise<boolean> {
    return (await locator.count()) > 0;
  }

  /**
   * Wait for page to load completely
   * Can be overridden by child classes for page-specific load detection
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded', { timeout: NAVIGATION_TIMEOUT });
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    await this.browser.reload();
  }

  /**
   * Go back to previous page
   */
  async goBack(): Promise<void> {
    await this.browser.goBack();
  }

  /**
   * Go forward to next page
   */
  async goForward(): Promise<void> {
    await this.browser.goForward();
  }

  /**
   * Take a screenshot
   * @param path - Path to save screenshot
   */
  async takeScreenshot(path: string): Promise<void> {
    await this.browser.takeScreenshot(path);
  }

  /**
   * Pause execution for debugging
   * @param milliseconds - Optional delay in milliseconds
   */
  async pause(milliseconds?: number): Promise<void> {
    await this.browser.pause(milliseconds);
  }

  /**
   * Scroll element into view
   * @param locator - Playwright locator
   */
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Get attribute value from element
   * @param locator - Playwright locator
   * @param attributeName - Attribute name
   */
  async getAttribute(locator: Locator, attributeName: string): Promise<string | null> {
    return await locator.getAttribute(attributeName);
  }

  /**
   * Get all matching elements count
   * @param locator - Playwright locator
   */
  async getCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  /**
   * Press a key on an element
   * @param locator - Playwright locator
   * @param key - Key to press
   */
  async press(locator: Locator, key: string): Promise<void> {
    await locator.press(key);
  }

  /**
   * Select option from dropdown
   * @param locator - Playwright locator
   * @param value - Value to select
   */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  /**
   * Check a checkbox or radio button
   * @param locator - Playwright locator
   */
  async check(locator: Locator): Promise<void> {
    await locator.check();
  }

  /**
   * Uncheck a checkbox
   * @param locator - Playwright locator
   */
  async uncheck(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  /**
   * Hover over an element
   * @param locator - Playwright locator
   */
  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }
}
