import { test, expect } from '../fixtures/test.fixtures';

test.describe('Weem Homepage', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test('should be able to search with existing product', async ({ homePage, productsPage, page }) => {
    const product = page.locator('[data-eram-test-id^="product-name-"][data-eram-test-id$="-link"]').first();
    await product.waitFor({ state: 'visible', timeout: 10000 });
    const productName = (await product.textContent())?.trim() || 'phone';
    
    await homePage.searchProduct(productName);
    await productsPage.waitForProductsToLoad();
    
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should test if dropdown of any random category is clickable', async ({ homePage}) => {
    const categories = await homePage.getAllCategories();
    expect(categories.length).toBeGreaterThan(0);

    const randomIndex = Math.floor(Math.random() * categories.length);
    const randomCategory = categories[randomIndex];
    
    await randomCategory.waitFor({ state: 'visible', timeout: 5000 });
    
    const isVisible = await randomCategory.isVisible();
    const isEnabled = await randomCategory.isEnabled();
    
    expect(isVisible).toBeTruthy();
    expect(isEnabled).toBeTruthy();
  });
});
