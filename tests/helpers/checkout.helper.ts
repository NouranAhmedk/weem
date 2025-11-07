import { Page } from '@playwright/test';

/**
 * Checkout Helper
 * Handles checkout operations and price calculations
 */
export class CheckoutHelper {
  constructor(private page: Page) {}

  private readonly cardNumberSelectors = [
    '[data-testid*="card-number"]',
    '[data-eram-test-id*="card-number"]',
    'input[name*="cardNumber" i]',
    'input[id*="card-number" i]',
    'input[placeholder*="card number" i]'
  ];

  private readonly expirySelectors = [
    '[data-testid*="expiry"]',
    '[data-eram-test-id*="expiry"]',
    'input[name*="expiry" i]',
    'input[id*="expiry" i]',
    'input[placeholder*="expiry" i]',
    'input[placeholder*="mm/yy" i]',
    'input[placeholder*="mm/yy" i]'
  ];

  private readonly cvvSelectors = [
    '[data-testid*="cvv"]',
    '[data-eram-test-id*="cvv"]',
    'input[name*="cvv" i]',
    'input[id*="cvv" i]',
    'input[placeholder*="cvv" i]',
    'input[placeholder*="cvc" i]'
  ];

  /**
   * Navigate to checkout page
   */
  async navigateToCheckout(): Promise<void> {
    const checkoutSelectors = [
      '[data-eram-test-id*="checkout"]',
      'button:has-text("Checkout")',
      'a:has-text("Checkout")'
    ];

    for (const selector of checkoutSelectors) {
      const button = this.page.locator(selector).first();
      const visible = await button.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (visible) {
        await button.click();
        await this.page.waitForTimeout(3000);
        return;
      }
    }

    throw new Error('Checkout button not found');
  }

  /**
   * Extract price from text using regex patterns
   */
  extractPrice(text: string): number {
    const patterns = [
      /(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i,
      /(?:SAR|SR|ر\.س)\s*(\d+\.?\d*)/i,
      /total[:\s]*(\d+\.?\d*)/i,
      /الإجمالي[:\s]*(\d+\.?\d*)/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }

    return 0;
  }

  /**
   * Get price breakdown from checkout page
   */
  async getPriceBreakdown(): Promise<{
    subtotal: number;
    discount: number;
    delivery: number;
    tax: number;
    total: number;
  }> {
    const pageText = await this.page.textContent('body') || '';

    const subtotalPatterns = [
      /subtotal[:\s]*(\d+\.?\d*)/i,
      /المجموع[:\s]*(\d+\.?\d*)/i,
      /products?\s*price[:\s]*(\d+\.?\d*)/i
    ];

    const discountPatterns = [
      /discount[:\s]*(\d+\.?\d*)/i,
      /خصم[:\s]*(\d+\.?\d*)/i
    ];

    const deliveryPatterns = [
      /delivery[:\s]*(\d+\.?\d*)/i,
      /الشحن[:\s]*(\d+\.?\d*)/i
    ];

    const totalPatterns = [
      /total[:\s]*(\d+\.?\d*)\s*(?:SAR|SR)/i,
      /الإجمالي[:\s]*(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i
    ];

    const extract = (patterns: RegExp[]): number => {
      for (const pattern of patterns) {
        const match = pageText.match(pattern);
        if (match) return parseFloat(match[1]);
      }
      return 0;
    };

    return {
      subtotal: extract(subtotalPatterns),
      discount: extract(discountPatterns),
      delivery: extract(deliveryPatterns),
      tax: 0, // Extract if needed
      total: extract(totalPatterns)
    };
  }

  /**
   * Apply promo code
   */
  async applyPromoCode(code: string): Promise<boolean> {
    // Click "Choose" button if exists
    const chooseButton = this.page.locator('button:has-text("Choose")').first();
    const chooseVisible = await chooseButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (chooseVisible) {
      await chooseButton.click();
      await this.page.waitForTimeout(2000);
    }

    // Find promo input
    const promoInput = this.page.locator('input[placeholder*="promo" i], input[placeholder*="code" i]').first();
    const inputVisible = await promoInput.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (!inputVisible) {
      return false;
    }

    await promoInput.fill(code);
    await promoInput.press('Enter');
    await this.page.waitForTimeout(2000);

    return true;
  }

  async selectPaymentMethod(testId: string): Promise<boolean> {
    const paymentOption = this.page.getByTestId(testId).first();
    const visible = await paymentOption.isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) {
      console.log(`⚠️ Payment option ${testId} not visible`);
      return false;
    }

    await paymentOption.scrollIntoViewIfNeeded();
    await paymentOption.click({ delay: 50 });
    await this.page.waitForTimeout(1000);
    return true;
  }

  async fillCreditCardDetails(details: { number: string; expiry: string; cvv: string }): Promise<boolean> {
    const numberInput = await this.findFirstVisibleLocator(this.cardNumberSelectors);
    if (!numberInput) {
      console.log('⚠️ Card number input not found');
      return false;
    }

    await numberInput.fill('');
    await numberInput.type(details.number, { delay: 50 }).catch(() => undefined);

    const expiryInput = await this.findFirstVisibleLocator(this.expirySelectors);
    if (!expiryInput) {
      console.log('⚠️ Expiry input not found');
      return false;
    }
    await expiryInput.fill('');
    await expiryInput.type(details.expiry, { delay: 50 }).catch(() => undefined);

    const cvvInput = await this.findFirstVisibleLocator(this.cvvSelectors);
    if (!cvvInput) {
      console.log('⚠️ CVV input not found');
      return false;
    }
    await cvvInput.fill('');
    await cvvInput.type(details.cvv, { delay: 50 }).catch(() => undefined);

    return true;
  }

  async confirmPayment(): Promise<boolean> {
    const confirmButton = await this.findFirstVisibleLocator([
      '[data-eram-test-id*="confirm-payment"]',
      'button:has-text("Confirm Payment")',
      'button:has-text("Complete Order")',
      'button:has-text("Pay Now")',
      'button:has-text("Place Order")'
    ]);

    if (!confirmButton) {
      console.log('⚠️ Payment confirmation button not found');
      return false;
    }

    await confirmButton.scrollIntoViewIfNeeded();
    await confirmButton.click({ delay: 50 });
    await this.page.waitForTimeout(3000);
    return true;
  }

  async waitForPaymentOutcome(timeout = 15000): Promise<'gateway' | 'success' | 'unknown'> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const currentUrl = this.page.url();
      if (/mada|visa|mastercard|moyasar|hyperpay|checkout|stripe|payfort/i.test(currentUrl)) {
        return 'gateway';
      }

      const confirmation = this.page.locator('text=/order confirmed|thank you|success|تم الطلب/i').first();
      const visible = await confirmation.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        return 'success';
      }

      await this.page.waitForTimeout(500);
    }

    return 'unknown';
  }

  private async findFirstVisibleLocator(selectors: string[], timeout = 2000): Promise<Page['locator'] | null> {
    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      const visible = await locator.isVisible({ timeout }).catch(() => false);
      if (visible) {
        return locator;
      }
    }

    return null;
  }
}

