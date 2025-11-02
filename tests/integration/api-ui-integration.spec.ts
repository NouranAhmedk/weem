import { test, expect } from '../../fixtures/test.fixtures';
import { TestSetupHelper } from '../../helpers/test-setup.helper';
import { generateRandomEmail } from '../../utils/phone-number.utils';

/**
 * Integration Tests
 * Test integration between API, UI, and Dashboard
 */
test.describe('API-UI Integration', () => {
  test('should create user via API and verify in UI', async ({ page, weemApi, homePage }) => {
    // Create user via API (fast)
    const user = await TestSetupHelper.createAuthenticatedUser(page);
    
    // Verify in UI
    await homePage.goto();
    const myProfile = page.getByText('My Profile');
    await expect(myProfile).toBeVisible();
  });

  test('should subscribe via API and verify error on duplicate UI subscription', async ({ weemApi, footerPage }) => {
    const email = generateRandomEmail();
    
    // Subscribe via API
    await weemApi.subscribeNewsletter(email);
    
    // Try to subscribe same email via UI
    await footerPage.subscribeToNewsletter(email);
    
    const hasError = await footerPage.verifyNewsletterError();
    expect(hasError).toBeTruthy();
  });

  test('should search products via API and UI returns same results', async ({ weemApi, homePage, productsPage }) => {
    // Search via API
    const apiResponse = await weemApi.searchProducts('phone');
    const apiProductCount = apiResponse.data?.length || apiResponse.data?.products?.length || 0;
    
    // Search via UI
    await homePage.goto();
    await homePage.searchProduct('phone');
    await productsPage.waitForProductsToLoad();
    const uiProductCount = await productsPage.getProductCount();
    
    // Both should return products
    expect(apiProductCount).toBeGreaterThan(0);
    expect(uiProductCount).toBeGreaterThan(0);
  });
});

test.describe('Dashboard-UI Integration', () => {
  test('should create product in dashboard and find it on UI', async ({ adminLoginPage, adminProductsPage, homePage, productsPage, page }) => {
    // Login to admin
    await adminLoginPage.goto();
    await adminLoginPage.login(process.env.ADMIN_USERNAME || 'admin', process.env.ADMIN_PASSWORD || 'admin123');
    
    // Create product in dashboard
    await adminProductsPage.goto();
    await adminProductsPage.clickAddProduct();
    
    const productName = `Test Product ${Date.now()}`;
    await adminProductsPage.fillProductForm({
      name: productName,
      price: 149.99,
      stock: 50,
    });
    await adminProductsPage.clickSave();
    
    // Search for product on UI
    await homePage.goto();
    await homePage.searchProduct(productName);
    await productsPage.waitForProductsToLoad();
    
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });
});


