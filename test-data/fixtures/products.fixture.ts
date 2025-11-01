/**
 * Product Fixtures
 * Pre-defined product test data for consistent testing
 */

import { ProductData, Category, ProductFilter } from '../types/product.types';

/**
 * Test products for different scenarios
 */
export const TEST_PRODUCTS = {
  /**
   * Standard product in stock
   */
  standardProduct: {
    id: 1145,
    name: 'Premium Smartphone',
    description: 'High-quality smartphone with advanced features',
    price: 2999.99,
    currency: 'SAR',
    category: 'Electronics',
    categoryId: 13,
    brand: 'Samsung',
    sku: 'ELC-1145',
    stock: 50,
    rating: 4.5,
    reviews: 150,
  } as ProductData,

  /**
   * Out of stock product
   */
  outOfStockProduct: {
    id: 2234,
    name: 'Designer Jacket',
    description: 'Limited edition designer jacket',
    price: 1499.99,
    currency: 'SAR',
    category: 'Fashion',
    categoryId: 14,
    brand: 'Nike',
    sku: 'FSH-2234',
    stock: 0,
    rating: 4.8,
    reviews: 45,
  } as ProductData,

  /**
   * Low stock product
   */
  lowStockProduct: {
    id: 3345,
    name: 'Wireless Headphones',
    description: 'Premium noise-cancelling headphones',
    price: 899.99,
    currency: 'SAR',
    category: 'Electronics',
    categoryId: 13,
    brand: 'Sony',
    sku: 'ELC-3345',
    stock: 3,
    rating: 4.7,
    reviews: 230,
  } as ProductData,

  /**
   * High-rated product
   */
  bestSellerProduct: {
    id: 4456,
    name: 'Smart Watch Pro',
    description: 'Advanced fitness and health tracking smartwatch',
    price: 1599.99,
    currency: 'SAR',
    category: 'Electronics',
    categoryId: 13,
    brand: 'Apple',
    sku: 'ELC-4456',
    stock: 100,
    rating: 4.9,
    reviews: 500,
  } as ProductData,

  /**
   * Budget product
   */
  budgetProduct: {
    id: 5567,
    name: 'Basic T-Shirt',
    description: 'Comfortable cotton t-shirt',
    price: 49.99,
    currency: 'SAR',
    category: 'Fashion',
    categoryId: 14,
    brand: 'Generic',
    sku: 'FSH-5567',
    stock: 200,
    rating: 4.0,
    reviews: 80,
  } as ProductData,

  /**
   * Premium product
   */
  premiumProduct: {
    id: 6678,
    name: 'Professional Camera Kit',
    description: 'Complete professional photography kit',
    price: 8999.99,
    currency: 'SAR',
    category: 'Electronics',
    categoryId: 13,
    brand: 'Canon',
    sku: 'ELC-6678',
    stock: 15,
    rating: 5.0,
    reviews: 75,
  } as ProductData,
};

/**
 * Product categories
 */
export const TEST_CATEGORIES = {
  electronics: {
    id: 13,
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and accessories',
  } as Category,

  fashion: {
    id: 14,
    name: 'Fashion',
    slug: 'fashion',
    description: 'Clothing and fashion accessories',
  } as Category,

  homeKitchen: {
    id: 15,
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    description: 'Home appliances and kitchen essentials',
  } as Category,

  sports: {
    id: 16,
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment and outdoor gear',
  } as Category,
};

/**
 * Common product filters
 */
export const PRODUCT_FILTERS = {
  electronics: {
    category: 13,
    inStock: true,
    sortBy: 'price_asc',
  } as ProductFilter,

  priceRange: {
    minPrice: 100,
    maxPrice: 2000,
    inStock: true,
  } as ProductFilter,

  highRated: {
    inStock: true,
    sortBy: 'rating',
  } as ProductFilter,

  newArrivals: {
    sortBy: 'newest',
  } as ProductFilter,
};

/**
 * Search queries for testing
 */
export const SEARCH_QUERIES = {
  valid: [
    'phone',
    'laptop',
    'headphones',
    'watch',
    'camera',
    'shirt',
    'shoes',
  ],

  noResults: [
    'xyzabcnonexistent',
    '!!!@@@###',
  ],

  special: [
    'phone 128gb',
    'red shirt',
    'wireless headphones',
  ],
};

/**
 * Product lists for bulk testing
 */
export const PRODUCT_LISTS = {
  inStock: [
    TEST_PRODUCTS.standardProduct,
    TEST_PRODUCTS.lowStockProduct,
    TEST_PRODUCTS.bestSellerProduct,
    TEST_PRODUCTS.budgetProduct,
    TEST_PRODUCTS.premiumProduct,
  ],

  outOfStock: [TEST_PRODUCTS.outOfStockProduct],

  electronics: [
    TEST_PRODUCTS.standardProduct,
    TEST_PRODUCTS.lowStockProduct,
    TEST_PRODUCTS.bestSellerProduct,
    TEST_PRODUCTS.premiumProduct,
  ],

  fashion: [TEST_PRODUCTS.outOfStockProduct, TEST_PRODUCTS.budgetProduct],
};
