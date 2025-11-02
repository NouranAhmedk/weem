import { test as base } from '@playwright/test';
import { WeemHomePage } from '../page-objects/weem-home.page';
import { WeemHeaderPage } from '../page-objects/weem-header.page';
import { WeemFooterPage } from '../page-objects/weem-footer.page';
import { WeemRegistrationPage } from '../page-objects/weem-registration.page';
import { WeemProductsPage } from '../page-objects/weem-products.page';
import { WeemCartPage } from '../page-objects/weem-cart.page';
import { AdminLoginPage } from '../page-objects/admin/admin-login.page';
import { AdminProductsPage } from '../page-objects/admin/admin-products.page';
import { AdminOrdersPage } from '../page-objects/admin/admin-orders.page';
import { WeemApi } from '../api/weem-api';

/**
 * Type declarations for custom fixtures
 */
type TestFixtures = {
  // UI Pages
  homePage: WeemHomePage;
  headerPage: WeemHeaderPage;
  footerPage: WeemFooterPage;
  registrationPage: WeemRegistrationPage;
  productsPage: WeemProductsPage;
  cartPage: WeemCartPage;
  
  // Admin Pages
  adminLoginPage: AdminLoginPage;
  adminProductsPage: AdminProductsPage;
  adminOrdersPage: AdminOrdersPage;
  
  // API Client
  weemApi: WeemApi;
};

/**
 * Custom fixtures extending the base Playwright test
 * Provides page objects to all tests
 */
export const test = base.extend<TestFixtures>({
  // Homepage fixture
  homePage: async ({ page }, use) => {
    await use(new WeemHomePage(page));
  },

  // Header fixture
  headerPage: async ({ page }, use) => {
    await use(new WeemHeaderPage(page));
  },

  // Footer page fixture
  footerPage: async ({ page }, use) => {
    await use(new WeemFooterPage(page));
  },

  // Registration page fixture
  registrationPage: async ({ page }, use) => {
    await use(new WeemRegistrationPage(page));
  },

  // Products page fixture
  productsPage: async ({ page }, use) => {
    await use(new WeemProductsPage(page));
  },

  // Cart page fixture
  cartPage: async ({ page }, use) => {
    await use(new WeemCartPage(page));
  },

  // Admin login page fixture
  adminLoginPage: async ({ page }, use) => {
    await use(new AdminLoginPage(page));
  },

  // Admin products page fixture
  adminProductsPage: async ({ page }, use) => {
    await use(new AdminProductsPage(page));
  },

  // Admin orders page fixture
  adminOrdersPage: async ({ page }, use) => {
    await use(new AdminOrdersPage(page));
  },

  // API client fixture
  weemApi: async ({}, use) => {
    const api = new WeemApi();
    await api.init();
    await use(api);
    await api.dispose();
  },
});

export { expect } from '@playwright/test';

