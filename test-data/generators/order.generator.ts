/**
 * Order and Cart Data Generator
 * Generates random order and cart data for testing
 */

import { Cart, CartItem, Order, OrderStatus, PaymentMethod, ShippingMethod, Coupon } from '../types/order.types';
import { ProductGenerator } from './product.generator';
import { UserGenerator } from './user.generator';

export class OrderGenerator {
  /**
   * Generate random cart item
   */
  static generateCartItem(overrides?: Partial<CartItem>): CartItem {
    const product = ProductGenerator.generateProduct();
    const quantity = Math.floor(Math.random() * 5) + 1;
    const price = product.price;

    return {
      productId: product.id!,
      product: product,
      quantity: quantity,
      price: price,
      subtotal: price * quantity,
      ...overrides,
    };
  }

  /**
   * Generate random cart
   */
  static generateCart(itemCount: number = 2, overrides?: Partial<Cart>): Cart {
    const items = Array.from({ length: itemCount }, () => this.generateCartItem());
    const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const tax = subtotal * 0.15; // 15% VAT in Saudi Arabia
    const shipping = this.calculateShipping(subtotal);

    return {
      items: items,
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      discount: 0,
      total: Number((subtotal + tax + shipping).toFixed(2)),
      currency: 'SAR',
      ...overrides,
    };
  }

  /**
   * Calculate shipping cost based on subtotal
   */
  static calculateShipping(subtotal: number): number {
    if (subtotal >= 200) {
      return 0; // Free shipping over 200 SAR
    }
    return 25; // Standard shipping 25 SAR
  }

  /**
   * Generate order from cart
   */
  static generateOrder(cart?: Cart, overrides?: Partial<Order>): Order {
    const orderCart = cart || this.generateCart();
    const shippingAddress = UserGenerator.generateAddress();

    return {
      orderId: this.generateOrderId(),
      userId: Math.random().toString(36).substring(7),
      items: orderCart.items,
      subtotal: orderCart.subtotal,
      tax: orderCart.tax || 0,
      shipping: orderCart.shipping || 0,
      discount: orderCart.discount || 0,
      total: orderCart.total,
      currency: orderCart.currency || 'SAR',
      status: OrderStatus.PENDING,
      paymentMethod: PaymentMethod.CREDIT_CARD,
      shippingAddress: shippingAddress,
      createdAt: new Date(),
      ...overrides,
    };
  }

  /**
   * Generate order ID
   */
  static generateOrderId(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp.slice(-8)}${random}`;
  }

  /**
   * Generate shipping method
   */
  static generateShippingMethod(overrides?: Partial<ShippingMethod>): ShippingMethod {
    const methods = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Delivery in 3-5 business days',
        price: 25,
        estimatedDays: 4,
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: 'Delivery in 1-2 business days',
        price: 50,
        estimatedDays: 1,
      },
      {
        id: 'same-day',
        name: 'Same Day Delivery',
        description: 'Delivery within 24 hours',
        price: 75,
        estimatedDays: 0,
      },
    ];

    const method = methods[Math.floor(Math.random() * methods.length)];

    return {
      ...method,
      ...overrides,
    };
  }

  /**
   * Generate coupon
   */
  static generateCoupon(overrides?: Partial<Coupon>): Coupon {
    const codes = ['WELCOME10', 'SAVE20', 'FIRST50', 'SUMMER15', 'FLASH25'];

    return {
      code: codes[Math.floor(Math.random() * codes.length)],
      type: Math.random() > 0.5 ? 'percentage' : 'fixed',
      value: Math.floor(Math.random() * 50) + 10,
      minOrderAmount: 100,
      isActive: true,
      ...overrides,
    };
  }

  /**
   * Generate cart with coupon applied
   */
  static generateCartWithCoupon(itemCount: number = 2): Cart {
    const cart = this.generateCart(itemCount);
    const coupon = this.generateCoupon();

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cart.subtotal * coupon.value) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.value;
    }

    cart.couponCode = coupon.code;
    cart.discount = Number(discount.toFixed(2));
    cart.total = Number((cart.subtotal + (cart.tax || 0) + (cart.shipping || 0) - discount).toFixed(2));

    return cart;
  }

  /**
   * Generate empty cart
   */
  static generateEmptyCart(): Cart {
    return {
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'SAR',
    };
  }

  /**
   * Generate order with specific status
   */
  static generateOrderWithStatus(status: OrderStatus): Order {
    const order = this.generateOrder();
    order.status = status;

    // Set tracking number for shipped orders
    if (status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED) {
      order.trackingNumber = this.generateTrackingNumber();
    }

    return order;
  }

  /**
   * Generate tracking number
   */
  static generateTrackingNumber(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = Array.from({ length: 2 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join('');
    const numbers = Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
    return `${prefix}${numbers}`;
  }

  /**
   * Generate multiple orders
   */
  static generateOrders(count: number, overrides?: Partial<Order>): Order[] {
    return Array.from({ length: count }, () => this.generateOrder(undefined, overrides));
  }

  /**
   * Generate cart with specific total amount
   */
  static generateCartWithTotal(targetTotal: number, itemCount: number = 2): Cart {
    const cart = this.generateCart(itemCount);
    const pricePerItem = targetTotal / itemCount / 1.15; // Account for 15% VAT

    cart.items = cart.items.map(item => ({
      ...item,
      price: Number(pricePerItem.toFixed(2)),
      subtotal: Number((pricePerItem * item.quantity).toFixed(2)),
    }));

    const subtotal = cart.items.reduce((sum, item) => sum + item.subtotal!, 0);
    const tax = subtotal * 0.15;
    const shipping = this.calculateShipping(subtotal);

    cart.subtotal = Number(subtotal.toFixed(2));
    cart.tax = Number(tax.toFixed(2));
    cart.shipping = Number(shipping.toFixed(2));
    cart.total = Number((subtotal + tax + shipping).toFixed(2));

    return cart;
  }
}
