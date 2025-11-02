import { test, expect } from '../fixtures/test.fixtures';

/**
 * Homepage Tests
 * Tests for homepage-specific content (categories, best sellers, etc.)
 * Note: Search tests moved to header.spec.ts
 */
test.describe('Weem Homepage', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test('should display shop by category section', async ({ homePage }) => {
    const categories = await homePage.getAllCategories();
    expect(categories.length).toBeGreaterThan(0);
  });

  test('should have clickable category from homepage', async ({ homePage }) => {
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

  test('should have Google Play link with correct href', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const googlePlayLink = page.locator('[data-eram-test-id="google-play-link"]');
    await expect(googlePlayLink).toBeVisible();
    
    const href = await googlePlayLink.getAttribute('href');
    expect(href).toContain('play.google.com');
  });

  test('should have App Store link with correct href', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const appStoreLink = page.locator('[data-eram-test-id="app-store-link"]');
    await expect(appStoreLink).toBeVisible();
    
    const href = await appStoreLink.getAttribute('href');
    expect(href).toContain('apple.com');
  });
});
