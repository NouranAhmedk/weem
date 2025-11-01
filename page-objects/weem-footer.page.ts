import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Weem Footer Page Object
 * Contains all selectors and actions for the footer section
 */
export class WeemFooterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Scroll to footer
   */
  async scrollToFooter(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.pause(500);
  }

  /**
   * Click Privacy Policy link
   */
  async clickPrivacyPolicy(): Promise<void> {
    await this.scrollToFooter();
    await this.click(this.locators.byText('Privacy Policy'));
  }

  /**
   * Click Terms and Conditions link
   */
  async clickTermsAndConditions(): Promise<void> {
    await this.scrollToFooter();
    await this.click(this.locators.byText('Terms and Conditions'));
  }

  /**
   * Click FAQs link
   */
  async clickFAQs(): Promise<void> {
    await this.scrollToFooter();
    await this.click(this.locators.byText('FAQs'));
  }

  /**
   * Click Help Center link
   */
  async clickHelpCenter(): Promise<void> {
    await this.scrollToFooter();
    await this.click(this.locators.byText('Help Center'));
  }

  /**
   * Subscribe to newsletter
   * @param email - Email address to subscribe
   */
  async subscribeToNewsletter(email: string): Promise<void> {
    await this.scrollToFooter();
    const emailInput = this.locators.byPlaceholder('Email');
    await emailInput.scrollIntoViewIfNeeded();
    await this.fill(emailInput, email);
    
    // Tab to the submit button and press Enter
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
    
    await this.pause(3000);
  }

  /**
   * Verify newsletter success message is visible
   */
  async verifyNewsletterSuccess(): Promise<boolean> {
    const successMessage = this.page.getByText(/subscribed successfully/i);
    return await this.isVisible(successMessage, 5000);
  }

  /**
   * Verify newsletter error message (duplicate email)
   */
  async verifyNewsletterError(): Promise<boolean> {
    const errorMessage = this.page.getByText(/already exists/i);
    return await this.isVisible(errorMessage, 5000);
  }

  /**
   * Wait for notification to disappear before next action
   */
  async waitForNotificationToDisappear(): Promise<void> {
    await this.pause(2000);
  }

  /**
   * Verify current URL contains expected path
   */
  async verifyUrlContains(path: string): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.toLowerCase().includes(path.toLowerCase());
  }
}

