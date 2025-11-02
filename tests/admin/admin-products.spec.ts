import { test, expect } from '../../fixtures/test.fixtures';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../utils/app-config';

/**
 * Admin Products Tests
 * Test product management in admin dashboard
 */
test.describe('Admin Products', () => {
  test.beforeEach(async ({ adminLoginPage, adminProductsPage }) => {
    // Login to admin
    await adminLoginPage.goto();
    await adminLoginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    
    // Navigate to products page
    await adminProductsPage.goto();
  });

  test('should display products list', async ({ adminProductsPage }) => {
    const productCount = await adminProductsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should create new product', async ({ adminProductsPage }) => {
    await adminProductsPage.clickAddProduct();
    
    const productData = {
      name: `Test Product ${Date.now()}`,
      price: 99.99,
      stock: 100,
    };
    
    await adminProductsPage.fillProductForm(productData);
    await adminProductsPage.clickSave();
    
    const exists = await adminProductsPage.verifyProductExists(productData.name);
    expect(exists).toBeTruthy();
  });

  test('should search for product', async ({ adminProductsPage }) => {
    await adminProductsPage.searchProduct('phone');
    
    const productCount = await adminProductsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });
});


