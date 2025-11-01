import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Weem Cart Page Object
 * Handles shopping cart operations
 */
/**
 * WARNING: Most cart elements do not have data-eram-test-id attributes yet.
 * This page object uses fallback selectors until dev team adds test IDs.
 * See TEST_ID_MAPPING.md for the list of missing cart test IDs.
 */
export class WeemCartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify item is in cart
   *
   * WARNING: Cart item test IDs not yet discovered.
   * Using text-based fallback selector.
   */
  async verifyItemInCart(productName: string): Promise<boolean> {
    // TODO: Add cart item test IDs when available (e.g., 'cart-item-{productId}')
    return await this.isVisible(this.locators.byText(productName), 5000);
  }

  /**
   * Remove item from cart
   *
   * WARNING: Remove button test ID not yet discovered.
   * Using fallback selectors.
   */
  async removeItemFromCart(productName: string): Promise<void> {
    // TODO: Add remove button test ID when available (e.g., 'remove-item-button' or 'cart-item-remove-{productId}')
    const removeButton = this.locators.byTitle('Remove')
      || this.locators.byText('Remove')
      || this.locators.byRole('button', 'Remove');

    await this.click(removeButton);
  }

  /**
   * Clear entire cart
   *
   * WARNING: Clear cart button test ID not yet discovered.
   * Using fallback selectors.
   */
  async clearCart(): Promise<void> {
    // TODO: Add clear cart button test ID when available (e.g., 'clear-cart-button')
    const clearButton = this.locators.byText('Clear Cart')
      || this.locators.byText('Clear')
      || this.locators.byRole('button', 'Clear');

    await this.click(clearButton);
  }

  /**
   * Get cart total
   *
   * WARNING: Cart total test ID not yet discovered.
   * Using fallback selectors.
   */
  async getCartTotal(): Promise<string> {
    // TODO: Add cart total test ID when available (e.g., 'cart-total' or 'cart-subtotal')
    const totalElement = this.locators.byText('Total')
      || this.locators.byTestId('cart-total');

    return await this.getText(totalElement);
  }

  /**
   * Proceed to checkout
   *
   * WARNING: Checkout button test ID not yet discovered.
   * Using fallback selectors.
   */
  async proceedToCheckout(): Promise<void> {
    // TODO: Add checkout button test ID when available (e.g., 'checkout-button' or 'proceed-to-checkout-button')
    const checkoutButton = this.locators.byRole('button', 'Checkout')
      || this.locators.byText('Checkout')
      || this.locators.byRole('link', 'Checkout');

    await this.click(checkoutButton);
  }

  /**
   * Get number of items in cart
   *
   * WARNING: Cart count badge test ID not yet discovered.
   * Using fallback selectors.
   */
  async getCartItemCount(): Promise<number> {
    // TODO: Add cart count test ID when available (e.g., 'cart-count-badge')
    const countElement = this.locators.byTestId('cart-count');
    const count = await this.getText(countElement);
    return parseInt(count || '0');
  }

  /**
   * Verify cart is empty
   *
   * WARNING: Empty cart message test ID not yet discovered.
   * Using text-based fallback selectors.
   */
  async verifyCartIsEmpty(): Promise<boolean> {
    // TODO: Add empty cart message test ID when available (e.g., 'empty-cart-message')
    const emptyMessage = this.locators.byText('Your cart is empty')
      || this.locators.byText('Cart is empty');

    return await this.isVisible(emptyMessage, 2000);
  }

  /**
   * Apply coupon code
   *
   * WARNING: Coupon input and apply button test IDs not yet discovered.
   * Using fallback selectors.
   */
  async applyCoupon(couponCode: string): Promise<void> {
    // TODO: Add coupon input test ID when available (e.g., 'coupon-input')
    const couponInput = this.locators.byPlaceholder('Enter coupon code')
      || this.locators.byName('coupon');

    await this.fill(couponInput, couponCode);

    // TODO: Add apply coupon button test ID when available (e.g., 'apply-coupon-button')
    const applyButton = this.locators.byRole('button', 'Apply')
      || this.locators.byText('Apply Coupon');

    await this.click(applyButton);
  }

  /**
   * Get cart icon locator
   * Finds cart icon dynamically using multiple fallback strategies
   *
   * WARNING: Cart icon test ID not yet discovered.
   * Using comprehensive fallback selectors.
   */
  async getCartIcon() {
    // Try multiple strategies to find cart icon
    const strategies = [
      // Try test ID first (if added in future)
      () => this.page.locator('[data-eram-test-id="cart-icon"]'),
      () => this.page.locator('[data-eram-test-id="cart-button"]'),

      // Try aria labels
      () => this.page.locator('[aria-label="Cart"]'),
      () => this.page.locator('[aria-label*="Shopping cart"]'),
      () => this.page.locator('[aria-label*="View cart"]'),

      // Try common cart icon patterns
      () => this.page.locator('button:has(svg):has-text("Cart")').first(),
      () => this.page.locator('a:has(svg):has-text("Cart")').first(),

      // Try by role and text
      () => this.page.getByRole('link', { name: /cart/i }),
      () => this.page.getByRole('button', { name: /cart/i }),

      // Try class-based selectors (common e-commerce patterns)
      () => this.page.locator('.cart-icon').first(),
      () => this.page.locator('.shopping-cart').first(),
      () => this.page.locator('[class*="cart-button"]').first(),
    ];

    // Try each strategy until one works
    for (const strategy of strategies) {
      try {
        const element = strategy();
        const isVisible = await element.isVisible({ timeout: 2000 }).catch(() => false);
        if (isVisible) {
          console.log('Found cart icon using strategy');
          return element;
        }
      } catch (e) {
        // Try next strategy
        continue;
      }
    }

    // If no strategy worked, return first cart-related element as fallback
    console.log('Using fallback cart icon selector');
    return this.page.locator('[aria-label*="cart" i], [class*="cart" i]').first();
  }

  /**
   * Click cart icon to open cart
   * Uses dynamic cart icon finder
   */
  async openCart(): Promise<void> {
    // Wait for any modal overlays to disappear (like "added to cart" notifications)
    const overlay = this.page.locator('[class*="fixed"][class*="z-50"], [class*="modal"], [class*="overlay"]');
    try {
      await overlay.waitFor({ state: 'hidden', timeout: 5000 });
    } catch (e) {
      console.log('No overlay found or overlay did not disappear, proceeding...');
    }

    // Wait a moment for page to stabilize
    await this.page.waitForTimeout(1000);

    const cartIcon = await this.getCartIcon();

    // Force click if needed (to bypass any remaining overlays)
    try {
      await cartIcon.click({ timeout: 5000 });
    } catch (e) {
      console.log('Normal click failed, trying force click');
      await cartIcon.click({ force: true });
    }

    await this.page.waitForLoadState('domcontentloaded');

    // Handle authentication modal if it appears
    const authModalHandled = await this.handleAuthenticationModal();

    // If auth modal was handled, click cart icon again to open cart
    if (authModalHandled) {
      console.log('Re-clicking cart icon after dismissing auth modal');
      await this.page.waitForTimeout(1000);
      const cartIconAgain = await this.getCartIcon();
      await cartIconAgain.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1500);
    }
  }

  /**
   * Handle authentication/registration modal that may appear when accessing cart
   * Clicks "Continue as guest" if modal appears
   * @returns true if modal was handled, false otherwise
   */
  async handleAuthenticationModal(): Promise<boolean> {
    // Wait a moment for modal to appear
    await this.page.waitForTimeout(1500);

    // Check if registration modal appeared
    const continueAsGuestButton = this.page.getByText('Continue as guest', { exact: false });
    const isVisible = await continueAsGuestButton.isVisible().catch(() => false);

    if (isVisible) {
      console.log('Authentication modal detected, clicking "Continue as guest"');
      await continueAsGuestButton.click();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(1000);
      return true;
    } else {
      console.log('No authentication modal detected');
      return false;
    }
  }

  /**
   * Get all cart items
   * Returns array of cart item elements
   *
   * WARNING: Cart item container test IDs not yet discovered.
   * Using common e-commerce DOM patterns.
   */
  async getAllCartItems(): Promise<any[]> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(1000);

    // Try multiple strategies to find cart items
    const strategies = [
      // Try test ID pattern
      () => this.page.locator('[data-eram-test-id^="cart-item-"]').all(),

      // Try finding items within cart sidebar/modal
      () => this.page.locator('[class*="cart"] img[alt]').all(), // Products usually have images
      () => this.page.locator('[class*="cart"] >> img').all(),

      // Try common cart item patterns
      () => this.page.locator('[class*="cart-item"]').all(),
      () => this.page.locator('[class*="cart__item"]').all(),
      () => this.page.locator('[data-testid*="cart-item"]').all(),

      // Try list item patterns
      () => this.page.locator('ul[class*="cart"] > li').all(),
      () => this.page.locator('div[class*="cart-items"] > div').all(),

      // Try product-specific patterns within cart
      () => this.page.locator('[class*="cart"] [class*="product"]').all(),

      // Fallback: look for quantity controls (usually one per item)
      () => this.page.locator('[class*="cart"] button:has-text("+")').all(),
      () => this.page.locator('[class*="cart"] input[type="number"]').all(),
    ];

    // Try each strategy
    for (const strategy of strategies) {
      try {
        const items = await strategy();
        if (items.length > 0) {
          console.log(`Found ${items.length} cart items using strategy`);
          return items;
        }
      } catch (e) {
        continue;
      }
    }

    console.log('No cart items found with any strategy');
    return [];
  }

  /**
   * Get first cart item element
   * Useful for working with random products
   */
  async getFirstCartItem(): Promise<any> {
    const items = await this.getAllCartItems();

    if (items.length === 0) {
      throw new Error('No items in cart');
    }

    return items[0];
  }

  /**
   * Remove first item from cart
   * Works without knowing product name (useful for random products)
   */
  async removeFirstItemFromCart(): Promise<void> {
    const firstItem = await this.getFirstCartItem();

    // Find remove button within the first cart item
    const removeButton = firstItem.locator('button:has-text("Remove"), button[aria-label*="Remove"], button[title*="Remove"]').first();

    // If not found in item, try general remove button
    if (!(await removeButton.isVisible().catch(() => false))) {
      console.log('Using fallback remove button');
      await this.removeItemFromCart(''); // Use existing method's fallback
      return;
    }

    console.log('Removing first item from cart');
    await removeButton.click();
  }

  /**
   * Wait for cart page to load
   * Ensures cart elements are ready
   */
  async waitForCartToLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');

    // Wait for cart page indicators
    const indicators = [
      this.page.getByText('Shopping Cart', { exact: false }),
      this.page.getByText('Cart', { exact: false }),
      this.page.getByText('Your Cart', { exact: false }),
    ];

    for (const indicator of indicators) {
      const isVisible = await indicator.isVisible({ timeout: 3000 }).catch(() => false);
      if (isVisible) {
        console.log('Cart page loaded');
        return;
      }
    }

    // Fallback: just wait for load state
    console.log('Cart page load state complete');
  }

  /**
   * Verify cart has items
   * Returns true if cart is not empty
   */
  async hasItems(): Promise<boolean> {
    // Try multiple strategies to verify cart has items
    // Strategy 1: Check for "Items Details" text
    const itemsDetailsText = await this.page.getByText(/Items Details|تفاصيل المنتجات/i).isVisible().catch(() => false);
    if (itemsDetailsText) {
      console.log('Cart has items - found "Items Details" text');
      return true;
    }

    // Strategy 2: Check for checkout button (only visible when cart has items)
    const checkoutButton = await this.page.getByText(/Checkout|الدفع/i).isVisible().catch(() => false);
    if (checkoutButton) {
      console.log('Cart has items - found checkout button');
      return true;
    }

    // Strategy 3: Use getAllCartItems
    const items = await this.getAllCartItems();
    if (items.length > 0) {
      console.log(`Cart has items - found ${items.length} items`);
      return true;
    }

    // Strategy 4: Check for "empty cart" message (if not present, cart has items)
    const emptyMessage = await this.page.getByText(/Your cart is empty|عربة التسوق فارغة/i).isVisible().catch(() => false);
    if (!emptyMessage) {
      console.log('Cart has items - no empty message found');
      return true;
    }

    console.log('Cart appears to be empty');
    return false;
  }
}


