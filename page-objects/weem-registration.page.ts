import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class WeemRegistrationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click the Register button to open registration popup
   */
  async clickRegisterButton(): Promise<void> {
    await this.click(this.locators.byEramTestId('user-dropdown-register-button'));
  }

  /**
   * Enter phone number in the registration form
   */
  async enterPhoneNumber(phoneNumber: string): Promise<void> {
    await this.fill(this.locators.byEramTestId('phone-input'), phoneNumber);
  }

  /**
   * Click Submit button (first submit for sending OTP)
   */
  async clickSubmit(): Promise<void> {
    await this.pause(3000);
    await this.click(this.locators.byEramTestId('submit-button'));
  }

  /**
   * Enter OTP code
   * Handles 5 separate input fields for each digit
   */
  async enterOTP(otpCode: string): Promise<void> {
    const otpDigits = otpCode.split('');

    for (let i = 0; i < otpDigits.length; i++) {
      await this.fill(this.locators.byEramTestId(`otp-input-${i}`), otpDigits[i]);
    }
  }

  /**
   * Click Submit button for verifying OTP
   */
  async clickVerifySubmit(): Promise<void> {
    await this.click(this.locators.byEramTestId('submit-button'));
  }

  /**
   * Wait for registration popup to close
   */
  async waitForPopupClose(): Promise<void> {
    // Wait for popup/modal to disappear
    await this.pause(2000); // Allow time for animation
    // Verify popup is no longer visible by checking for Register button
    await this.waitForHidden(this.locators.byText('Register'), 3000);
  }

  /**
   * Check if "My Profile" is visible in the UI
   */
  async isMyProfileVisible(): Promise<boolean> {
    return await this.isVisible(this.locators.byText('My Profile'), 5000);
  }

  async clickSendOTP(): Promise<void> {
    await this.clickSubmit();
  }

  async clickVerifyOTP(): Promise<void> {
    await this.clickVerifySubmit();
  }

  async registerWithPhone(phoneNumber: string): Promise<void> {
    await this.enterPhoneNumber(phoneNumber);
    await this.clickSubmit();
  }

  async verifyOTP(otpCode: string): Promise<void> {
    await this.enterOTP(otpCode);
    await this.clickVerifySubmit();
  }

  async waitForOTPInput(): Promise<void> {
    await this.waitForVisible(this.locators.byEramTestId('otp-input-0'), 10000);
  }

  async verifyRegistrationSuccess(): Promise<boolean> {
    return await this.isMyProfileVisible();
  }
}
