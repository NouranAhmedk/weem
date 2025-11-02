# API and Dashboard Testing Guide

## Quick Start

### API Testing
```bash
# Run all API tests
npx playwright test tests/api/

# Run specific API test
npx playwright test tests/api/api.spec.ts
```

### Admin Dashboard Testing
```bash
# Run all admin tests
npx playwright test tests/admin/

# Run admin login tests
npx playwright test tests/admin/admin-login.spec.ts
```

### Integration Testing
```bash
# Run integration tests
npx playwright test tests/integration/
```

## API Layer Usage

### In Tests
```typescript
import { test, expect } from '../../fixtures/test.fixtures';

test('example API test', async ({ weemApi }) => {
  // Use API client directly
  const response = await weemApi.getProducts();
  expect(response.status).toBe(200);
});
```

### API Methods Available

**User APIs:**
- `registerUser(phoneNumber)` - Register new user
- `verifyOTP(phoneNumber, otp)` - Verify OTP
- `loginUser(phoneNumber, otp)` - Login user
- `getUserProfile()` - Get user profile

**Product APIs:**
- `getProducts(params)` - Get all products
- `getProductById(id)` - Get product by ID
- `searchProducts(query)` - Search products
- `createProduct(data)` - Create product (admin)
- `updateProduct(id, data)` - Update product (admin)
- `deleteProduct(id)` - Delete product (admin)

**Cart APIs:**
- `getCart()` - Get cart
- `addToCart(productId, quantity)` - Add to cart
- `removeFromCart(itemId)` - Remove from cart
- `createOrder(data)` - Create order

**Newsletter APIs:**
- `subscribeNewsletter(email)` - Subscribe to newsletter

## Dashboard Layer Usage

### Admin Page Objects

**AdminLoginPage:**
```typescript
test('login to admin', async ({ adminLoginPage }) => {
  await adminLoginPage.goto();
  await adminLoginPage.login('username', 'password');
  const success = await adminLoginPage.verifyLoginSuccess();
  expect(success).toBeTruthy();
});
```

**AdminProductsPage:**
```typescript
test('manage products', async ({ adminProductsPage }) => {
  await adminProductsPage.goto();
  await adminProductsPage.clickAddProduct();
  await adminProductsPage.fillProductForm({ name: 'Test', price: 99 });
  await adminProductsPage.clickSave();
});
```

**AdminOrdersPage:**
```typescript
test('manage orders', async ({ adminOrdersPage }) => {
  await adminOrdersPage.goto();
  await adminOrdersPage.searchOrder('ORD123');
  await adminOrdersPage.updateOrderStatus('ORD123', 'Shipped');
});
```

## Integration Helper Usage

### Fast Test Setup

**Create authenticated user (skips UI registration):**
```typescript
test('fast shopping test', async ({ page, homePage, cartPage }) => {
  // Create user via API instead of UI (much faster)
  const user = await TestSetupHelper.createAuthenticatedUser(page);
  
  // User is now logged in, skip registration UI
  await homePage.goto();
  // Continue with test...
});
```

**Create test data via API:**
```typescript
test('test with existing product', async ({ homePage, productsPage }) => {
  // Create product via API
  const product = await TestSetupHelper.createTestProduct({
    name: 'Test Product',
    price: 199.99
  });
  
  // Search for it in UI
  await homePage.goto();
  await homePage.searchProduct('Test Product');
  // Verify it appears...
});
```

## Integration Scenarios

### 1. API → UI
Create data via API, verify on UI
```typescript
test('API to UI', async ({ weemApi, homePage, productsPage }) => {
  await weemApi.createProduct({ name: 'New Product' });
  
  await homePage.goto();
  await homePage.searchProduct('New Product');
  expect(await productsPage.getProductCount()).toBeGreaterThan(0);
});
```

### 2. UI → Dashboard
Action on UI, verify in dashboard
```typescript
test('UI to Dashboard', async ({ homePage, cartPage, adminOrdersPage }) => {
  // Place order on UI
  // ... shopping flow
  
  // Verify in admin
  await adminOrdersPage.goto();
  const exists = await adminOrdersPage.findOrderByEmail(userEmail);
  expect(exists).toBeTruthy();
});
```

### 3. Dashboard → UI
Manage in dashboard, verify on UI
```typescript
test('Dashboard to UI', async ({ adminProductsPage, productsPage }) => {
  // Create product in admin
  await adminProductsPage.goto();
  await adminProductsPage.clickAddProduct();
  // ... create product
  
  // Verify on UI
  await productsPage.viewProduct(productId);
  expect(await productsPage.getProductPrice()).toBeTruthy();
});
```

### 4. Full Circle: API → Dashboard → UI
```typescript
test('Full integration', async ({ weemApi, adminProductsPage, productsPage }) => {
  // 1. Create via API
  const product = await weemApi.createProduct({ name: 'Test' });
  
  // 2. Edit in Dashboard
  await adminProductsPage.goto();
  await adminProductsPage.editProduct('Test');
  
  // 3. Verify on UI
  await productsPage.viewProduct(product.id);
});
```

## Configuration

Add to `.env`:
```env
# API Configuration
API_BASE_URL=https://dev.weem.sa/api

# Admin Configuration
ADMIN_URL=https://dev.weem.eramapps.com/admin
ADMIN_USERNAME=your_admin_username
ADMIN_PASSWORD=your_admin_password
```

## Benefits

**Speed:**
- Create users via API (1s) vs UI (10s)
- Setup test data quickly
- Skip repetitive UI interactions

**Reliability:**
- API tests are faster and more stable
- Less flaky than UI tests
- Can test backend separately

**Coverage:**
- Test APIs directly
- Test admin dashboard
- Test integration between layers
- End-to-end workflows

## Test Organization

```
tests/
├── homepage.spec.ts           # UI tests
├── auth-flow.spec.ts          # UI tests
├── shopping-flow.spec.ts      # UI tests
├── footer.spec.ts             # UI tests
├── api/
│   └── api.spec.ts           # API tests
├── admin/
│   ├── admin-login.spec.ts   # Dashboard tests
│   └── admin-products.spec.ts # Dashboard tests
└── integration/
    └── api-ui-integration.spec.ts # Integration tests
```

## Next Steps

1. Update API endpoints to match actual Weem API
2. Add admin credentials to `.env`
3. Run tests: `npx playwright test tests/api/`
4. Customize admin page selectors based on actual dashboard
5. Create more integration test scenarios


