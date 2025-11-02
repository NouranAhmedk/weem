import { test, expect } from '../../fixtures/test.fixtures';
import { generateRandomPhoneNumber, generateRandomEmail } from '../../utils/phone-number.utils';
import { TEST_OTP } from '../../utils/app-config';

/**
 * API Tests
 * Test Weem backend APIs directly
 */
test.describe('Weem API', () => {
  test('should register user via API', async ({ weemApi }) => {
    const phoneNumber = generateRandomPhoneNumber();
    const response = await weemApi.registerUser(phoneNumber);

    expect(response.status).toBe(200);
    expect(response.data).toBeTruthy();
  });

  test('should get products via API', async ({ weemApi }) => {
    const response = await weemApi.getProducts({ limit: 10 });

    expect(response.status).toBe(200);
    expect(response.data).toBeTruthy();
    expect(Array.isArray(response.data.products || response.data)).toBeTruthy();
  });

  test('should search products via API', async ({ weemApi }) => {
    const response = await weemApi.searchProducts('phone');

    expect(response.status).toBe(200);
    expect(response.data).toBeTruthy();
  });

  test('should subscribe to newsletter via API', async ({ weemApi }) => {
    const email = generateRandomEmail();
    const response = await weemApi.subscribeNewsletter(email);

    expect(response.status).toBe(200);
  });

  test('should return error for duplicate newsletter subscription', async ({ weemApi }) => {
    const email = generateRandomEmail();
    
    // Subscribe first time
    await weemApi.subscribeNewsletter(email);
    
    // Subscribe again
    const response = await weemApi.subscribeNewsletter(email);
    
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});


