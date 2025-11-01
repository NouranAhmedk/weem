/**
 * Data Validation Utilities
 * Validates test data to ensure it meets requirements
 */

import { UserData, Address } from '../types/user.types';
import { ProductData } from '../types/product.types';
import { Cart, Order } from '../types/order.types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Data Validator
 * Validates different types of test data
 */
export class DataValidator {
  /**
   * Validate user data
   */
  static validateUser(user: UserData): ValidationResult {
    const errors: string[] = [];

    // Validate phone number
    if (!user.phone) {
      errors.push('Phone number is required');
    } else if (!/^5\d{8}$/.test(user.phone)) {
      errors.push('Phone number must be 9 digits starting with 5');
    }

    // Validate email if provided
    if (user.email && !this.isValidEmail(user.email)) {
      errors.push('Invalid email format');
    }

    // Validate names if provided
    if (user.firstName && user.firstName.length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (user.lastName && user.lastName.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate address data
   */
  static validateAddress(address: Address): ValidationResult {
    const errors: string[] = [];

    if (!address.street || address.street.trim().length === 0) {
      errors.push('Street address is required');
    }

    if (!address.city || address.city.trim().length === 0) {
      errors.push('City is required');
    }

    if (!address.zipCode || !/^\d{5}$/.test(address.zipCode)) {
      errors.push('Zip code must be 5 digits');
    }

    if (!address.country || address.country.trim().length === 0) {
      errors.push('Country is required');
    }

    if (!['home', 'work', 'other'].includes(address.type)) {
      errors.push('Address type must be home, work, or other');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate product data
   */
  static validateProduct(product: ProductData): ValidationResult {
    const errors: string[] = [];

    if (!product.name || product.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (product.price === undefined || product.price < 0) {
      errors.push('Product price must be a non-negative number');
    }

    if (product.stock !== undefined && product.stock < 0) {
      errors.push('Product stock cannot be negative');
    }

    if (product.rating !== undefined && (product.rating < 0 || product.rating > 5)) {
      errors.push('Product rating must be between 0 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate cart data
   */
  static validateCart(cart: Cart): ValidationResult {
    const errors: string[] = [];

    if (!cart.items || cart.items.length === 0) {
      errors.push('Cart must contain at least one item');
    }

    if (cart.subtotal < 0) {
      errors.push('Cart subtotal cannot be negative');
    }

    if (cart.total < 0) {
      errors.push('Cart total cannot be negative');
    }

    // Validate each cart item
    cart.items?.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Cart item ${index + 1}: Product ID is required`);
      }

      if (item.quantity <= 0) {
        errors.push(`Cart item ${index + 1}: Quantity must be positive`);
      }

      if (item.price < 0) {
        errors.push(`Cart item ${index + 1}: Price cannot be negative`);
      }
    });

    // Validate total calculation
    const calculatedSubtotal = cart.items?.reduce((sum, item) => sum + (item.subtotal || 0), 0) || 0;
    if (Math.abs(calculatedSubtotal - cart.subtotal) > 0.01) {
      errors.push('Cart subtotal does not match sum of item subtotals');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate order data
   */
  static validateOrder(order: Order): ValidationResult {
    const errors: string[] = [];

    if (!order.orderId) {
      errors.push('Order ID is required');
    }

    if (!order.userId) {
      errors.push('User ID is required');
    }

    if (!order.items || order.items.length === 0) {
      errors.push('Order must contain at least one item');
    }

    if (!order.shippingAddress) {
      errors.push('Shipping address is required');
    } else {
      const addressValidation = this.validateAddress(order.shippingAddress);
      if (!addressValidation.isValid) {
        errors.push(...addressValidation.errors.map(e => `Shipping address: ${e}`));
      }
    }

    if (order.total <= 0) {
      errors.push('Order total must be positive');
    }

    if (!order.paymentMethod) {
      errors.push('Payment method is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Saudi phone number
   */
  static isValidSaudiPhone(phone: string): boolean {
    return /^5\d{8}$/.test(phone);
  }

  /**
   * Validate price (must be positive with max 2 decimal places)
   */
  static isValidPrice(price: number): boolean {
    return price >= 0 && /^\d+(\.\d{1,2})?$/.test(price.toString());
  }

  /**
   * Validate SKU format
   */
  static isValidSKU(sku: string): boolean {
    return /^[A-Z]{3}-\d{4}$/.test(sku);
  }

  /**
   * Validate zip code (5 digits)
   */
  static isValidZipCode(zipCode: string): boolean {
    return /^\d{5}$/.test(zipCode);
  }

  /**
   * Validate OTP code (5 digits)
   */
  static isValidOTP(otp: string): boolean {
    return /^\d{5}$/.test(otp);
  }

  /**
   * Validate multiple data items at once
   */
  static validateBatch<T>(
    items: T[],
    validator: (item: T) => ValidationResult
  ): ValidationResult {
    const allErrors: string[] = [];

    items.forEach((item, index) => {
      const result = validator(item);
      if (!result.isValid) {
        allErrors.push(`Item ${index + 1}:`);
        allErrors.push(...result.errors.map(e => `  - ${e}`));
      }
    });

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
    };
  }

  /**
   * Assert validation result (throws error if invalid)
   */
  static assertValid(result: ValidationResult, context: string = 'Data'): void {
    if (!result.isValid) {
      throw new Error(`${context} validation failed:\n${result.errors.join('\n')}`);
    }
  }

  /**
   * Log validation errors
   */
  static logErrors(result: ValidationResult, context: string = 'Data'): void {
    if (!result.isValid) {
      console.error(`\n${context} validation errors:`);
      result.errors.forEach(error => console.error(`  - ${error}`));
    }
  }
}

/**
 * Validation decorators/helpers
 */
export class ValidationHelpers {
  /**
   * Ensure user data is valid before using
   */
  static ensureValidUser(user: UserData): UserData {
    const result = DataValidator.validateUser(user);
    DataValidator.assertValid(result, 'User data');
    return user;
  }

  /**
   * Ensure address is valid before using
   */
  static ensureValidAddress(address: Address): Address {
    const result = DataValidator.validateAddress(address);
    DataValidator.assertValid(result, 'Address');
    return address;
  }

  /**
   * Ensure cart is valid before using
   */
  static ensureValidCart(cart: Cart): Cart {
    const result = DataValidator.validateCart(cart);
    DataValidator.assertValid(result, 'Cart');
    return cart;
  }

  /**
   * Ensure order is valid before using
   */
  static ensureValidOrder(order: Order): Order {
    const result = DataValidator.validateOrder(order);
    DataValidator.assertValid(result, 'Order');
    return order;
  }
}
