/**
 * Product-related test data types
 */

export interface ProductData {
  id?: string | number;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category?: string;
  categoryId?: string | number;
  brand?: string;
  sku?: string;
  stock?: number;
  images?: string[];
  variants?: ProductVariant[];
  rating?: number;
  reviews?: number;
}

export interface ProductVariant {
  id?: string;
  size?: string;
  color?: string;
  sku?: string;
  price?: number;
  stock?: number;
}

export interface ProductFilter {
  category?: string | number;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  size?: string;
  color?: string;
  inStock?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'name' | 'rating' | 'newest';
}

export interface Category {
  id: string | number;
  name: string;
  slug?: string;
  parentId?: string | number;
  description?: string;
  imageUrl?: string;
}

export interface ProductSearchResult {
  products: ProductData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface ProductReview {
  id?: string;
  productId: string | number;
  userId: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

export enum ProductAvailability {
  IN_STOCK = 'in_stock',
  OUT_OF_STOCK = 'out_of_stock',
  PREORDER = 'preorder',
  DISCONTINUED = 'discontinued',
}
