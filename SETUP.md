# Weem Automation Setup Guide

## Initial Setup for Weem.sa Testing

### 1. Inspect the Website

Before running tests, you need to update the selectors in page objects to match the actual Weem website structure.

#### Using Playwright Codegen
```bash
npm run test:codegen
```

This will open an interactive browser. Navigate to https://dev.weem.sa/en and use the selector picker to find actual locators.

### 2. Update Page Objects

Edit these files with actual selectors from the website:

- `page-objects/weem-home.page.ts` - Homepage elements
- `page-objects/weem-registration.page.ts` - Registration form fields
- `page-objects/weem-products.page.ts` - Product elements
- `page-objects/weem-cart.page.ts` - Cart elements

### 3. Handle OTP Verification

The registration flow requires OTP verification. You have several options:

#### Option A: Manual OTP Entry (for manual testing)
- Tests will pause at OTP input
- Enter OTP manually
- Test continues

#### Option B: Mock OTP (for automated testing)
- Use a test phone number with known OTP
- Or disable OTP requirement in dev environment

#### Option C: API-based OTP (for CI/CD)
```typescript
// In utils/otp-handler.ts
async function getOTP(phoneNumber: string): Promise<string> {
  // Call your backend API or service
  const response = await fetch(`/api/get-otp?phone=${phoneNumber}`);
  return response.text();
}
```

### 4. Test Phone Numbers

Random phone numbers are automatically generated with format: **0500000XXX**
- Last 3 digits are random (000-999)
- Examples: 0500000123, 0500000456, 0500000099
- Fixed base: 0500000
- Random last 3 digits: XXX

**Usage in tests:**
```typescript
import { generateRandomPhoneNumber } from '../utils/phone-number.utils';

const phone = generateRandomPhoneNumber(); // Generates 0500000XXX
```

**Available functions:**
- `generateRandomPhoneNumber()` - Random last 3 digits
- `generatePhoneNumberWithDigits(123)` - Specific last digits (0500000123)
- `generateSeededPhoneNumber(100)` - Repeatable with same seed

### 5. Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npx playwright test tests/homepage.spec.ts

# Run with headed browser (see what's happening)
npm run test:headed

# Debug mode (step through tests)
npm run test:debug

# UI mode (interactive)
npm run test:ui
```

### 6. Environment Variables

Create a `.env` file (see `.env.example`):

```env
ENVIRONMENT=dev
TEST_PHONE_NUMBER=0551234567
API_KEY=your-api-key
```

### 7. Common Issues

#### Issue: Tests can't find elements
**Solution:** Update selectors in page objects using codegen tool

#### Issue: OTP verification fails
**Solution:** Implement proper OTP handling strategy (see above)

#### Issue: Tests timeout
**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
timeout: 60 * 1000, // 60 seconds
```

### 8. Next Steps

1. Run homepage tests first:
   ```bash
   npx playwright test tests/homepage.spec.ts
   ```

2. Update selectors based on failures

3. Add more test scenarios

4. Set up CI/CD pipeline

### 9. CI/CD Integration

Add to your CI/CD pipeline:

```yaml
# .github/workflows/playwright.yml
- name: Run Playwright tests
  run: npm test
  env:
    TEST_PHONE_NUMBER: ${{ secrets.TEST_PHONE_NUMBER }}
```

### 10. Test Coverage

Current test coverage:
- ✅ Homepage verification
- ✅ Registration flow (needs OTP handling)
- ✅ Shopping flow (needs product selectors)
- ⏳ Checkout flow (to be implemented)
- ⏳ Payment flow (to be implemented)
- ⏳ Search functionality (to be implemented)

