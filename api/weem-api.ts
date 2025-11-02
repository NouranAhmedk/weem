import { ApiClient } from './api-client';
import { Page } from '@playwright/test';

/**
 * Weem API Client
 * Provides methods for all Weem API endpoints
 */
export class WeemApi extends ApiClient {
  constructor() {
    super();
  }

  // ==================== User APIs ====================

  /**
   * Register a new user
   */
  async registerUser(phoneNumber: string): Promise<any> {
    return await this.post('/auth/register', {
      phone: phoneNumber,
    });
  }

  /**
   * Verify OTP
   */
  async verifyOTP(phoneNumber: string, otp: string): Promise<any> {
    return await this.post('/auth/verify-otp', {
      phone: phoneNumber,
      otp,
    });
  }

  /**
   * Login user
   */
  async loginUser(phoneNumber: string, otp: string): Promise<any> {
    return await this.post('/auth/login', {
      phone: phoneNumber,
      otp,
    });
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<any> {
    return await this.get('/user/profile');
  }

  // ==================== Product APIs ====================

  /**
   * Get all products
   */
  async getProducts(params?: { category?: string; limit?: number; offset?: number }): Promise<any> {
    return await this.get('/products', params);
  }

  /**
   * Get product by ID
   */
  async getProductById(productId: string | number): Promise<any> {
    return await this.get(`/products/${productId}`);
  }

  /**
   * Search products
   */
  async searchProducts(query: string): Promise<any> {
    return await this.get('/products/search', { q: query });
  }

  /**
   * Create product (admin)
   */
  async createProduct(productData: any): Promise<any> {
    return await this.post('/admin/products', productData);
  }

  /**
   * Update product (admin)
   */
  async updateProduct(productId: string | number, productData: any): Promise<any> {
    return await this.put(`/admin/products/${productId}`, productData);
  }

  /**
   * Delete product (admin)
   */
  async deleteProduct(productId: string | number): Promise<any> {
    return await this.delete(`/admin/products/${productId}`);
  }

  // ==================== Cart APIs ====================

  /**
   * Get cart
   */
  async getCart(): Promise<any> {
    return await this.get('/cart');
  }

  /**
   * Add to cart
   */
  async addToCart(productId: string | number, quantity: number = 1): Promise<any> {
    return await this.post('/cart/add', {
      productId,
      quantity,
    });
  }

  /**
   * Remove from cart
   */
  async removeFromCart(cartItemId: string | number): Promise<any> {
    return await this.delete(`/cart/items/${cartItemId}`);
  }

  /**
   * Create order
   */
  async createOrder(orderData: any): Promise<any> {
    return await this.post('/orders', orderData);
  }

  /**
   * Get orders
   */
  async getOrders(): Promise<any> {
    return await this.get('/orders');
  }

  // ==================== Newsletter APIs ====================

  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(email: string): Promise<any> {
    return await this.post('/newsletter/subscribe', {
      email,
    });
  }

  // ==================== Helper Methods ====================

  /**
   * Login and set cookies on page (UI integration)
   */
  async loginAndSetCookies(page: Page, phoneNumber: string, otp: string): Promise<void> {
    const response = await this.loginUser(phoneNumber, otp);
    
    if (response.status === 200 && response.data?.token) {
      this.setAuthToken(response.data.token);
      
      // Set authentication cookie on the page
      await page.context().addCookies([
        {
          name: 'auth_token',
          value: response.data.token,
          domain: new URL(page.url()).hostname,
          path: '/',
        },
      ]);
    }
  }
}


