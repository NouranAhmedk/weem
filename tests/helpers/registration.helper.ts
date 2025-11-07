import { Page } from '@playwright/test';
import { generateRandomPhoneNumber } from '../../utils/phone-number.utils';
import { TEST_OTP } from '../../utils/app-config';

/**
 * Registration Helper
 * Handles user registration with automatic retry logic
 */
export class RegistrationHelper {
  constructor(
    private page: Page,
    private registrationPage: any
  ) {}

  /**
   * Quick registration with retry logic
   * @param options Configuration options
   * @returns Registration result with phone number
   */
  async quickRegister(options: {
    maxAttempts?: number;
    phoneNumber?: string;
    throwOnFailure?: boolean;
  } = {}): Promise<{ success: boolean; phoneNumber: string }> {
    const { maxAttempts = 3, phoneNumber, throwOnFailure = true } = options;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const phone = phoneNumber || generateRandomPhoneNumber();
      console.log(`Registration attempt ${attempt}/${maxAttempts} - Phone: ${phone}`);
      
      try {
        await this.dismissBlockingOverlays();
        await this.page.waitForTimeout(250);
        // Open registration modal
        await this.registrationPage.clickRegisterButton();
        await this.page.waitForTimeout(1000);
        
        // Enter phone number
        await this.registrationPage.enterPhoneNumber(phone);
        await this.page.waitForTimeout(500);
        
        // Submit phone number
        await this.registrationPage.clickSubmit();
        await this.page.waitForTimeout(3000);
        
        // Check if OTP screen appeared
        const otpInput = this.page.locator('[data-eram-test-id="otp-input-0"]');
        const otpVisible = await otpInput.isVisible().catch(() => false);
        
        if (!otpVisible) {
          console.log(`OTP screen did not appear on attempt ${attempt}`);
          await this.closeModal();
          continue;
        }
        
        // Enter OTP
        console.log('OTP screen appeared - entering OTP');
        await this.registrationPage.enterOTP(TEST_OTP);
        await this.page.waitForTimeout(500);
        
        // Submit OTP
        await this.registrationPage.clickSubmit();
        await this.page.waitForTimeout(2000);
        
        // Verify success
        const isSuccess = await this.registrationPage.verifyRegistrationSuccess();
        if (isSuccess) {
          console.log('✅ Registration successful');
          return { success: true, phoneNumber: phone };
        }
        
        console.log(`Registration verification failed on attempt ${attempt}`);
        await this.closeModal();
        
      } catch (error) {
        console.log(`Registration attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');
        await this.closeModal();
      }
    }
    
    if (throwOnFailure) {
      throw new Error(`Registration failed after ${maxAttempts} attempts`);
    }
    
    return { success: false, phoneNumber: phoneNumber || '' };
  }

  /**
   * Close any open modals
   */
  private async closeModal(): Promise<void> {
    const closeSelectors = [
      '[data-eram-test-id*="close"]',
      '[data-testid*="close"]',
      'button:has-text("Close")',
      'button:has-text("Cancel")',
      'button:has-text("Dismiss")',
      'button:has-text("No")',
      '[aria-label*="close" i]',
      '.modal button[class*="close"]',
      '.modal button svg',
      '.modal-header button'
    ];

    const overlaySelectors = [
      'div.fixed.top-0.right-0.bottom-0.left-0',
      '.modal-backdrop',
      '[data-eram-test-id*="modal-backdrop"]',
      '[data-testid*="modal-backdrop"]'
    ];

    try {
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(500);
    } catch {
      // Ignore errors when closing modal with keyboard
    }

    for (const selector of closeSelectors) {
      const closeButton = this.page.locator(selector).first();
      const visible = await closeButton.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        try {
          await closeButton.click({ delay: 50 });
          await this.page.waitForTimeout(500);
        } catch (error) {
          console.log(`⚠️ Unable to click close control (${selector}):`, error instanceof Error ? error.message : error);
        }
      }
    }

    for (const overlaySelector of overlaySelectors) {
      const overlay = this.page.locator(overlaySelector).first();
      for (let i = 0; i < 3; i++) {
        const overlayVisible = await overlay.isVisible({ timeout: 500 }).catch(() => false);
        if (!overlayVisible) {
          break;
        }
        try {
          await this.page.keyboard.press('Escape');
          await this.page.waitForTimeout(300);
        } catch {
          // ignore
        }
      }
    }
  }

  private async dismissBlockingOverlays(): Promise<void> {
    const blockingSelectors = [
      'div.fixed.top-0.right-0.bottom-0.left-0',
      '.modal-backdrop',
      '[data-eram-test-id*="modal-backdrop"]',
      '[data-testid*="modal-backdrop"]'
    ];

    for (const selector of blockingSelectors) {
      const overlay = this.page.locator(selector).first();
      const visible = await overlay.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        await this.closeModal();
      }
    }

    // Also attempt to close any cookie or announcement banners that may block interaction
    const bannerSelectors = [
      'button:has-text("Accept")',
      'button:has-text("Got it")',
      'button:has-text("Allow")'
    ];

    for (const selector of bannerSelectors) {
      const button = this.page.locator(selector).first();
      const visible = await button.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        try {
          await button.click({ delay: 50 });
          await this.page.waitForTimeout(300);
        } catch {
          // ignore
        }
      }
    }
  }
}

