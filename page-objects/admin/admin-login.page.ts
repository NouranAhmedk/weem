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
  }

  /**
   * Enter username
   */
  async enterUsername(username: string): Promise<void> {
    await this.fill(this.locators.byName('username'), username);
  }

  /**
   * Enter password
   */
  async enterPassword(password: string): Promise<void> {
    await this.fill(this.locators.byName('password'), password);
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.click(this.locators.byRole('button', 'Log in'));
  }

  /**
   * Complete login flow
   */
  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  /**
   * Verify login success (dashboard loaded)
   */
  async verifyLoginSuccess(): Promise<boolean> {
    await this.page.waitForLoadState('networkidle');
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('/admin/') && !currentUrl.includes('/login');
  }

  /**
   * Verify login error message
   */
  async verifyLoginError(): Promise<boolean> {
    const errorMessage = this.page.getByText(/invalid|error|incorrect/i);
    return await this.isVisible(errorMessage, 3000);
  }
}


