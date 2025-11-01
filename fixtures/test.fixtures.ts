import { test as base } from '@playwright/test';
import { WeemHomePage } from '../page-objects/weem-home.page';
import { WeemRegistrationPage } from '../page-objects/weem-registration.page';
import { WeemProductsPage } from '../page-objects/weem-products.page';
import { WeemCartPage } from '../page-objects/weem-cart.page';
import { WeemFooterPage } from '../page-objects/weem-footer.page';

/**
 * Type declarations for custom fixtures
 */
type TestFixtures = {
  homePage: WeemHomePage;
  registrationPage: WeemRegistrationPage;
  productsPage: WeemProductsPage;
  cartPage: WeemCartPage;
  footerPage: WeemFooterPage;
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

  // Footer page fixture
  footerPage: async ({ page }, use) => {
    await use(new WeemFooterPage(page));
  },
});

export { expect } from '@playwright/test';

