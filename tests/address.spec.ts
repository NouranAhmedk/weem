import { test, expect } from '../fixtures/test.fixtures';
import { generateRandomPhoneNumber } from '../utils/phone-number.utils';
import { TEST_OTP } from '../utils/app-config';

/**
 * Address Management Tests
 * Tests for adding, editing, and managing delivery addresses
 */
test.describe('Address Management', () => {
  test.beforeEach(async ({ homePage, registrationPage, headerPage, page, context }) => {
    // Grant geolocation permissions before navigation
    await context.grantPermissions(['geolocation'], { origin: 'https://dev.weem.sa' });
    
    // Navigate to homepage
    await homePage.goto();
    await homePage.waitForPageLoad();

    // Register user (authentication required for address management)
    const phoneNumber = generateRandomPhoneNumber();
    await registrationPage.clickRegisterButton();
    await registrationPage.enterPhoneNumber(phoneNumber);
    await registrationPage.clickSubmit();
    await registrationPage.waitForOTPInput();
    await registrationPage.enterOTP(TEST_OTP);
    await registrationPage.clickSubmit();
    await page.waitForTimeout(2000);

    // Navigate to Add Address page
    await headerPage.clickDeliverTo();
    await page.waitForTimeout(500);
    await headerPage.clickChooseFromMap();
    await page.waitForTimeout(1000);
  });

  test('should display Add new Address page', async ({ page }) => {
    const addAddressTitle = page.locator('[data-eram-test-id="add-address-title"]');
    await expect(addAddressTitle).toBeVisible();
  });

  /**
   * ⚠️ SKIPPED: Waiting for developers to add test IDs
   * 
   * Missing elements:
   * - Error message text or test ID when address is outside service area
   * 
   * Manual test:
   * 1. Search "Cairo, Egypt" in #search-input
   * 2. Verify error message appears
   */
  test.skip('should show message for address outside service area', async ({ page }) => {
    // TODO: Ask developers to add data-eram-test-id to error message
  });

  /**
   * ⚠️ SKIPPED: Waiting for developers to add test IDs
   * 
   * Missing test IDs:
   * - [data-eram-test-id="add-address-button"] - button to add address after selecting location
   * - [data-eram-test-id="address-name-input"] - address name input field
   * - [data-eram-test-id="submit-button"] - submit address form button
   * 
   * Manual test:
   * 1. Search "Riyadh, Saudi Arabia" in #search-input
   * 2. Click "Add Address" button
   * 3. Fill address name
   * 4. Click Submit
   * 5. Verify redirect to /addresses
   */
  test.skip('should add address successfully', async ({ page }) => {
    // TODO: Ask developers to add proper test IDs to address form
  });

});

