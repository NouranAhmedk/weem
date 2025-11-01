/**
 * Order and cart-related test data types
 */

import { Address } from './user.types';
import { ProductData } from './product.types';

export interface CartItem {
  productId: string | number;
  product?: ProductData;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  subtotal?: number;
}

export interface Cart {
  id?: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  total: number;
  currency?: string;
  couponCode?: string;
}

export interface Order {
  id?: string;
  orderId?: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  shippingAddress: Address;
  billingAddress?: Address;
  createdAt?: Date;
  updatedAt?: Date;
  trackingNumber?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  CASH_ON_DELIVERY = 'cash_on_delivery',
  PAYPAL = 'paypal',
  APPLE_PAY = 'apple_pay',
  MADA = 'mada', // Saudi payment system
}

export interface PaymentInfo {
  method: PaymentMethod;
  cardNumber?: string;
  cardHolder?: string;
  expiryDate?: string;
  cvv?: string;
  amount: number;
  currency: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  expiryDate?: Date;
  isActive?: boolean;
}

export interface CheckoutData {
  cart: Cart;
  shippingAddress: Address;
  billingAddress?: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  paymentInfo?: PaymentInfo;
  couponCode?: string;
}
