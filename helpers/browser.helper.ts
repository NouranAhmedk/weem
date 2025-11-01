import { Page, BrowserContext } from '@playwright/test';

/**
 * Browser Helper - Common browser actions
 */
export class BrowserHelper {
  constructor(private page: Page, private context: BrowserContext) {}

  /**
   * Navigate to a URL
   * Uses extended timeout and domcontentloaded for better reliability with slow networks
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000 // 60 seconds to handle slow network conditions
    });
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Reload the current page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Go forward in browser history
   */
  async goForward(): Promise<void> {
    await this.page.goForward();
  }

  /**
   * Pause execution (useful for debugging)
   */
  async pause(milliseconds?: number): Promise<void> {
    if (milliseconds) {
      await this.page.waitForTimeout(milliseconds);
    } else {
      await this.page.pause();
    }
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(path: string): Promise<void> {
    await this.page.screenshot({ path });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}

