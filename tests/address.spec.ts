import { test, expect } from '../fixtures/test.fixtures';
import { generateRandomPhoneNumber } from '../utils/phone-number.utils';
import { TEST_OTP } from '../utils/app-config';

/**
 * Address Management Tests
 * Tests for adding, editing, and managing delivery addresses
 */
test.describe('Address Management', () => {
  test.beforeEach(async ({ homePage, registrationPage, headerPage, page }) => {
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

  test('should show message for address outside service area', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Find and use map search box
    const searchBox = page.locator('input[aria-label*="Search"], input[placeholder*="Search"]').first();
    await searchBox.waitFor({ state: 'visible', timeout: 10000 });
    
    // Search for Egypt location
    await searchBox.fill('Cairo, Egypt');
    await searchBox.press('Enter');
    await page.waitForTimeout(3000);

    // Verify service area error message appears
    const errorMessage = page.getByText('This address is outside the service area');
    await expect(errorMessage).toBeVisible();
  });

  test('should add address successfully', async ({ page }) => {
    await page.waitForTimeout(3000);
    
    // Find and use map search box
    const searchBox = page.locator('input[aria-label*="Search"], input[placeholder*="Search"]').first();
    await searchBox.waitFor({ state: 'visible', timeout: 10000 });
    
    // Search for Saudi Arabia location
    await searchBox.fill('Riyadh, Saudi Arabia');
    await searchBox.press('Enter');
    await page.waitForTimeout(3000);

    // Verify Add Address button appears
    const addAddressButton = page.locator('[data-eram-test-id="add-address-button"]');
    await expect(addAddressButton).toBeVisible();

    // Click Add Address button
    await addAddressButton.click();
    await page.waitForTimeout(1000);

    // Fill address name with random number
    const randomNumber = Math.floor(Math.random() * 1000);
    const nameInput = page.locator('[data-eram-test-id="address-name-input"]');
    await nameInput.fill(`test${randomNumber}`);

    // Submit
    const submitButton = page.locator('[data-eram-test-id="submit-button"]');
    await submitButton.click();
    await page.waitForTimeout(2000);

    // Verify redirected to My Addresses page
    const currentUrl = page.url();
    expect(currentUrl).toContain('address');
  });

});

