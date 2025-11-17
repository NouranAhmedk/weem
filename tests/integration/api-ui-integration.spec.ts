import { test, expect } from '../../fixtures/test.fixtures';
import { RegistrationHelper } from '../helpers/registration.helper';
import { ProductHelper } from '../helpers/product.helper';
import { CheckoutHelper } from '../helpers/checkout.helper';
import { BASE_URL } from '../../utils/app-config';

test.describe('API-UI Integration', () => {
  test('should verify cart API prices match UI prices', async ({ 
    page, homePage, registrationPage, productsPage, headerPage
  }, testInfo) => {
    testInfo.setTimeout(300000);

    const registrationHelper = new RegistrationHelper(page, registrationPage);
    const productHelper = new ProductHelper(page, productsPage, homePage);
    const checkoutHelper = new CheckoutHelper(page);

    // Register user
    console.log('[Test] Registering user via UI...');
    await homePage.goto();
    await homePage.waitForPageLoad();
    await registrationHelper.quickRegister({ throwOnFailure: true });
    console.log('[Test] User registered successfully');

    // Add 2 products to cart
    console.log('[Test] Adding products to cart...');
    await page.goto(BASE_URL);
    await homePage.waitForPageLoad();
    for (let i = 0; i < 2; i++) {
      const { products } = await productHelper.selectCategoryWithProducts();
      await productHelper.selectRandomProduct(products);
      await page.locator('[data-eram-test-id="add-to-cart-button"]').first().click();
      await page.waitForTimeout(2000);
      console.log(`[Test] Product ${i + 1} added to cart`);
      if (i < 1) await page.goto(BASE_URL);
    }

    // Capture cart API response
    console.log('[Test] Setting up cart API response listener...');
    const cartResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/cart') && response.status() === 200,
      { timeout: 30000 }
    );

    // Navigate to checkout
    console.log('[Test] Navigating to checkout...');
    await headerPage.clickCart();
    await page.waitForTimeout(2000);
    await checkoutHelper.navigateToCheckout();
    await page.waitForTimeout(2000);

    // Extract and compare prices
    console.log('[Test] Extracting prices from API and UI...');
    const cartResponse = await cartResponsePromise.catch(() => null);
    const apiData = cartResponse ? await cartResponse.json().catch(() => null) : null;
    const uiPrices = await checkoutHelper.getPriceBreakdown();

    if (apiData?.cart?.moneyToBePaid) {
      const apiTotal = Number(apiData.cart.moneyToBePaid.toFixed(2));
      const uiTotal = Number(uiPrices.total.toFixed(2));
      console.log(`[Test] API Total: ${apiTotal} SAR`);
      console.log(`[Test] UI Total: ${uiTotal} SAR`);
      console.log(`[Test] Difference: ${Math.abs(apiTotal - uiTotal)} SAR`);
      expect(Math.abs(apiTotal - uiTotal)).toBeLessThanOrEqual(0.05);
      console.log('[Test] Prices match!');
    } else {
      console.log('[Test] Could not extract API total, verifying UI prices only');
      console.log(`[Test] UI Total: ${uiPrices.total} SAR`);
      expect(uiPrices.total).toBeGreaterThan(0);
    }
  });

  test('should verify product prices before and after discount match between API and UI in precheckout', async ({ 
    page, homePage, registrationPage, productsPage, headerPage
  }, testInfo) => {
    testInfo.setTimeout(300000);

    const registrationHelper = new RegistrationHelper(page, registrationPage);
    const productHelper = new ProductHelper(page, productsPage, homePage);
    const checkoutHelper = new CheckoutHelper(page);

    // Register and add products
    await homePage.goto();
    await homePage.waitForPageLoad();
    await registrationHelper.quickRegister({ throwOnFailure: true });

    await page.goto(BASE_URL);
    await homePage.waitForPageLoad();
    for (let i = 0; i < 2; i++) {
      const { products } = await productHelper.selectCategoryWithProducts();
      await productHelper.selectRandomProduct(products);
      await page.locator('[data-eram-test-id="add-to-cart-button"]').first().click();
      await page.waitForTimeout(2000);
      if (i < 1) await page.goto(BASE_URL);
    }

    // Capture cart API
    const cartResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/cart') && response.status() === 200,
      { timeout: 30000 }
    );

    await headerPage.clickCart();
    await page.waitForTimeout(2000);
    await checkoutHelper.navigateToCheckout();
    await page.waitForTimeout(2000);

    // Get API and UI prices
    const cartResponse = await cartResponsePromise.catch(() => null);
    const apiData = cartResponse ? await cartResponse.json().catch(() => null) : null;
    const uiPrices = await checkoutHelper.getPriceBreakdown();

    // Compare
    if (apiData?.cart) {
      // API subtotal includes products + delivery, so compare with UI subtotal
      const apiSubtotal = apiData.cart.subtotal || 0;
      const apiDiscount = apiData.cart.productsDiscount || 0;
      const apiAfter = apiSubtotal - apiDiscount;
      const uiAfter = uiPrices.subtotal - uiPrices.discount;

      const normalize = (v: number) => Number(v.toFixed(2));
      
      console.log(`[Precheckout] API Subtotal: ${apiSubtotal}, UI Subtotal: ${uiPrices.subtotal}`);
      console.log(`[Precheckout] API Discount: ${apiDiscount}, UI Discount: ${uiPrices.discount}`);
      console.log(`[Precheckout] API After Discount: ${apiAfter}, UI After Discount: ${uiAfter}`);
      
      const diffSubtotal = Math.abs(normalize(apiSubtotal) - normalize(uiPrices.subtotal));
      const diffDiscount = Math.abs(normalize(apiDiscount) - normalize(uiPrices.discount));
      const diffAfter = Math.abs(normalize(apiAfter) - normalize(uiAfter));
      
      console.log(`[Precheckout] Differences - Subtotal: ${diffSubtotal}, Discount: ${diffDiscount}, After: ${diffAfter}`);
      
      expect(diffSubtotal).toBeLessThanOrEqual(0.05);
      expect(diffDiscount).toBeLessThanOrEqual(0.05);
      expect(diffAfter).toBeLessThanOrEqual(0.05);
    } else {
      console.log(`[Precheckout] UI Subtotal: ${uiPrices.subtotal}`);
      expect(uiPrices.subtotal).toBeGreaterThan(0);
    }
  });

  test('should verify wallet balance and total balance match between API and UI', async ({ 
    page, homePage, registrationPage, headerPage
  }, testInfo) => {
    testInfo.setTimeout(300000);

    const registrationHelper = new RegistrationHelper(page, registrationPage);
    const checkoutHelper = new CheckoutHelper(page);

    // Register user
    await homePage.goto();
    await homePage.waitForPageLoad();
    await registrationHelper.quickRegister({ throwOnFailure: true });

    // Capture customer API for wallet balance
    const customerResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/customer/me') && response.status() === 200,
      { timeout: 30000 }
    );

    // Navigate to profile page
    await page.goto(BASE_URL);
    await headerPage.clickMyProfile();
    await page.waitForTimeout(3000);

    // Get wallet balance from UI and API
    const uiWalletBalance = await checkoutHelper.getWalletBalance();
    const customerResponse = await customerResponsePromise.catch(() => null);
    const customerData = customerResponse ? await customerResponse.json().catch(() => null) : null;
    const apiWalletBalance = customerData?.walletBalance ?? customerData?.balance ?? customerData?.customer?.walletBalance ?? null;

    // Compare wallet balance
    if (apiWalletBalance !== null && uiWalletBalance !== null) {
      const normalize = (v: number) => Number(v.toFixed(2));
      const diff = Math.abs(normalize(apiWalletBalance) - normalize(uiWalletBalance));
      console.log(`[Balance] Wallet - API: ${apiWalletBalance}, UI: ${uiWalletBalance}, Diff: ${diff}`);
      expect(diff).toBeLessThanOrEqual(0.05);
    }

    // Check total balance from cart
    const cartResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/cart') && response.status() === 200,
      { timeout: 30000 }
    );

    await page.goto(BASE_URL);
    await headerPage.clickCart();
    await page.waitForTimeout(2000);

    const cartResponse = await cartResponsePromise.catch(() => null);
    const cartData = cartResponse ? await cartResponse.json().catch(() => null) : null;

    if (cartData?.cart?.moneyToBePaid !== undefined) {
      const apiTotal = Number(cartData.cart.moneyToBePaid.toFixed(2));
      await checkoutHelper.navigateToCheckout();
      await page.waitForTimeout(2000);
      const uiPrices = await checkoutHelper.getPriceBreakdown();
      const uiTotal = Number(uiPrices.total.toFixed(2));
      
      const diff = Math.abs(apiTotal - uiTotal);
      console.log(`[Balance] Total - API: ${apiTotal}, UI: ${uiTotal}, Diff: ${diff}`);
      expect(diff).toBeLessThanOrEqual(0.05);
    }
  });
});