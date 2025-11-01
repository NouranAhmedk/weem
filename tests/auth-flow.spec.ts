import { test, expect } from '../fixtures/test.fixtures';
import { generateRandomPhoneNumber, generateInvalidPhoneNumber } from '../utils/phone-number.utils';
import { TEST_OTP } from '../utils/app-config';

/**
 * Authentication Flow Tests
 * Tests for registration and OTP verification on Weem.sa
 */
test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test('should complete full registration flow', async ({ registrationPage }) => {
    const testPhoneNumber = generateRandomPhoneNumber();

    await registrationPage.clickRegisterButton();
    await registrationPage.enterPhoneNumber(testPhoneNumber);
    await registrationPage.clickSubmit();
    await registrationPage.waitForOTPInput();
    await registrationPage.enterOTP(TEST_OTP);
    await registrationPage.clickSubmit();

    // Verify registration success using the page object method
    const isSuccess = await registrationPage.verifyRegistrationSuccess();
    expect(isSuccess).toBeTruthy();

    // TODO: Update when 'my-profile-dropdown' test ID is added by dev team
    // await expect(page.locator('[data-eram-test-id="my-profile-dropdown"]')).toBeVisible();
  });

  test('should show error for invalid phone number', async ({ registrationPage, page }) => {
    const invalidPhoneNumber = generateInvalidPhoneNumber();
    
    await registrationPage.clickRegisterButton();
    await registrationPage.enterPhoneNumber(invalidPhoneNumber);
    await registrationPage.clickSubmit();

    // Wait for validation error to appear
    await page.waitForTimeout(1000);

    // Verify error message is displayed (using text content only)
    const errorMessage = page.getByText('Phone number must start with 5 and be 9 digits long');
    await expect(errorMessage).toBeVisible();
  });
});
