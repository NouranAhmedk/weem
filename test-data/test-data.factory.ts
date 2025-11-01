/**
 * Test Data Factory
 * Centralized factory for creating all types of test data
 * Provides a simple API for accessing generators, builders, and fixtures
 */

// Generators
import { UserGenerator } from './generators/user.generator';
import { ProductGenerator } from './generators/product.generator';
import { OrderGenerator } from './generators/order.generator';

// Builders
import { UserBuilder, UserProfileBuilder, AddressBuilder } from './builders/user.builder';
import { CartBuilder, CartItemBuilder, OrderBuilder, ShippingMethodBuilder } from './builders/order.builder';

// Fixtures
import { TEST_USERS, TEST_ADDRESSES, USER_PROFILES, INVALID_USERS, TEST_OTP_CODES } from './fixtures/users.fixture';
import { TEST_PRODUCTS, TEST_CATEGORIES, PRODUCT_FILTERS, SEARCH_QUERIES, PRODUCT_LISTS } from './fixtures/products.fixture';

// Types
import { UserData, UserProfile, Address, UserCredentials } from './types/user.types';
import { ProductData, Category, ProductFilter } from './types/product.types';
import { Cart, CartItem, Order, OrderStatus, PaymentMethod } from './types/order.types';

/**
 * Test Data Factory
 * One-stop shop for all test data needs
 */
export class TestDataFactory {
  // ==================== User Data ====================

  /**
   * Create a new user with random data
   */
  static createUser(overrides?: Partial<UserData>): UserData {
    return UserGenerator.generateUser(overrides);
  }

  /**
   * Create a unique user (guaranteed unique phone)
   */
  static createUniqueUser(overrides?: Partial<UserData>): UserData {
    return UserGenerator.generateTestUser('new');
  }

  /**
   * Get a user builder for fluent API
   */
  static user(): UserBuilder {
    return new UserBuilder();
  }

  /**
   * Get user profile builder
   */
  static userProfile(): UserProfileBuilder {
    return new UserProfileBuilder();
  }

  /**
   * Get address builder
   */
  static address(): AddressBuilder {
    return new AddressBuilder();
  }

  /**
   * Generate user credentials for auth
   */
  static createCredentials(overrides?: Partial<UserCredentials>): UserCredentials {
    return UserGenerator.generateCredentials(overrides);
  }

  /**
   * Get fixture user data
   */
  static getFixtureUser(type: keyof typeof TEST_USERS): UserData {
    const user = TEST_USERS[type];
    return typeof user === 'function' ? user() : { ...user };
  }

  /**
   * Get fixture address
   */
  static getFixtureAddress(city: keyof typeof TEST_ADDRESSES): Address {
    return { ...TEST_ADDRESSES[city] };
  }

  // ==================== Product Data ====================

  /**
   * Create a new product with random data
   */
  static createProduct(overrides?: Partial<ProductData>): ProductData {
    return ProductGenerator.generateProduct(overrides);
  }

  /**
   * Create multiple products
   */
  static createProducts(count: number, overrides?: Partial<ProductData>): ProductData[] {
    return ProductGenerator.generateProducts(count, overrides);
  }

  /**
   * Get fixture product
   */
  static getFixtureProduct(type: keyof typeof TEST_PRODUCTS): ProductData {
    return { ...TEST_PRODUCTS[type] };
  }

  /**
   * Get fixture category
   */
  static getFixtureCategory(type: keyof typeof TEST_CATEGORIES): Category {
    return { ...TEST_CATEGORIES[type] };
  }

  /**
   * Get search query
   */
  static getSearchQuery(type: 'valid' | 'noResults' | 'special' = 'valid'): string {
    const queries = SEARCH_QUERIES[type];
    return queries[Math.floor(Math.random() * queries.length)];
  }

  // ==================== Cart & Order Data ====================

  /**
   * Create an empty cart
   */
  static createEmptyCart(): Cart {
    return OrderGenerator.generateEmptyCart();
  }

