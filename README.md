# Weem E-Commerce Test Automation

Automated testing framework for Weem.sa e-commerce platform using Playwright with Page Object Model pattern.

**Website:** https://dev.weem.sa/en

## 📁 Project Structure

```
weem/
├── fixtures/              # Custom test fixtures
│   └── test.fixtures.ts  # Page object fixtures
├── helpers/               # Utility helpers
│   ├── browser.helper.ts  # Browser actions helper
│   └── locator.helper.ts # Locator strategies helper
├── page-objects/          # Page Object Model classes
│   ├── weem-home.page.ts
│   ├── weem-registration.page.ts
│   ├── weem-products.page.ts
│   └── weem-cart.page.ts
├── tests/                 # Test files
│   ├── homepage.spec.ts
│   ├── auth-flow.spec.ts
│   └── shopping-flow.spec.ts
├── utils/
│   ├── globalSetup.ts     # Global test setup
│   ├── app-config.ts      # Reads env (TEST_OTP, PHONE_BASE)
│   └── phone-number.utils.ts
└── config/
    └── test-data.ts      # (legacy) example test data
├── playwright.config.ts   # Playwright configuration
└── package.json
```

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install
```

### Run Tests

```bash
# Run all tests
npm test

# Run in headed mode (see browser)
npm run test:headed

# Run with UI mode
npm run test:ui

# Run in debug mode
npm run test:debug

# Run specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Generate code
npm run test:codegen

# View test report
npm run test:report
```

## 🏗️ Architecture

### Page Object Model (POM)
Each page has its own page object class with:
- Element selectors
- Page actions
- Reusable methods

### Helpers
- **BrowserHelper**: Common browser actions (navigation, screenshots, etc.)
- **LocatorHelper**: Unified locator strategies (ID, CSS, XPath, etc.)

### Fixtures
Custom fixtures provide page objects to tests automatically.

## 📝 Writing Tests

### Using Page Objects

```typescript
import { test, expect } from '../fixtures/test.fixtures';

test('navigate to homepage', async ({ homePage }) => {
  await homePage.goto();
  await homePage.verifyHomepageLoaded();
});

test('complete registration', async ({ homePage, registrationPage }) => {
  await homePage.goto();
  await registrationPage.registerWithPhone('0551234567');
  await registrationPage.verifyOTP('123456');
});
```

### Direct API Usage

```typescript
import { test, expect } from '@playwright/test';

test('example test', async ({ page }) => {
  await page.goto('https://example.com');
  await page.getByRole('button').click();
  // assertions...
});
```

## 🎯 Best Practices

1. **Use Page Object Model** for maintainability
2. **Prefer role-based locators** (getByRole, getByLabel, etc.)
3. **Use helpers** for common actions
4. **Keep tests independent** - no shared state
5. **Use meaningful test names**
6. **Group related tests** with test.describe()

## 📊 Locator Strategies (Recommended Order)

1. ✅ `getByRole()` - Best for accessibility
2. ✅ `getByLabel()` - For form fields
3. ✅ `getByText()` - For visible text
4. ✅ `getByTestId()` - Custom test IDs
5. ⚠️ `locator()` with CSS - When above don't work
6. ❌ `locator()` with XPath - Last resort

## 🔧 Configuration

Edit `playwright.config.ts` to:
- Add more browsers/devices
- Configure test timeouts
- Set up CI/CD settings
- Add custom reporters

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)

