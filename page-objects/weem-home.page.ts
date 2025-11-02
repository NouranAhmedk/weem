import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Weem Home Page Object
 * Contains all selectors and actions for the Weem.sa homepage
 */
export class WeemHomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Weem homepage
   */
  async goto(): Promise<void> {
    await this.navigateTo('https://dev.weem.sa/en');
  }

  /**
   * Wait for homepage to load
   * Uses element-based waiting instead of arbitrary timeouts for better reliability
   * Overrides BasePage waitForPageLoad with homepage-specific logic
   */
  async waitForPageLoad(): Promise<void> {
    // Wait for key homepage element to be visible instead of arbitrary timeout
    // This is more reliable and faster than waiting for DOM + fixed delay
    await this.waitForVisible(
      this.locators.byEramTestId('shop-by-category-title'),
      15000
    );
  }

  /**
   * Click on Download App section
   */
  async clickDownloadApp(): Promise<void> {
    await this.click(this.locators.byEramTestId('download-app-title'));
  }

  /**
   * Click Google Play download button
   */
  async clickGooglePlay(): Promise<void> {
    await this.click(this.locators.byEramTestId('google-play-link'));
  }

  /**
   * Click App Store download button
   */
  async clickAppStore(): Promise<void> {
    await this.click(this.locators.byEramTestId('app-store-link'));
  }

  /**
   * Navigate to shop by category
   * @param categoryName - Category name or ID
   *
   * Note: Categories have test IDs like 'category-13-link', but we need
   * to know the numeric ID. For name-based navigation, we use text fallback.
   * For ID-based navigation, pass numeric ID as string.
   */
  async navigateToCategory(categoryName: string): Promise<void> {
    // If categoryName is numeric, use test ID
    if (/^\d+$/.test(categoryName)) {
      await this.click(this.locators.byEramTestId(`category-${categoryName}-link`));
    } else {
      // Fallback to text-based navigation for category names
      await this.click(this.locators.byText(categoryName));
    }
  }

  /**
   * Navigate to best sellers
   */
  async navigateToBestSellers(): Promise<void> {
    await this.click(this.locators.byEramTestId('best-seller-title'));
  }

  /**
   * Search for a product
   * NOTE: Search is part of the header (appears on all pages)
   * Use headerPage.search() instead
   * 
   * @deprecated Use headerPage.search() instead
   */
  async searchProduct(productName: string): Promise<void> {
    // Kept for backward compatibility
    const searchInput = this.locators.byEramTestId('search-input');
    await this.waitForVisible(searchInput, 10000);
    await this.fill(searchInput, productName);
    await this.click(this.locators.byEramTestId('search-button'));
  }

  /**
   * Verify homepage loaded successfully
   */
  async verifyHomepageLoaded(): Promise<boolean> {
    return await this.isVisible(
      this.locators.byEramTestId('shop-by-category-title'),
      10000
    );
  }

  /**
   * Get all available category links from homepage
   * Returns array of category elements that can be clicked
   */
  async getAllCategories(): Promise<any[]> {
    // Wait for categories section to load
    await this.waitForVisible(this.locators.byEramTestId('shop-by-category-title'), 10000);

    // Wait a moment for categories to render
    await this.page.waitForTimeout(1000);

    // Try test ID pattern first (most reliable)
    const categoryLocator = this.page.locator('[data-eram-test-id^="category-"][data-eram-test-id$="-link"]');

    // Wait for at least one category to appear
    try {
      await categoryLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
      console.log('Warning: No categories with test IDs found, trying fallback selectors');
    }

    const categories = await categoryLocator.all();

    if (categories.length > 0) {
      console.log(`Found ${categories.length} categories with test IDs`);
      return categories;
    }

    // Fallback: Try href pattern (only if test IDs don't work)
    console.log('Trying fallback: href pattern');
    const hrefCategories = await this.page.locator('a[href*="/en/category/"], a[href*="/ar/category/"]').all();

    if (hrefCategories.length > 0) {
      console.log(`Found ${hrefCategories.length} categories using href pattern`);
      return hrefCategories;
    }

    console.log('No categories found');
    return [];
  }

  /**
   * Get count of available categories
   */
  async getCategoryCount(): Promise<number> {
    const categories = await this.getAllCategories();
    return categories.length;
  }

  /**
   * Navigate to a random category
   * Returns the category element that was clicked
   */
  async navigateToRandomCategory(): Promise<void> {
    const categories = await this.getAllCategories();

    if (categories.length === 0) {
      throw new Error('No categories found on homepage');
    }

    // Select random category
    const randomIndex = Math.floor(Math.random() * categories.length);
    const randomCategory = categories[randomIndex];

    // Get category name for logging
    const categoryText = await randomCategory.textContent();
    console.log(`Navigating to random category: ${categoryText}`);

    // Click the category
    await randomCategory.click();
  }

  /**
   * Navigate to first available category
   * Simpler alternative to random selection
   */
  async navigateToFirstCategory(): Promise<void> {
    const categories = await this.getAllCategories();

    if (categories.length === 0) {
      throw new Error('No categories found on homepage');
    }

    // Click first category
    const firstCategory = categories[0];
    const categoryText = await firstCategory.textContent();
    console.log(`Navigating to first category: ${categoryText}`);

    await firstCategory.click();
  }
}


