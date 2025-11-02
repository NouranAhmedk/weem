import { Page } from '@playwright/test';
import { BasePage } from '../base-page';
import { ADMIN_URL } from '../../utils/app-config';

/**
 * Admin Products Page Object
 * Handles product management in admin dashboard
 */
export class AdminProductsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to admin products page
   */
  async goto(): Promise<void> {
    await this.navigateTo(`${ADMIN_URL}/products/`);
  }

  /**
   * Click Add Product button
   */
  async clickAddProduct(): Promise<void> {
    await this.click(this.locators.byText('Add Product'));
  }

  /**
   * Fill product form
   */
  async fillProductForm(productData: {
    name: string;
    price: number;
    stock?: number;
    category?: string;
  }): Promise<void> {
    await this.fill(this.locators.byName('name'), productData.name);
    await this.fill(this.locators.byName('price'), productData.price.toString());
    
    if (productData.stock) {
      await this.fill(this.locators.byName('stock'), productData.stock.toString());
    }
    
    if (productData.category) {
      await this.selectOption(this.locators.byName('category'), productData.category);
    }
  }

  /**
   * Click Save button
   */
  async clickSave(): Promise<void> {
    await this.click(this.locators.byRole('button', 'Save'));
  }

  /**
   * Search for product
   */
  async searchProduct(productName: string): Promise<void> {
    const searchInput = this.locators.byPlaceholder('Search');
    await this.fill(searchInput, productName);
    await this.press(searchInput, 'Enter');
  }

  /**
   * Edit product by name
   */
  async editProduct(productName: string): Promise<void> {
    await this.searchProduct(productName);
    await this.click(this.locators.byText('Edit').first());
  }

  /**
   * Delete product by name
   */
  async deleteProduct(productName: string): Promise<void> {
    await this.searchProduct(productName);
    await this.click(this.locators.byText('Delete').first());
    
    // Confirm deletion
    await this.click(this.locators.byRole('button', 'Confirm'));
  }

  /**
   * Get product count in table
   */
  async getProductCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return await this.getCount(rows);
  }

  /**
   * Verify product exists in list
   */
  async verifyProductExists(productName: string): Promise<boolean> {
    const productRow = this.page.getByText(productName);
    return await this.isVisible(productRow, 5000);
  }
}