  /**
   * Create a cart with random items
   */
  static createCart(itemCount: number = 2): Cart {
    return OrderGenerator.generateCart(itemCount);
  }

  /**
   * Create a cart with specific total
   */
  static createCartWithTotal(total: number, itemCount: number = 2): Cart {
    return OrderGenerator.generateCartWithTotal(total, itemCount);
  }

  /**
   * Get cart builder for fluent API
   */
  static cart(): CartBuilder {
    return new CartBuilder();
  }

  /**
   * Get cart item builder
   */
  static cartItem(): CartItemBuilder {
    return new CartItemBuilder();
  }

  /**
   * Create an order
   */
  static createOrder(cart?: Cart): Order {
    return OrderGenerator.generateOrder(cart);
  }

  /**
   * Create an order with specific status
   */
  static createOrderWithStatus(status: OrderStatus): Order {
    return OrderGenerator.generateOrderWithStatus(status);
  }

  /**
   * Get order builder for fluent API
   */
  static order(): OrderBuilder {
    return new OrderBuilder();
  }

  /**
   * Get shipping method builder
   */
  static shippingMethod(): ShippingMethodBuilder {
    return new ShippingMethodBuilder();
  }

  /**
   * Create a coupon
   */
  static createCoupon(code?: string, value?: number): any {
    return OrderGenerator.generateCoupon({ code, value });
  }

  // ==================== Bulk Data Creation ====================

  /**
   * Create complete test scenario data
   */
  static createTestScenario(scenario: 'new-user-checkout' | 'existing-user-reorder' | 'guest-checkout') {
    switch (scenario) {
      case 'new-user-checkout':
        return {
          user: this.createUniqueUser(),
          cart: this.createCart(2),
          address: this.address().build(),
          credentials: this.createCredentials(),
        };

      case 'existing-user-reorder':
        return {
          user: this.getFixtureUser('registeredUser'),
          cart: this.createCart(1),
          address: this.getFixtureAddress('riyadh'),
          order: this.createOrderWithStatus(OrderStatus.DELIVERED),
        };

      case 'guest-checkout':
        return {
          user: this.getFixtureUser('guestUser'),
          cart: this.createCart(1),
          address: this.address().build(),
        };

      default:
        throw new Error(`Unknown scenario: ${scenario}`);
    }
  }

  /**
   * Create bulk test data for performance testing
   */
  static createBulkData(counts: {
    users?: number;
    products?: number;
    orders?: number;
  }) {
    return {
      users: counts.users ? Array.from({ length: counts.users }, () => this.createUser()) : [],
      products: counts.products ? this.createProducts(counts.products) : [],
      orders: counts.orders ? Array.from({ length: counts.orders }, () => this.createOrder()) : [],
    };
  }

  // ==================== Data Cleanup ====================

  /**
   * Generate cleanup data
   * Returns identifiers of created data for cleanup
   */
  static getCleanupData() {
    const data = {
      userPhones: [] as string[],
      orderIds: [] as string[],
      productIds: [] as (string | number)[],
    };

    return {
      addUser: (phone: string) => data.userPhones.push(phone),
      addOrder: (orderId: string) => data.orderIds.push(orderId),
      addProduct: (productId: string | number) => data.productIds.push(productId),
      getData: () => ({ ...data }),
    };
  }
}

// Export singleton instance for convenience
export const TestData = TestDataFactory;

// Re-export types for convenience
export type {
  UserData,
  UserProfile,
  Address,
  UserCredentials,
  ProductData,
  Category,
  ProductFilter,
  Cart,
  CartItem,
  Order,
  OrderStatus,
  PaymentMethod,
};

// Re-export fixtures for direct access
export { TEST_USERS, TEST_ADDRESSES, USER_PROFILES, INVALID_USERS, TEST_OTP_CODES };
export { TEST_PRODUCTS, TEST_CATEGORIES, PRODUCT_FILTERS, SEARCH_QUERIES, PRODUCT_LISTS };
