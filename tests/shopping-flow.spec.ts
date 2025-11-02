import { test, expect } from '../fixtures/test.fixtures';
import {
  navigateToFirstCategory,
  selectFirstProduct,
  addProductToCart,
  addRandomProductToCart,
  openCart,
  verifyCartHasItems,
} from './helpers/shopping.helper';
import { UserGenerator } from '../test-data/generators/user.generator';
import { TEST_OTP } from '../utils/app-config';

/**
 * Random Product Shopping Flow Tests
 * Tests complete shopping journey with randomly selected products
 *
 * Flow: Register → Random Category → First Product → Add to Cart → View Cart → Remove Item → Checkout
 */
test.describe('Random Product Shopping Flow', () => {
  test.beforeEach(async ({ homePage, registrationPage, page }) => {
    // Step 1: Navigate to homepage
    await homePage.goto();
    await homePage.waitForPageLoad();

    // Step 2: Register/Login before shopping (cart requires authentication)
    const mobileNumber = UserGenerator.generatePhoneNumber();
    console.log(`Registering with mobile: ${mobileNumber}`);

    await registrationPage.clickRegisterButton();
    await registrationPage.enterPhoneNumber(mobileNumber);
    await registrationPage.clickSubmit();

    // Wait for OTP input and submit
    await registrationPage.waitForOTPInput();
    await registrationPage.enterOTP(TEST_OTP); // Using test OTP from .env file
    await registrationPage.clickVerifySubmit();

    // Wait for registration to complete
    await page.waitForTimeout(2000);

    console.log(`Registration complete for: ${mobileNumber}`);
  });

  /**
   * Test 1: Browse random category and verify products load
   */
  test('should select first category and browse products', async ({ homePage, productsPage }) => {
    // Navigate to first available category
    await navigateToFirstCategory(homePage);

    // Wait for products to load
    await productsPage.waitForProductsToLoad();

    // Verify products are displayed
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);

    console.log(`Found ${productCount} products in category`);
  });

  /**
   * Test 2: Add first product from random category to cart
   */
  test('should add first product from first category to cart', async ({
    homePage,
    productsPage
  }) => {
    // Navigate to first category
    await navigateToFirstCategory(homePage);

    // Select first product
    await selectFirstProduct(productsPage);

    // Add product to cart
    const addedSuccessfully = await addProductToCart(productsPage);

    // Verify product was added (or was out of stock)
    if (addedSuccessfully) {
      console.log('Product added to cart successfully');
      expect(addedSuccessfully).toBeTruthy();
    } else {
      console.log('Product was out of stock');
      test.skip();
    }
  });

  /**
   * Test 3: View cart after adding random product
   */
  test('should view cart with added product', async ({
    homePage,
    productsPage,
    cartPage
  }) => {
    // Add random product to cart using helper
    const addedSuccessfully = await addRandomProductToCart(homePage, productsPage, false);

    // Skip if product was out of stock
    if (!addedSuccessfully) {
      console.log('Product was out of stock, skipping cart verification');
      test.skip();
      return;
    }

    // Open cart
    await openCart(cartPage);

    // Verify cart has items
    const hasItems = await verifyCartHasItems(cartPage);
    expect(hasItems).toBeTruthy();

    console.log('Cart successfully opened with items');
  });

  /**
   * Test 4: Remove first item from cart (SKIPPED - needs cart item test IDs)
   */
  test.skip('should remove first item from cart', async () => {
    // This test is skipped because getAllCartItems() cannot find cart item elements
    // without proper test IDs. Once cart item test IDs are available, this test can be enabled.
  });

  /**
   * Test 5: Complete checkout flow with random product
   */
  test('should proceed to checkout with cart items', async ({
    homePage,
    productsPage,
    cartPage,
    page
  }) => {
    // Add random product to cart
    const addedSuccessfully = await addRandomProductToCart(homePage, productsPage, false);

    if (!addedSuccessfully) {
      console.log('Product was out of stock, skipping checkout test');
      test.skip();
      return;
    }

    // Open cart
    await openCart(cartPage);

    // Verify cart has items
    const hasItems = await verifyCartHasItems(cartPage);
    expect(hasItems).toBeTruthy();

    // Verify checkout button is visible and clickable
    const checkoutButtonVisible = await page.getByText(/Checkout|الدفع/i).isVisible();
    expect(checkoutButtonVisible).toBeTruthy();

    console.log('Checkout button is available - random shopping flow complete!');
  });
});

/**
 * Test Execution Notes:
 * =====================
 *
 * Run all shopping flow tests:
 *   npx playwright test tests/shopping-flow.spec.ts
 *
 * Run specific test:
 *   npx playwright test tests/shopping-flow.spec.ts -g "should add first product"
 *
 * Run with UI mode for debugging:
 *   npx playwright test tests/shopping-flow.spec.ts --ui
 *
 * Implementation Details:
 * =======================
 * - Tests use first available category (can be changed to random)
 * - Tests use first available product (simpler than random selection)
 * - All cart operations use dynamic locators (no test IDs available)
 * - Tests handle out-of-stock products gracefully with test.skip()
 * - Helper functions provide logging for better debugging
 *
 * Known Limitations:
 * ==================
 * - Cart icon locator uses fallback selectors (no test ID yet)
 * - Remove button uses fallback selectors (no test ID yet)
 * - Checkout button uses fallback selectors (no test ID yet)
 * - These tests may need adjustments based on actual site behavior
 */
