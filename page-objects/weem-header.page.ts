import { Page } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Weem Header Page Object
 * Contains all selectors and actions for the header section
 * Header appears on all pages (home, products, cart, etc.)
 */
export class WeemHeaderPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Search for a product
   * Includes explicit wait for search input to handle async loading
   */
  async search(productName: string): Promise<void> {
    // Wait for search input to be visible (may load asynchronously)
    const searchInput = this.locators.byEramTestId('search-input');
    await this.waitForVisible(searchInput, 10000);

    // Fill search query
    await this.fill(searchInput, productName);

    // Click search button
    await this.click(this.locators.byEramTestId('search-button'));
  }

  /**
   * Click on cart icon
   */
  async clickCart(): Promise<void> {
    await this.click(this.locators.byEramTestId('cart-icon'));
  }

  /**
   * Click on favorites/wishlist icon
   */
  async clickFavorites(): Promise<void> {
    await this.click(this.locators.byEramTestId('favorites-icon'));
  }

  /**
   * Click My Profile dropdown
   */
  async clickMyProfile(): Promise<void> {
    await this.click(this.locators.byText('My Profile'));
  }

  /**
   * Click Register button from user dropdown
   */
  async clickRegister(): Promise<void> {
    await this.click(this.locators.byEramTestId('user-dropdown-register-button'));
  }

  /**
   * Click Login button from user dropdown
   */
  async clickLogin(): Promise<void> {
    await this.click(this.locators.byEramTestId('user-dropdown-login-button'));
  }

  /**
   * Select language (English/Arabic)
   * @param language - 'English' or 'Arabic'
   */
  async selectLanguage(language: 'English' | 'Arabic'): Promise<void> {
    // Click the current language dropdown (e.g., "English")
    const currentLanguage = language === 'Arabic' ? 'English' : 'العربية';
    const languageDropdown = this.page.getByText(currentLanguage);
    await this.click(languageDropdown);
    
    // Select the target language
    const targetLanguage = language === 'Arabic' ? 'العربية' : 'English';
    const languageOption = this.page.getByText(targetLanguage);
    await this.click(languageOption);
  }

  /**
   * Click Deliver to button
   */
  async clickDeliverTo(): Promise<void> {
    // Multiple deliver-to-button elements exist, use first one
    const deliverToButton = this.locators.byEramTestId('deliver-to-button').first();
    await this.click(deliverToButton);
  }

  /**
   * Click Choose from map option
   */
  async clickChooseFromMap(): Promise<void> {
    await this.click(this.locators.byText('Choose from map'));
  }

  /**
   * Select delivery location
   */
  async selectDeliveryLocation(location: string): Promise<void> {
    await this.clickDeliverTo();
    await this.click(this.locators.byText(location));
  }

  /**
   * Verify Add new Address page loaded
   */
  async verifyAddNewAddressPage(): Promise<boolean> {
    const currentUrl = await this.getCurrentUrl();
    return currentUrl.includes('address') || currentUrl.includes('map');
  }

  /**
   * Get cart item count
   */
  async getCartCount(): Promise<number> {
    const cartCountElement = this.page.locator('[data-eram-test-id="cart-icon"]').locator('..').locator('text=/\\d+/');
    const countText = await this.getText(cartCountElement).catch(() => '0');
    return parseInt(countText) || 0;
  }

  /**
   * Get favorites count
   */
  async getFavoritesCount(): Promise<number> {
    const favoritesCountElement = this.page.locator('[data-eram-test-id="favorites-icon"]').locator('..').locator('text=/\\d+/');
    const countText = await this.getText(favoritesCountElement).catch(() => '0');
    return parseInt(countText) || 0;
  }

  /**
   * Verify header is loaded
   */
  async verifyHeaderLoaded(): Promise<boolean> {
    const searchInput = this.locators.byEramTestId('search-input');
    return await this.isVisible(searchInput, 5000);
  }

  /**
   * Click hamburger menu
   */
  async clickHamburgerMenu(): Promise<void> {
    const hamburgerMenu = this.page.getByRole('button', { name: /menu/i });
    await this.click(hamburgerMenu);
  }

  /**
   * Click navigation category from top menu
   */
  async clickNavigationCategory(categoryName: string): Promise<void> {
    const categoryLink = this.page.locator('nav').getByText(categoryName);
    await this.click(categoryLink);
  }
}

