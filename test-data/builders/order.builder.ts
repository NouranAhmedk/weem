/**
 * Order and Cart Data Builders
 * Builder pattern for creating order and cart data with fluent API
 */

import { Cart, CartItem, Order, OrderStatus, PaymentMethod, ShippingMethod } from '../types/order.types';
import { Address } from '../types/user.types';
import { OrderGenerator } from '../generators/order.generator';
import { UserGenerator } from '../generators/user.generator';

export class CartBuilder {
  private cart: Cart;

  constructor() {
    this.cart = OrderGenerator.generateEmptyCart();
  }

  /**
   * Add an item to the cart
   */
  withItem(item: CartItem): this {
    this.cart.items.push(item);
    this.recalculateTotals();
    return this;
  }

  /**
   * Add multiple items to the cart
   */
  withItems(items: CartItem[]): this {
    this.cart.items.push(...items);
    this.recalculateTotals();
    return this;
  }

  /**
   * Add random items to the cart
   */
  withRandomItems(count: number): this {
    const items = Array.from({ length: count }, () => OrderGenerator.generateCartItem());
    return this.withItems(items);
  }

  /**
   * Set cart subtotal explicitly
   */
  withSubtotal(subtotal: number): this {
    this.cart.subtotal = subtotal;
    return this;
  }

  /**
   * Set tax amount
   */
  withTax(tax: number): this {
    this.cart.tax = tax;
    return this;
  }

  /**
   * Set shipping cost
   */
  withShipping(shipping: number): this {
    this.cart.shipping = shipping;
    return this;
  }

  /**
   * Set discount amount
   */
  withDiscount(discount: number): this {
    this.cart.discount = discount;
    this.recalculateTotals();
    return this;
  }

  /**
   * Apply a coupon code
   */
  withCoupon(couponCode: string, discountAmount: number): this {
    this.cart.couponCode = couponCode;
    this.cart.discount = discountAmount;
    this.recalculateTotals();
    return this;
  }

  /**
   * Set currency
   */
  withCurrency(currency: string): this {
    this.cart.currency = currency;
    return this;
  }

  /**
   * Enable free shipping
   */
  withFreeShipping(): this {
    this.cart.shipping = 0;
    this.recalculateTotals();
    return this;
  }

  /**
   * Recalculate cart totals
   */
  private recalculateTotals(): void {
    this.cart.subtotal = this.cart.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

    if (!this.cart.tax) {
      this.cart.tax = this.cart.subtotal * 0.15; // 15% VAT
    }

    if (this.cart.shipping === undefined) {
      this.cart.shipping = OrderGenerator.calculateShipping(this.cart.subtotal);
    }

    this.cart.total = this.cart.subtotal + (this.cart.tax || 0) + (this.cart.shipping || 0) - (this.cart.discount || 0);

    // Round to 2 decimal places
    this.cart.subtotal = Number(this.cart.subtotal.toFixed(2));
    this.cart.tax = Number((this.cart.tax || 0).toFixed(2));
    this.cart.shipping = Number((this.cart.shipping || 0).toFixed(2));
    this.cart.total = Number(this.cart.total.toFixed(2));
  }

  /**
   * Build and return the cart
   */
  build(): Cart {
    return { ...this.cart };
  }

  /**
   * Reset builder to empty cart
   */
  reset(): this {
    this.cart = OrderGenerator.generateEmptyCart();
    return this;
  }
}

export class CartItemBuilder {
  private item: CartItem;

  constructor() {
    this.item = OrderGenerator.generateCartItem();
  }

  /**
   * Set product ID
   */
  withProductId(productId: string | number): this {
    this.item.productId = productId;
    return this;
  }

  /**
   * Set quantity
   */
  withQuantity(quantity: number): this {
    this.item.quantity = quantity;
    this.recalculateSubtotal();
    return this;
  }

  /**
   * Set price
   */
  withPrice(price: number): this {
    this.item.price = price;
    this.recalculateSubtotal();
    return this;
  }

  /**
   * Set size
   */
  withSize(size: string): this {
    this.item.size = size;
    return this;
  }

