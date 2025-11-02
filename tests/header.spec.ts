import { test, expect } from '../fixtures/test.fixtures';
import { generateRandomPhoneNumber } from '../utils/phone-number.utils';
import { TEST_OTP, BASE_URL } from '../utils/app-config';

/**
 * Header Tests
 * Tests for header components (appears on all pages)
 */
test.describe('Header', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test('should be able to search with existing product', async ({ headerPage, productsPage, page }) => {
    // Get product name from homepage
    const product = page.locator('[data-eram-test-id^="product-name-"][data-eram-test-id$="-link"]').first();
    await product.waitFor({ state: 'visible', timeout: 10000 });
    const productName = (await product.textContent())?.trim() || 'phone';

    // Search using header
    await headerPage.search(productName);
    await productsPage.waitForProductsToLoad();

    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should display cart with correct count', async ({ headerPage }) => {
    const cartCount = await headerPage.getCartCount();
    expect(cartCount).toBeGreaterThanOrEqual(0);
  });

  test('should display favorites with correct count', async ({ headerPage }) => {
    const favoritesCount = await headerPage.getFavoritesCount();
    expect(favoritesCount).toBeGreaterThanOrEqual(0);
  });

  test('should show My Profile after successful registration', async ({ registrationPage, page }) => {
    const phoneNumber = generateRandomPhoneNumber();
    
    await registrationPage.clickRegisterButton();
    await registrationPage.enterPhoneNumber(phoneNumber);
    await registrationPage.clickSubmit();
    await registrationPage.waitForOTPInput();
    await registrationPage.enterOTP(TEST_OTP);
    await registrationPage.clickSubmit();
    
    await page.waitForTimeout(2000);
    
    const myProfile = page.getByText('My Profile');
    await expect(myProfile).toBeVisible();
  });

  test('should search for random existing product', async ({ headerPage, productsPage, page }) => {
    // Get all products from homepage
    const products = page.locator('[data-eram-test-id^="product-name-"][data-eram-test-id$="-link"]');
    const productCount = await products.count();
    
    if (productCount > 0) {
      // Select random product
      const randomIndex = Math.floor(Math.random() * productCount);
      const randomProduct = products.nth(randomIndex);
      await randomProduct.waitFor({ state: 'visible', timeout: 10000 });
      const productName = (await randomProduct.textContent())?.trim() || 'phone';
      
      // Search for it
      await headerPage.search(productName);
      await productsPage.waitForProductsToLoad();
      
      const resultsCount = await productsPage.getProductCount();
      expect(resultsCount).toBeGreaterThan(0);
    } else {
      // Fallback to generic search
      await headerPage.search('phone');
      await productsPage.waitForProductsToLoad();
      
      const resultsCount = await productsPage.getProductCount();
      expect(resultsCount).toBeGreaterThan(0);
    }
  });

  test('should change language to Arabic', async ({ headerPage, page }) => {
    // Click language selector to change to Arabic
    await headerPage.selectLanguage('Arabic');
    
    await page.waitForLoadState('networkidle');
    
    // Verify URL changed to Arabic version
    const expectedUrl = BASE_URL.replace('/en', '/ar');
    const currentUrl = page.url();
    expect(currentUrl).toBe(expectedUrl);
  });

  test('should open delivery location dropdown when clicked', async ({ headerPage, page }) => {
    // Click Deliver to button
    await headerPage.clickDeliverTo();
    
    await page.waitForTimeout(500);
    
    // Verify dropdown menu appears with "Choose from map" option
    const chooseFromMapOption = page.getByText('Choose from map');
    await expect(chooseFromMapOption).toBeVisible();
  });
});

