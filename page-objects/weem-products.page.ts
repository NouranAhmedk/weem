import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Weem Products Page Object
 * Handles product browsing and interactions
 */
export class WeemProductsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click on a product by name or ID
   * @param productNameOrId - Product name (string) or product ID (number/string)
   *
   * Note: Products have test IDs like 'product-name-1145-link'.
   * Pass numeric ID for test ID-based selection, or name for text-based fallback.
   */
  async clickProduct(productNameOrId: string | number): Promise<void> {
    // If productNameOrId is numeric, use test ID
    if (typeof productNameOrId === 'number' || /^\d+$/.test(productNameOrId.toString())) {
      await this.click(this.locators.byEramTestId(`product-name-${productNameOrId}-link`));
    } else {
      // Fallback to text-based navigation for product names
      await this.click(this.locators.byText(productNameOrId.toString()));
    }
  }

  /**
   * Add product to cart
   * @param productId - Optional product ID for targeting specific product's add to cart button
   *
   * Note: Multiple 'add-to-cart-button' test IDs exist on listing pages.
   * Use .first() for first product, or filter by aria-label with product name.
   * On product detail page, there's typically only one button.
   */
  async addToCart(productId?: string | number): Promise<void> {
    const addToCartButton = this.locators.byEramTestId('add-to-cart-button').first();
    await this.click(addToCartButton);
  }

  /**
   * View cart
   *
   * WARNING: Cart icon test ID not yet discovered.
   * Keeping fallback selectors until dev team adds test ID.
   */
  async viewCart(): Promise<void> {
    // TODO: Add cart icon test ID when available (e.g., 'cart-icon' or 'cart-button')
    // Note: Avoid byRole('button', 'Cart') as it matches "Add to Cart" buttons
    // Use more specific selectors like aria-label="View cart" or test IDs
    const cartIcon = this.locators.byTestId('cart-icon')
      || this.locators.byCss('[aria-label="Cart"]')
      || this.locators.byCss('button[aria-label*="View cart"]')
      || this.locators.byXPath('//button[contains(@class, "cart") and not(contains(., "Add"))]');

    await cartIcon.click();
  }

  /**
   * Select product size
   *
   * WARNING: Size selector test IDs not yet discovered.
   * Keeping fallback selectors until dev team adds test IDs.
   */
  async selectSize(size: string): Promise<void> {
    // TODO: Add size selector test IDs when available (e.g., 'size-selector-{size}')
    const sizeOption = this.locators.byText(size)
      || this.locators.byRole('button', size);

    await sizeOption.click();
  }

  /**
   * Select product color
   *
   * WARNING: Color selector test IDs not yet discovered.
   * Keeping fallback selectors until dev team adds test IDs.
   */
  async selectColor(color: string): Promise<void> {
    // TODO: Add color selector test IDs when available (e.g., 'color-selector-{color}')
    const colorOption = this.locators.byTitle(color)
      || this.locators.byRole('button', color);

    await colorOption.click();
  }

  /**
   * Increase product quantity
   *
   * WARNING: Quantity increase button test ID not yet discovered.
   * Keeping fallback selectors until dev team adds test IDs.
   */
  async increaseQuantity(): Promise<void> {
    // TODO: Add quantity increase test ID when available (e.g., 'quantity-increase-button')
    const increaseButton = this.locators.byRole('button', '+')
      || this.locators.byText('+');

    await increaseButton.click();
  }

  /**
   * Decrease product quantity
   *
   * WARNING: Quantity decrease button test ID not yet discovered.
   * Keeping fallback selectors until dev team adds test IDs.
   */
  async decreaseQuantity(): Promise<void> {
    // TODO: Add quantity decrease test ID when available (e.g., 'quantity-decrease-button')
    const decreaseButton = this.locators.byRole('button', '-')
      || this.locators.byText('-');

    await decreaseButton.click();
  }

  /**
   * Navigate to a specific category
   * @param categoryNameOrId - Category name or ID
   *
   * Note: Categories have test IDs like 'category-13-link'.
   * Pass numeric ID for test ID-based selection, or name for text-based fallback.
   */
  async navigateToCategory(categoryNameOrId: string | number): Promise<void> {
    // If categoryNameOrId is numeric, use test ID
    if (typeof categoryNameOrId === 'number' || /^\d+$/.test(categoryNameOrId.toString())) {
      await this.click(this.locators.byEramTestId(`category-${categoryNameOrId}-link`));
    } else {
      // Fallback to text-based navigation for category names
      await this.click(this.locators.byText(categoryNameOrId.toString()));
    }
  }

  /**
   * View product details
   */
  async viewProductDetails(productName: string): Promise<void> {
    await this.clickProduct(productName);
  }

  /**
   * Get product price
   */
  async getProductPrice(): Promise<string> {
    // Try multiple strategies to find price
    // 1. Try data-eram-test-id for price element
    const priceByTestId = this.locators.byEramTestId('product-price');
    if (await this.exists(priceByTestId)) {
      return await this.getText(priceByTestId);
    }
    
    // 2. Try data-price attribute
    const priceByAttribute = this.page.locator('[data-price]');
    if (await this.exists(priceByAttribute)) {
      const priceAttr = await priceByAttribute.getAttribute('data-price');
      return priceAttr || '';
    }
    
    // 3. Try aria-label with price
    const priceByAria = this.page.locator('[aria-label*="price"], [aria-label*="SAR"]');
    if (await this.exists(priceByAria)) {
      const ariaLabel = await priceByAria.getAttribute('aria-label');
      return ariaLabel || '';
    }
    
    // 4. Fallback to text pattern
    return await this.getText(this.locators.byText(/SAR\s*[\d,]+/));
  }

  /**
   * Filter products by price range
   */
  async filterByPrice(minPrice: number, maxPrice: number): Promise<void> {
    const minPriceInput = this.locators.byPlaceholder('Min price')
      || this.locators.byName('minPrice');
    const maxPriceInput = this.locators.byPlaceholder('Max price')
      || this.locators.byName('maxPrice');

    await this.fill(minPriceInput, minPrice.toString());
    await this.fill(maxPriceInput, maxPrice.toString());
  }

  /**
   * Get all available product links from current page
   * Returns array of product elements that can be clicked
   */
  async getAllProducts(): Promise<any[]> {
    // Wait for products to load
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);

    // Try test ID pattern first (most reliable)
    const productLocator = this.page.locator('[data-eram-test-id^="product-name-"][data-eram-test-id$="-link"]');

    // Wait for at least one product to appear
    try {
      await productLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
      console.log('Warning: No products with test IDs found, trying fallback selectors');
    }

    const products = await productLocator.all();

    if (products.length > 0) {
      console.log(`Found ${products.length} products with test IDs`);
      return products;
    }

    // Fallback: Try href pattern (only if test IDs don't work)
    console.log('Trying fallback: href pattern');
    const hrefProducts = await this.page.locator('a[href*="/en/product/"], a[href*="/ar/product/"]').all();

    if (hrefProducts.length > 0) {
      console.log(`Found ${hrefProducts.length} products using href pattern`);
      return hrefProducts;
    }

    console.log('No products found');
    return [];
  }

  /**
   * Get count of available products on current page
   */
  async getProductCount(): Promise<number> {
    const products = await this.getAllProducts();
    return products.length;
  }

  /**
   * Click on the first available product
   * Simpler alternative to random selection
   */
  async clickFirstProduct(): Promise<void> {
    const products = await this.getAllProducts();

    if (products.length === 0) {
      throw new Error('No products found on page');
    }

    // Click first product
    const firstProduct = products[0];
    const productText = await firstProduct.textContent();
    console.log(`Clicking first product: ${productText}`);

    await firstProduct.click();
  }

  /**
   * Click on a random product from available products
   * Alternative to first product selection
   */
  async clickRandomProduct(): Promise<void> {
    const products = await this.getAllProducts();

    if (products.length === 0) {
      throw new Error('No products found on page');
    }

    // Select random product
    const randomIndex = Math.floor(Math.random() * products.length);
    const randomProduct = products[randomIndex];

    // Get product name for logging
    const productText = await randomProduct.textContent();
    console.log(`Clicking random product: ${productText}`);

    // Click the product
    await randomProduct.click();
  }

  /**
   * Check if product is in stock
   * Looks for "Out of stock" or similar indicators
   */
  async isProductInStock(): Promise<boolean> {
    // Wait a moment for product details to load
    await this.page.waitForLoadState('domcontentloaded');

    // Check for common out-of-stock indicators
    const outOfStockIndicators = [
      this.page.getByText('Out of stock', { exact: false }),
      this.page.getByText('Sold out', { exact: false }),
      this.page.getByText('Not available', { exact: false }),
      this.page.locator('[data-eram-test-id*="out-of-stock"]'),
    ];

    // If any out-of-stock indicator is visible, product is not in stock
    for (const indicator of outOfStockIndicators) {
      const isVisible = await indicator.isVisible().catch(() => false);
      if (isVisible) {
        console.log('Product is out of stock');
        return false;
      }
    }

    console.log('Product is in stock');
    return true;
  }

  /**
   * Wait for products to load on page
   * Useful after navigation to category or search
   */
  async waitForProductsToLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    // Give page a moment to render products
    await this.page.waitForTimeout(1000);

    // Try to find products using the same strategies as getAllProducts
    const products = await this.getAllProducts();

    if (products.length === 0) {
      console.log('Warning: No products found after waiting for page load');
    } else {
      console.log(`Products loaded: ${products.length} products found`);
    }
  }
}


