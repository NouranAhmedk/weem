import { test, expect } from '../fixtures/test.fixtures';

/**
 * Pagination Test
 * Simple check: for every category, we can scroll and load at least 60 products.
 */
test.describe('Pagination & Product Volume', () => {
  test('should load at least 60 products in every category', async ({
    homePage,
    productsPage,
    page,
  }) => {
    await homePage.goto();
    await homePage.waitForPageLoad();

    const categories = await homePage.getAllCategories();
    expect(categories.length).toBeGreaterThan(0);

    console.log(`Found ${categories.length} categories. Verifying each has at least 60 products...`);

    for (let index = 0; index < categories.length; index++) {
      const category = categories[index];
      const categoryName = (await category.textContent())?.trim() || `Category #${index + 1}`;

      console.log(`\n[Category] Checking "${categoryName}" (${index + 1}/${categories.length})`);

      await category.click();
      await page.waitForTimeout(2000);
      await productsPage.waitForProductsToLoad();

      let previousCount = await productsPage.getProductCount();
      let sameCountStreak = 0;

      // Scroll up to 10 times or until we stop seeing new products
      for (let scroll = 1; scroll <= 10; scroll++) {
        await page.evaluate(() => {
          window.scrollBy(0, window.innerHeight);
        });
        await page.waitForTimeout(1500);

        const currentCount = await productsPage.getProductCount();

        if (currentCount > previousCount) {
          console.log(`[Category] Scroll ${scroll}: product count increased from ${previousCount} to ${currentCount}`);
          previousCount = currentCount;
          sameCountStreak = 0;
        } else {
          sameCountStreak++;
          console.log(`[Category] Scroll ${scroll}: product count stayed at ${currentCount} (no new products)`);
        }

        // Assume we've reached the end if the count doesn't change twice in a row
        if (sameCountStreak >= 2) {
          break;
        }
      }

      console.log(`[Category] "${categoryName}" final product count: ${previousCount}`);
      expect(previousCount).toBeGreaterThanOrEqual(60);

      // Go back to home page to select the next category
      await homePage.goto();
      await homePage.waitForPageLoad();
    }
  });
});

