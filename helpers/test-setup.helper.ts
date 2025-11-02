import { Page } from '@playwright/test';
import { WeemApi } from '../api/weem-api';
import { generateRandomPhoneNumber } from '../utils/phone-number.utils';
import { TEST_OTP } from '../utils/app-config';

/**
 * Test Setup Helper
 * Provides integration between API, UI, and Dashboard
 * Use this to speed up test setup by using API instead of UI
 */
export class TestSetupHelper {
  /**
   * Create and authenticate user via API (fast setup for UI tests)
   * Returns the authenticated user data and sets cookies on the page
   */
  static async createAuthenticatedUser(page: Page): Promise<{ phone: string; token: string }> {
    const api = new WeemApi();
    await api.init();

    const phoneNumber = generateRandomPhoneNumber();

    // Register user via API
    const registerResponse = await api.registerUser(phoneNumber);

    if (registerResponse.status !== 200) {
      throw new Error(`Failed to register user via API: ${registerResponse.status}`);
    }

    // Verify OTP via API
    const verifyResponse = await api.verifyOTP(phoneNumber, TEST_OTP);

    if (verifyResponse.status !== 200) {
      throw new Error(`Failed to verify OTP via API: ${verifyResponse.status}`);
    }

    const token = verifyResponse.data?.token || '';

    // Set authentication cookies on the page
    await api.loginAndSetCookies(page, phoneNumber, TEST_OTP);

    await api.dispose();

    return { phone: phoneNumber, token };
  }

  /**
   * Create product via API (for admin/UI testing)
   */
  static async createTestProduct(productData?: any): Promise<any> {
    const api = new WeemApi();
    await api.init();

    const product = {
      name: 'Test Product',
      price: 99.99,
      stock: 50,
      category: 'Electronics',
      ...productData,
    };

    const response = await api.createProduct(product);
    await api.dispose();

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Failed to create product via API: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Create order via API (for dashboard testing)
   */
  static async createTestOrder(orderData?: any): Promise<any> {
    const api = new WeemApi();
    await api.init();

    const order = {
      items: [],
      total: 0,
      ...orderData,
    };

    const response = await api.createOrder(order);
    await api.dispose();

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Failed to create order via API: ${response.status}`);
    }

    return response.data;
  }

  /**
   * Skip UI login by setting auth cookies directly
   * Use when you already have an authenticated user token
   */
  static async setAuthCookies(page: Page, token: string): Promise<void> {
    await page.context().addCookies([
      {
        name: 'auth_token',
        value: token,
        domain: new URL(page.url() || 'https://dev.weem.sa').hostname,
        path: '/',
      },
    ]);
  }

  /**
   * Login to admin dashboard and return cookies
   */
  static async loginToAdmin(page: Page, username: string, password: string): Promise<void> {
    // This will be implemented after admin login page is created
    // For now, navigate and login via UI
    await page.goto('https://dev.weem.eramapps.com/admin/login/');
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
  }
}


