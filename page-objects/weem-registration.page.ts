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

  /**
   * Click "Edit phone number" link/button on OTP screen
   * Tries multiple text variations and roles to find the edit button
   */
  async clickEditPhoneNumber(): Promise<void> {
    // Try different variations of the edit phone number text
    const possibleTexts = [
      'Edit phone number',
      'Edit Phone Number',
      'EDIT PHONE NUMBER',
      'Edit phone',
      'Change phone number',
      'Change Phone Number',
      'Edit'
    ];

    let clicked = false;
    
    // First try text-based locators
    for (const text of possibleTexts) {
      const textLocator = this.page.getByText(text, { exact: false });
      if (await this.isVisible(textLocator, 2000)) {
        await this.click(textLocator);
        clicked = true;
        break;
      }
    }

    // If text-based search fails, try role-based (link or button)
    if (!clicked) {
      for (const text of possibleTexts) {
        try {
          const linkLocator = this.page.getByRole('link', { name: new RegExp(text, 'i') });
          if (await this.isVisible(linkLocator, 2000)) {
            await this.click(linkLocator);
            clicked = true;
            break;
          }
        } catch {
          // Continue to next
        }
        
        try {
          const buttonLocator = this.page.getByRole('button', { name: new RegExp(text, 'i') });
          if (await this.isVisible(buttonLocator, 2000)) {
            await this.click(buttonLocator);
            clicked = true;
            break;
          }
        } catch {
          // Continue to next
        }
      }
    }

    // If still not found, try by test ID
    if (!clicked) {
      const testIdOptions = ['edit-phone-number', 'edit-phone', 'change-phone-number'];
      for (const testId of testIdOptions) {
        const testIdLocator = this.locators.byEramTestId(testId);
        if (await this.isVisible(testIdLocator, 2000)) {
          await this.click(testIdLocator);
          clicked = true;
          break;
        }
      }
    }

    if (!clicked) {
      throw new Error('Could not find "Edit phone number" button/link on OTP screen');
    }
  }

  /**
   * Check if phone number input is visible
   * Used to verify redirect back to phone number entry
   */
  async isPhoneInputVisible(): Promise<boolean> {
    return await this.isVisible(this.locators.byEramTestId('phone-input'), 5000);
  }
}
