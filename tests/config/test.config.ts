/**
 * Test Configuration
 * Centralized configuration for test settings, selectors, and constants
 */

export const TestConfig = {
  /**
   * Retry settings for various operations
   */
  retry: {
    registration: {
      maxAttempts: 3,
      delay: 1000
    },
    productLoad: {
      maxAttempts: 5,
      delay: 2000
    },
    categorySelection: {
      maxAttempts: 5,
      delay: 1000
    },
    favouriteButton: {
      maxAttempts: 3,
      delay: 2000
    }
  },

  /**
   * Timeout settings (milliseconds)
   */
  timeouts: {
    short: 1000,
    medium: 2000,
    long: 3000,
    element: 10000,
    navigation: 60000
  },

  /**
   * Category preferences
   */
  categories: {
    preferred: ['All', 'كل', 'Fruits', 'Vegetables', 'Beverages', 'المشروبات'],
    maxSearchAttempts: 5
  },

  /**
   * Test promo codes
   */
  promoCodes: {
    valid: ['WEEM10', 'TEST10', 'DISCOUNT10'],
    invalid: ['INVALID', 'EXPIRED123', 'BADCODE']
  },

  /**
   * Common selectors used across tests
   */
  selectors: {
    // Cart & Checkout
    addToCart: '[data-eram-test-id="add-to-cart-button"]',
    cartIcon: '[data-eram-test-id="cart-icon"]',
    checkout: [
      '[data-eram-test-id*="checkout"]',
      'button:has-text("Checkout")',
      'button:has-text("Proceed")',
      'a:has-text("Checkout")'
    ],

    // Registration & Auth
    otpInput: '[data-eram-test-id="otp-input-0"]',
    registerButton: '[data-eram-test-id="register-button"]',

    // Favourites
    favouritesLink: '[data-eram-test-id="favourites-link"]',
    favouriteButton: [
      '[data-eram-test-id*="favourite"]',
      '[data-eram-test-id*="favorite"]',
      '[data-eram-test-id*="wishlist"]',
      'button:has(svg[class*="heart"])',
      'button[aria-label*="favourite" i]',
      'button[aria-label*="favorite" i]'
    ],

    // Products
    productCard: [
      '[data-eram-test-id*="product-card"]',
      '[data-eram-test-id*="product-item"]',
      '.product-card',
      'article'
    ],
    productName: '[data-eram-test-id^="product-name-"]',

    // Navigation
    category: '[data-eram-test-id^="category-"]',
    subcategory: '[data-eram-test-id^="subcategory-"]',

    // Search
    searchInput: [
      '[data-eram-test-id*="search"]',
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[placeholder*="بحث"]'
    ]
  },

  /**
   * Price patterns for extraction
   */
  pricePatterns: {
    sar: [
      /(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i,
      /(?:SAR|SR|ر\.س)\s*(\d+\.?\d*)/i
    ],
    subtotal: [
      /subtotal[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /sub[\s-]total[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i
    ],
    tax: [
      /tax[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /vat[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /ضريبة[:\s]*(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i
    ],
    delivery: [
      /delivery[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /shipping[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /توصيل[:\s]*(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i
    ],
    discount: [
      /discount[:\s]*-?\s*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /coupon[:\s]*-?\s*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /خصم[:\s]*-?\s*(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i
    ],
    total: [
      /total[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /grand[\s-]total[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /الإجمالي[:\s]*(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i
    ]
  },

  /**
   * Success/Error message patterns
   */
  messages: {
    success: [
      'text=/success/i',
      'text=/added/i',
      'text=/confirmed/i',
      'text=/thank you/i'
    ],
    error: [
      'text=/error/i',
      'text=/invalid/i',
      'text=/failed/i',
      'text=/required/i'
    ],
    empty: [
      'text=/no (favourites|favorites|items|products)/i',
      'text=/empty/i',
      'text=/wishlist is empty/i'
    ]
  },

  /**
   * Payment gateway domains (for detection)
   */
  paymentGateways: [
    'mada',
    'visa',
    'mastercard',
    'moyasar',
    'hyperpay',
    'checkout.com',
    'stripe',
    'payfort'
  ],

  /**
   * Screenshot paths
   */
  screenshots: {
    debug: 'test-results/debug',
    failures: 'test-results/failures',
    evidence: 'test-results/evidence'
  }
};

/**
 * Helper function to get retry config
 */
export function getRetryConfig(operation: keyof typeof TestConfig.retry) {
  return TestConfig.retry[operation];
}

/**
 * Helper function to get timeout
 */
export function getTimeout(type: keyof typeof TestConfig.timeouts) {
  return TestConfig.timeouts[type];
}

/**
 * Helper function to get selectors
 */
export function getSelectors(element: keyof typeof TestConfig.selectors) {
  return TestConfig.selectors[element];
}

