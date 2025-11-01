/**
 * Product Data Generator
 * Generates random product data for testing
 */

import { ProductData, ProductVariant, Category, ProductFilter } from '../types/product.types';

export class ProductGenerator {
  /**
   * Generate random product
   */
  static generateProduct(overrides?: Partial<ProductData>): ProductData {
    const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports', 'Beauty', 'Books'];
    const brands = ['Samsung', 'Apple', 'Nike', 'Adidas', 'Sony', 'LG', 'Generic'];

    return {
      id: Math.floor(Math.random() * 10000) + 1,
      name: this.generateProductName(),
      description: this.generateDescription(),
      price: this.generatePrice(),
      currency: 'SAR',
      category: categories[Math.floor(Math.random() * categories.length)],
      brand: brands[Math.floor(Math.random() * brands.length)],
      sku: this.generateSKU(),
      stock: Math.floor(Math.random() * 100) + 1,
      rating: Number((Math.random() * 5).toFixed(1)),
      reviews: Math.floor(Math.random() * 500),
      ...overrides,
    };
  }

  /**
   * Generate random product name
   */
  static generateProductName(): string {
    const adjectives = ['Premium', 'Luxury', 'Classic', 'Modern', 'Essential', 'Professional'];
    const products = [
      'Smartphone', 'Laptop', 'Headphones', 'Watch', 'Camera',
      'Shirt', 'Shoes', 'Jacket', 'Bag', 'Sunglasses',
      'Blender', 'Coffee Maker', 'Vacuum', 'Air Fryer',
      'Football', 'Yoga Mat', 'Dumbbells', 'Tennis Racket'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const product = products[Math.floor(Math.random() * products.length)];

    return `${adjective} ${product}`;
  }

  /**
   * Generate product description
   */
  static generateDescription(): string {
    const descriptions = [
      'High-quality product with excellent features and durability.',
      'Perfect for everyday use with modern design and functionality.',
      'Premium quality with advanced features for professional use.',
      'Comfortable and stylish, perfect for any occasion.',
      'Innovative design with cutting-edge technology.',
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  /**
   * Generate random price (SAR)
   */
  static generatePrice(min: number = 10, max: number = 5000): number {
    return Number((Math.random() * (max - min) + min).toFixed(2));
  }

  /**
   * Generate SKU
   */
  static generateSKU(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = Array.from({ length: 3 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join('');
    const number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${number}`;
  }

  /**
   * Generate product variant
   */
  static generateVariant(overrides?: Partial<ProductVariant>): ProductVariant {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Gray'];

    return {
      id: Math.random().toString(36).substring(7),
      size: sizes[Math.floor(Math.random() * sizes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      sku: this.generateSKU(),
      price: this.generatePrice(),
      stock: Math.floor(Math.random() * 50) + 1,
      ...overrides,
    };
  }

  /**
   * Generate multiple products
   */
  static generateProducts(count: number, overrides?: Partial<ProductData>): ProductData[] {
    return Array.from({ length: count }, () => this.generateProduct(overrides));
  }

  /**
   * Generate category
   */
  static generateCategory(overrides?: Partial<Category>): Category {
    const categories = [
      { id: 13, name: 'Electronics' },
      { id: 14, name: 'Fashion' },
      { id: 15, name: 'Home & Kitchen' },
      { id: 16, name: 'Sports & Outdoors' },
      { id: 17, name: 'Beauty & Personal Care' },
      { id: 18, name: 'Books & Media' },
    ];

    const category = categories[Math.floor(Math.random() * categories.length)];

    return {
      id: category.id,
      name: category.name,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      description: `Shop the best ${category.name.toLowerCase()} products`,
      ...overrides,
    };
  }

  /**
   * Generate product filter
   */
  static generateFilter(overrides?: Partial<ProductFilter>): ProductFilter {
    return {
      minPrice: 0,
      maxPrice: 5000,
      inStock: true,
      sortBy: 'price_asc',
      ...overrides,
    };
  }

  /**
   * Generate product with specific characteristics
   */
  static generateTestProduct(scenario: 'in-stock' | 'out-of-stock' | 'on-sale' = 'in-stock'): ProductData {
    const baseProduct = this.generateProduct();

    switch (scenario) {
      case 'in-stock':
        return {
          ...baseProduct,
          stock: Math.floor(Math.random() * 50) + 10,
        };
      case 'out-of-stock':
        return {
          ...baseProduct,
          stock: 0,
        };
      case 'on-sale':
        return {
          ...baseProduct,
          price: this.generatePrice(50, 200),
        };
      default:
        return baseProduct;
    }
  }

  /**
   * Generate search query
   */
  static generateSearchQuery(): string {
    const queries = [
      'phone', 'laptop', 'headphones', 'watch', 'camera',
      'shirt', 'shoes', 'jacket', 'bag', 'sunglasses',
      'coffee', 'blender', 'vacuum', 'air fryer',
      'football', 'yoga mat', 'dumbbells', 'racket'
    ];
    return queries[Math.floor(Math.random() * queries.length)];
  }

  /**
   * Generate product with variants
   */
  static generateProductWithVariants(variantCount: number = 3): ProductData {
    const product = this.generateProduct();
    product.variants = Array.from({ length: variantCount }, () =>
      this.generateVariant()
    );
    return product;
  }
}
