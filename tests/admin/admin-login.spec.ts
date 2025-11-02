import { test, expect } from '../../fixtures/test.fixtures';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../../utils/app-config';

/**
 * Admin Login Tests
 * Test admin authentication
 */
test.describe('Admin Login', () => {
  test.beforeEach(async ({ adminLoginPage }) => {
    await adminLoginPage.goto();
  });

  test('should login with valid credentials', async ({ adminLoginPage }) => {
    await adminLoginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    
    const isSuccess = await adminLoginPage.verifyLoginSuccess();
    expect(isSuccess).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ adminLoginPage }) => {
    await adminLoginPage.login('invalid', 'wrong');
    
    const hasError = await adminLoginPage.verifyLoginError();
    expect(hasError).toBeTruthy();
  });
});


