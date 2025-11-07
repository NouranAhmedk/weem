# Test Helpers Documentation

Reusable helper classes for Playwright tests. These helpers encapsulate common operations and reduce code duplication.

---

## 📚 Available Helpers

### 1. **RegistrationHelper**
Handles user registration with automatic retry logic.

#### Usage:
```typescript
import { RegistrationHelper } from './helpers/registration.helper';

test('my test', async ({ page, registrationPage }) => {
  const helper = new RegistrationHelper(page, registrationPage);
  
  // Quick registration with default settings
  const { phoneNumber, success } = await helper.quickRegister();
  console.log(`Registered with: ${phoneNumber}`);
  
  // Custom configuration
  const result = await helper.quickRegister({
    maxAttempts: 5,
    phoneNumber: '0551234567',
    throwOnFailure: false
  });
});
```

#### Methods:
- `quickRegister(options?)` - Register user with retry logic
  - `maxAttempts` (default: 3) - Number of retry attempts
  - `phoneNumber` (optional) - Specific phone number to use
  - `throwOnFailure` (default: true) - Throw error on failure
  - Returns: `{ success: boolean, phoneNumber: string }`

---

### 2. **ProductHelper**
Handles product selection, category navigation, and price extraction.

#### Usage:
```typescript
import { ProductHelper } from './helpers/product.helper';

test('my test', async ({ page, productsPage, homePage }) => {
  const helper = new ProductHelper(page, productsPage, homePage);
  
  // Select category with products
  const { products, categoryName, categoryIndex } = 
    await helper.selectCategoryWithProducts();
  
  // Select random product
  const { productName, productIndex } = 
    await helper.selectRandomProduct(products);
  
  // Extract price from text
  const price = helper.extractPrice('Product costs 25 SAR');
  console.log(`Price: ${price} SAR`);
});
```

#### Methods:
- `selectCategoryWithProducts(options?)` - Find and select category with products
  - `preferredCategories` (default: ['All', 'Fruits', 'Vegetables']) - Preferred category names
  - `maxAttempts` (default: 5) - Number of retry attempts
  - Returns: `{ products: Locator[], categoryName: string, categoryIndex: number }`

- `waitForProducts(maxAttempts?)` - Wait for products to load with scroll
  - `maxAttempts` (default: 5) - Number of retry attempts
  - Returns: `Locator[]` - Array of product locators

- `selectRandomProduct(products)` - Select random product from list
  - `products` - Array of product locators
  - Returns: `{ productName: string, productIndex: number }`

- `extractPrice(text)` - Extract price from text string
  - `text` - Text containing price
  - Returns: `number` - Extracted price or 0

---

### 3. **FavouriteHelper**
Handles favourite/wishlist operations.

#### Usage:
```typescript
import { FavouriteHelper } from './helpers/favourite.helper';

test('my test', async ({ page }) => {
  const helper = new FavouriteHelper(page);
  
  // Add to favourites
  const added = await helper.addToFavourites();
  
  // Navigate to favourites page
  await helper.navigateToFavourites();
  
  // Get count of favourites
  const count = await helper.getFavouritesCount();
  console.log(`You have ${count} favourites`);
  
  // Remove first item
  const removed = await helper.removeFromFavourites();
  
  // Check if empty
  const empty = await helper.isEmpty();
  
  // Debug screenshot
  await helper.debugScreenshot('my-test-state');
});
```

#### Methods:
- `addToFavourites(maxAttempts?)` - Add current product to favourites
  - `maxAttempts` (default: 3) - Number of retry attempts
  - Returns: `boolean` - Success status

- `navigateToFavourites()` - Navigate to favourites page
  - Returns: `Promise<void>`

- `getFavouritesCount()` - Get number of items in favourites
  - Returns: `number` - Count of favourite items

- `removeFromFavourites()` - Remove first item from favourites
  - Returns: `boolean` - Success status

- `isEmpty()` - Check if favourites page is empty
  - Returns: `boolean` - True if empty

- `debugScreenshot(name)` - Take debug screenshot
  - `name` - Screenshot name
  - Returns: `Promise<void>`

---

## 🎯 Complete Example

Here's a complete test using all helpers:

