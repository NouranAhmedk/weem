import { Page } from '@playwright/test';
import { BasePage } from '../base-page';
import { ADMIN_URL } from '../../utils/app-config';

/**
 * Admin Login Page Object
 * Handles admin authentication
 */
export class AdminLoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to admin login page
   */
  async goto(): Promise<void> {
    await this.navigateTo(`${ADMIN_URL}/login/`);
    // Wait for login page to be fully loaded
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    // Wait for username field to be visible
    const usernameField = this.locators.byName('username');
    await usernameField.waitFor({ state: 'visible', timeout: 10000 });
    await this.fill(usernameField, username);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    // Wait for password field to be visible
    const passwordField = this.locators.byName('password');
    await passwordField.waitFor({ state: 'visible', timeout: 10000 });
    await this.fill(passwordField, password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    const loginButtonSelectors = [
      'button:has-text("Log in")',
      'button[type="submit"]',
      'button:has-text("Login")',
      '[type="submit"]',
      'button.primary',
      'button[class*="login"]'
    ];

    for (const selector of loginButtonSelectors) {
      const button = this.page.locator(selector).first();
      const visible = await this.isVisible(button, 2000);
      if (visible) {
        // Wait for button to be enabled and ready
        await button.waitFor({ state: 'visible', timeout: 3000 });
        await button.waitFor({ state: 'attached', timeout: 3000 });
        await this.page.waitForTimeout(500);
        await this.click(button);
        return;
      }
    }

    throw new Error('Login button not found');
  }

  /**
   * Complete login flow
   */
  async login(username: string, password: string): Promise<void> {
    // Step 1: Wait for login page to be loaded (already done in goto, but ensure it's ready)
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
    
    // Step 2: Enter credentials
    await this.enterUsername(username);
    await this.enterPassword(password);
    
    // Step 3: Wait after entering credentials
    await this.page.waitForTimeout(1000);
    
    // Step 4: Click login button
    // Wait for navigation after clicking login
    const navigationPromise = this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
    await this.clickLogin();
    await navigationPromise;
    
    // Step 5: Wait till dashboard page is loaded
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await this.page.waitForTimeout(2000);
    
    // Check if we're redirected to wrong page and navigate to admin dashboard
    const currentUrl = await this.getCurrentUrl();
    if (!currentUrl.includes('/admin/') || currentUrl.includes('/accounts/profile/')) {
      console.log('Redirected to wrong page after login. Navigating to admin dashboard...');
      await this.navigateTo(`${ADMIN_URL}/`);
      await this.page.waitForLoadState('networkidle', { timeout: 15000 });
      await this.page.waitForTimeout(2000);
    }
    
    // Final wait to ensure dashboard is fully loaded
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify login success (dashboard loaded)
   */
  async verifyLoginSuccess(): Promise<boolean> {
    // Wait for navigation to complete
    try {
      await this.page.waitForURL(/\/admin\//, { timeout: 15000 });
    } catch (error) {
      // If URL wait fails, log the error and current URL
      const currentUrl = await this.getCurrentUrl();
      console.log('URL wait failed. Current URL:', currentUrl);
      console.log('Error:', error);
    }
    
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    const currentUrl = await this.getCurrentUrl();
    console.log('Current URL in verifyLoginSuccess:', currentUrl);
    
    const isDashboard = currentUrl.includes('/admin/') && !currentUrl.includes('/login');
    console.log('Is dashboard URL:', isDashboard);
    
    if (!isDashboard) {
      // Take screenshot for debugging
      await this.page.screenshot({ path: `test-results/debug-invalid-redirect-${Date.now()}.png`, fullPage: true });
      console.log('Page title:', await this.page.title());
    }
    
    if (isDashboard) {
      // Wait for dashboard to be fully loaded
      await this.waitForDashboardReady();
    }
    
    return isDashboard;
  }

  /**
   * Wait for dashboard to be ready (menu items, navigation, etc.)
   */
  async waitForDashboardReady(timeout = 10000): Promise<void> {
    // Wait for common dashboard elements to be visible
    const dashboardSelectors = [
      'nav',
      '.sidebar',
      '.navbar',
      '[class*="menu"]',
      '[class*="navigation"]',
      'a:has-text("Customer Wallets")',
      'a:has-text("Consumer Wallets")',
      'a:has-text("Dashboard")',
      'a:has-text("Products")',
      'a:has-text("Orders")'
    ];

    for (const selector of dashboardSelectors) {
      try {
        const element = this.page.locator(selector).first();
        await element.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
      } catch {
        // Continue if element not found
      }
    }

    // Additional wait for any loading indicators to disappear
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);
  }

  /**
   * Verify login error message
   */
  async verifyLoginError(): Promise<boolean> {
    const errorMessage = this.page.getByText(/invalid|error|incorrect/i);
    return await this.isVisible(errorMessage, 3000);
  }
}


