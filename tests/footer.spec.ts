import { test, expect } from '../fixtures/test.fixtures';

// Helper function to generate random email
function generateRandomEmail(): string {
  const randomString = Math.random().toString(36).substring(2, 10);
  return `test${randomString}@example.com`;
}

test.describe('Footer', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.goto();
    await homePage.waitForPageLoad();
  });

  test('should redirect to Privacy Policy page when clicked', async ({ footerPage, page }) => {
    await footerPage.clickPrivacyPolicy();
    await page.waitForLoadState('networkidle');
    
    const isCorrectUrl = await footerPage.verifyUrlContains('privacy');
    expect(isCorrectUrl).toBeTruthy();
  });

  test('should redirect to Terms and Conditions page when clicked', async ({ footerPage, page }) => {
    await footerPage.clickTermsAndConditions();
    await page.waitForLoadState('networkidle');
    
    const isCorrectUrl = await footerPage.verifyUrlContains('terms');
    expect(isCorrectUrl).toBeTruthy();
  });

  test('should redirect to FAQs page when clicked', async ({ footerPage, page }) => {
    await footerPage.clickFAQs();
    await page.waitForLoadState('networkidle');
    
    const isCorrectUrl = await footerPage.verifyUrlContains('FAQ');
    expect(isCorrectUrl).toBeTruthy();
  });

  test('should redirect to Help Center when clicked', async ({ footerPage, page }) => {
    await footerPage.clickHelpCenter();
    await page.waitForLoadState('networkidle');
    
    const isCorrectUrl = await footerPage.verifyUrlContains('help');
    expect(isCorrectUrl).toBeTruthy();
  });

  test('should show success message when email is submitted for newsletter', async ({ footerPage }) => {
    const testEmail = generateRandomEmail();
    await footerPage.subscribeToNewsletter(testEmail);
    
    const isSuccess = await footerPage.verifyNewsletterSuccess();
    expect(isSuccess).toBeTruthy();
  });

  test('should show error message when email already exists', async ({ footerPage }) => {
    const duplicateEmail = generateRandomEmail();
    
    // Subscribe first time
    await footerPage.subscribeToNewsletter(duplicateEmail);
    
    // Subscribe again with same email
    await footerPage.subscribeToNewsletter(duplicateEmail);
    
    const hasError = await footerPage.verifyNewsletterError();
    expect(hasError).toBeTruthy();
  });
});