```typescript
import { test, expect } from '../../fixtures/test.fixtures';
import { RegistrationHelper } from './helpers/registration.helper';
import { ProductHelper } from './helpers/product.helper';
import { FavouriteHelper } from './helpers/favourite.helper';

test.describe('My Test Suite', () => {
  let registrationHelper: RegistrationHelper;
  let productHelper: ProductHelper;
  let favouriteHelper: FavouriteHelper;

  test.beforeEach(async ({ page, homePage, registrationPage, productsPage }) => {
    // Initialize helpers
    registrationHelper = new RegistrationHelper(page, registrationPage);
    productHelper = new ProductHelper(page, productsPage, homePage);
    favouriteHelper = new FavouriteHelper(page);
    
    // Setup
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test('complete user journey', async ({ page }) => {
    // 1. Register user
    const { phoneNumber } = await registrationHelper.quickRegister();
    console.log(`✅ Registered: ${phoneNumber}`);
    
    // 2. Select product
    const { products, categoryName } = 
      await productHelper.selectCategoryWithProducts({
        preferredCategories: ['Fruits', 'Vegetables']
      });
    
    const { productName } = await productHelper.selectRandomProduct(products);
    console.log(`✅ Selected: ${productName} from ${categoryName}`);
    
    // 3. Add to favourites
    const added = await favouriteHelper.addToFavourites();
    expect(added).toBeTruthy();
    
    // 4. Verify
    await favouriteHelper.navigateToFavourites();
    const count = await favouriteHelper.getFavouritesCount();
    expect(count).toBeGreaterThan(0);
    
    console.log(`✅ Test completed successfully!`);
  });
});
```

---

## 🛠️ Creating New Helpers

When creating new helpers, follow these principles:

### 1. **Single Responsibility**
Each helper should handle ONE domain (e.g., registration, products, checkout).

### 2. **Reusability**
Design methods to be reusable across multiple tests.

### 3. **Error Handling**
Include retry logic and graceful error handling.

### 4. **Configuration**
Allow customization through options parameters.

### 5. **Logging**
Use `console.log()` to provide visibility into what's happening.

### Example Template:

```typescript
import { Page, Locator } from '@playwright/test';

/**
 * MyFeature Helper
 * Description of what this helper does
 */
export class MyFeatureHelper {
  constructor(
    private page: Page,
    private myFeaturePage?: any
  ) {}

  /**
   * Main operation with retry logic
   */
  async doSomething(options: {
    maxAttempts?: number;
    customOption?: string;
  } = {}): Promise<{ success: boolean; data: string }> {
    const { maxAttempts = 3, customOption = 'default' } = options;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Attempt ${attempt}/${maxAttempts}`);
        
        // Your logic here
        const result = await this.performAction();
        
        if (result) {
          console.log('✅ Success');
          return { success: true, data: result };
        }
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error.message);
        if (attempt === maxAttempts) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
    
    return { success: false, data: '' };
  }

  /**
   * Private helper method
   */
  private async performAction(): Promise<string> {
    // Implementation
    return 'result';
  }
}
```

---

## 📖 Additional Resources

- **Test Configuration**: See `tests/config/test.config.ts` for centralized settings
- **Shopping Helper**: Existing helper for shopping operations
- **Page Objects**: Use with page objects from `page-objects/` directory

---

## 🤝 Contributing

When adding new helpers:

1. Create file in `tests/helpers/`
2. Follow naming convention: `feature.helper.ts`
3. Add documentation to this README
4. Create tests for the helper (optional but recommended)
5. Update imports in relevant test files

---

## ⚡ Quick Tips

### Tip 1: Initialize in beforeEach
```typescript
test.beforeEach(async ({ page, registrationPage, productsPage, homePage }) => {
  registrationHelper = new RegistrationHelper(page, registrationPage);
  productHelper = new ProductHelper(page, productsPage, homePage);
  // ... more helpers
});
```

### Tip 2: Chain Operations
```typescript
// Register and select product in one flow
const { phoneNumber } = await registrationHelper.quickRegister();
const { products } = await productHelper.selectCategoryWithProducts();
const { productName } = await productHelper.selectRandomProduct(products);
```

### Tip 3: Error Handling
```typescript
// Graceful error handling
const result = await helper.quickRegister({ throwOnFailure: false });
if (!result.success) {
  test.skip('Registration failed, skipping test');
  return;
}
```

### Tip 4: Debug Information
```typescript
// Helpers include console.log for visibility
// No need to add extra logging in tests
const { products, categoryName } = await productHelper.selectCategoryWithProducts();
// Console: "✅ Found 25 products in category: Fruits"
```

---

**Happy Testing! 🎉**