  /**
   * Set color
   */
  withColor(color: string): this {
    this.item.color = color;
    return this;
  }

  /**
   * Recalculate subtotal
   */
  private recalculateSubtotal(): void {
    this.item.subtotal = this.item.price * this.item.quantity;
  }

  /**
   * Build and return the cart item
   */
  build(): CartItem {
    return { ...this.item };
  }
}

export class OrderBuilder {
  private order: Order;

  constructor() {
    this.order = OrderGenerator.generateOrder();
  }

  /**
   * Set order ID
   */
  withOrderId(orderId: string): this {
    this.order.orderId = orderId;
    return this;
  }

  /**
   * Set user ID
   */
  withUserId(userId: string): this {
    this.order.userId = userId;
    return this;
  }

  /**
   * Set order items from cart
   */
  fromCart(cart: Cart): this {
    this.order.items = cart.items;
    this.order.subtotal = cart.subtotal;
    this.order.tax = cart.tax || 0;
    this.order.shipping = cart.shipping || 0;
    this.order.discount = cart.discount || 0;
    this.order.total = cart.total;
    this.order.currency = cart.currency || 'SAR';
    return this;
  }

  /**
   * Set order status
   */
  withStatus(status: OrderStatus): this {
    this.order.status = status;
    return this;
  }

  /**
   * Set payment method
   */
  withPaymentMethod(method: PaymentMethod): this {
    this.order.paymentMethod = method;
    return this;
  }

  /**
   * Set shipping address
   */
  withShippingAddress(address: Address): this {
    this.order.shippingAddress = address;
    return this;
  }

  /**
   * Set billing address
   */
  withBillingAddress(address: Address): this {
    this.order.billingAddress = address;
    return this;
  }

  /**
   * Use same address for billing and shipping
   */
  withSameAddress(): this {
    this.order.billingAddress = this.order.shippingAddress;
    return this;
  }

  /**
   * Set tracking number
   */
  withTrackingNumber(trackingNumber: string): this {
    this.order.trackingNumber = trackingNumber;
    return this;
  }

  /**
   * Set as shipped order
   */
  asShipped(): this {
    this.order.status = OrderStatus.SHIPPED;
    this.order.trackingNumber = OrderGenerator.generateTrackingNumber();
    return this;
  }

  /**
   * Set as delivered order
   */
  asDelivered(): this {
    this.order.status = OrderStatus.DELIVERED;
    this.order.trackingNumber = OrderGenerator.generateTrackingNumber();
    return this;
  }

  /**
   * Set as cancelled order
   */
  asCancelled(): this {
    this.order.status = OrderStatus.CANCELLED;
    return this;
  }

  /**
   * Set created date
   */
  withCreatedDate(date: Date): this {
    this.order.createdAt = date;
    return this;
  }

  /**
   * Build and return the order
   */
  build(): Order {
    return { ...this.order };
  }

  /**
   * Reset builder to new order
   */
  reset(): this {
    this.order = OrderGenerator.generateOrder();
    return this;
  }
}

export class ShippingMethodBuilder {
  private method: ShippingMethod;

  constructor() {
    this.method = OrderGenerator.generateShippingMethod();
  }

  /**
   * Set method ID
   */
  withId(id: string): this {
    this.method.id = id;
    return this;
  }

  /**
   * Set method name
   */
  withName(name: string): this {
    this.method.name = name;
    return this;
  }

  /**
   * Set description
   */
  withDescription(description: string): this {
    this.method.description = description;
    return this;
  }

  /**
   * Set price
   */
  withPrice(price: number): this {
    this.method.price = price;
    return this;
  }

  /**
   * Set estimated delivery days
   */
  withEstimatedDays(days: number): this {
    this.method.estimatedDays = days;
    return this;
  }

  /**
   * Set as free shipping
   */
  asFreeShipping(): this {
    this.method.price = 0;
    this.method.name = 'Free Shipping';
    return this;
  }

  /**
   * Build and return the shipping method
   */
  build(): ShippingMethod {
    return { ...this.method };
  }
}
