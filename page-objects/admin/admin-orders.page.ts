import { Page } from '@playwright/test';
import { BasePage } from '../base-page';
import { ADMIN_URL } from '../../utils/app-config';

/**
 * Admin Orders Page Object
 * Handles order management in admin dashboard
 */
export class AdminOrdersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to admin orders page
   */
  async goto(): Promise<void> {
    await this.navigateTo(`${ADMIN_URL}/orders/`);
  }

  /**
   * Search for order by order number or email
   */
  async searchOrder(searchTerm: string): Promise<void> {
    const searchInput = this.locators.byPlaceholder('Search');
    await this.fill(searchInput, searchTerm);
    await this.press(searchInput, 'Enter');
  }

  /**
   * View order details
   */
  async viewOrderDetails(orderNumber: string): Promise<void> {
    await this.searchOrder(orderNumber);
    await this.click(this.locators.byText('View').first());
  }

  /**
   * Update order status
   */
  async updateOrderStatus(orderNumber: string, status: string): Promise<void> {
    await this.searchOrder(orderNumber);
    await this.click(this.locators.byText('Edit').first());
    await this.selectOption(this.locators.byName('status'), status);
    await this.click(this.locators.byRole('button', 'Save'));
  }

  /**
   * Get order count
   */
  async getOrderCount(): Promise<number> {
    const rows = this.page.locator('table tbody tr');
    return await this.getCount(rows);
  }

  /**
   * Verify order exists
   */
  async verifyOrderExists(orderNumber: string): Promise<boolean> {
    const orderRow = this.page.getByText(orderNumber);
    return await this.isVisible(orderRow, 5000);
  }

  /**
   * Find order by email
   */
  async findOrderByEmail(email: string): Promise<boolean> {
    await this.searchOrder(email);
    const orderRow = this.page.getByText(email);
    return await this.isVisible(orderRow, 5000);
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderNumber: string): Promise<string> {
    await this.searchOrder(orderNumber);
    const statusCell = this.page.locator('table tbody tr').first().locator('td').nth(3);
    return await this.getText(statusCell);
  }
}


