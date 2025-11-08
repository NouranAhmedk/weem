import { Page, Locator, Frame } from '@playwright/test';

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

  private readonly cardholderSelectors = [
    '[data-testid*="card-holder"]',
    '[data-eram-test-id*="card-holder"]',
    'input[name*="cardholder" i]',
    'input[name*="cardHolder" i]',
    'input[id*="cardholder" i]',
    'input[placeholder*="cardholder" i]',
    'input[placeholder*="card holder" i]',
    'input[placeholder*="name on card" i]'
  ];

  private readonly addPaymentSelectors = [
    '[data-eram-test-id="add-payment-button"]',
    'button:has-text("Add payment")',
    'button:has-text("Add Payment")',
    'button:has-text("Add new payment")'
  ];

  private readonly payNowSelectors = [
    '[data-eram-test-id="pay-now-button"]',
    '[data-testid*="pay-button"]',
    'button:has-text("Pay Now")',
    'button:has-text("Pay now")',
    'button:has-text("Pay")'
  ];

  private readonly paymentFrameSelectors = [
    'iframe[src*="pay"]',
    'iframe[id*="pay"]',
    'iframe[name*="pay"]',
    'iframe[data-eram-test-id*="payment"]',
    'iframe[data-testid*="payment"]'
  ];

  private readonly overlaySelectors = [
    'div[data-state="open"][data-slot="dialog-overlay"]',
    '.modal-backdrop',
    'div[data-testid*="modal-backdrop"]',
    'div[data-eram-test-id*="modal-backdrop"]'
  ];

  private paymentFrame: Frame | null = null;

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
    const outerChooseSelectors = [
      '[data-eram-test-id="choose-promo-code-button-text"]',
      '[data-eram-test-id="choose-promo-code-button"]',
      'button:has-text("Choose")',
      'div.bg-secondary.rounded-2xl.px-4.py-2.text-center.text-white:has-text("Choose")',
      '[data-eram-test-id*="choose-promo"]'
    ];

    const innerChooseSelectors = [
      '[data-eram-test-id="apply-promo-code-button"]',
      '[data-testid*="apply-promo"]',
      'button[data-eram-test-id*="apply-promo"]',
      'button:has-text("Choose")',
      '[data-eram-test-id*="promo-option-choose"]'
    ];

    const outerChoose = await this.findFirstVisibleLocator(outerChooseSelectors, 2000);
    if (outerChoose) {
      try {
        await outerChoose.scrollIntoViewIfNeeded();
        await outerChoose.click({ delay: 50 });
        await this.page.waitForTimeout(1500);
      } catch {
        // ignore click errors
      }
    }

    // Promo modal may render in a dialog or iframe, attempt to click the inner choose/apply button
    const innerChoose = await this.findFirstVisibleLocator(innerChooseSelectors, 4000);
    if (innerChoose) {
      try {
        await innerChoose.scrollIntoViewIfNeeded();
        await innerChoose.click({ delay: 50 });
        await this.page.waitForTimeout(1000);
      } catch {
        // ignore click errors
      }
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
    await this.openAddPaymentSection();

    const paymentOption = this.page.getByTestId(testId).first();
    let visible = await paymentOption.isVisible({ timeout: 2000 }).catch(() => false);
    let locatorToClick: Locator | null = null;

    if (visible) {
      locatorToClick = paymentOption;
    } else {
      const fallbackOption = await this.findFirstVisibleLocator([
        'button:has-text("Credit Card")',
        'div:has-text("Credit Card")',
        '[data-eram-test-id*="credit-card"]',
        '[data-testid*="credit-card"]'
      ], 2000);

      if (fallbackOption) {
        locatorToClick = fallbackOption;
        visible = true;
      }
    }

    if (!visible || !locatorToClick) {
      return true;
    }

    await locatorToClick.scrollIntoViewIfNeeded();
    await locatorToClick.click({ delay: 50 });
    await this.page.waitForTimeout(1000);
    return true;
  }

  async fillCreditCardDetails(details: { number: string; expiry: string; cvv: string; cardholder?: string }): Promise<boolean> {
    await this.openAddPaymentSection();

    await this.waitForPaymentModal(15000);

    const numberInput = await this.findFirstVisibleLocator(this.cardNumberSelectors, 5000, true);
    if (numberInput) {
      await numberInput.fill('');
      await numberInput.type(details.number, { delay: 50 }).catch(() => undefined);
    } else {
      return false;
    }

    if (details.cardholder) {
      const cardholderInput = await this.findFirstVisibleLocator(this.cardholderSelectors, 3000, true);
      if (cardholderInput) {
        await cardholderInput.fill('');
        await cardholderInput.type(details.cardholder, { delay: 50 }).catch(() => undefined);
      }
    }

    const expiryInput = await this.findFirstVisibleLocator(this.expirySelectors, 3000, true);
    if (!expiryInput) {
      return false;
    }
    await expiryInput.fill('');
    await expiryInput.type(details.expiry, { delay: 50 }).catch(() => undefined);

    const cvvInput = await this.findFirstVisibleLocator(this.cvvSelectors, 3000, true);
    if (!cvvInput) {
      return false;
    }
    await cvvInput.fill('');
    await cvvInput.type(details.cvv, { delay: 50 }).catch(() => undefined);

    return true;
  }

  async confirmPayment(): Promise<boolean> {
    await this.dismissBlockingOverlays();

    const confirmButton = await this.findFirstVisibleLocator([
      '[data-eram-test-id="confirm-payment-button"]',
      '[data-eram-test-id*="confirm-payment"]',
      'button:has-text("Confirm Payment")',
      'button:has-text("Complete Order")',
      'button:has-text("Pay Now")',
      'button:has-text("Place Order")'
    ], 4000);

    if (!confirmButton) {
      return false;
    }

    try {
      await confirmButton.scrollIntoViewIfNeeded();
      await confirmButton.click({ delay: 50 });
    } catch (error) {
      return false;
    }

    const modalOpened = await this.waitForPaymentModal(15000);
    if (!modalOpened) {
      return false;
    }

    return true;
  }

  async submitPayment(): Promise<boolean> {
    const payNowButton = await this.findFirstVisibleLocator(this.payNowSelectors, 5000, true);
    if (!payNowButton) {
      return false;
    }

    try {
      await payNowButton.scrollIntoViewIfNeeded();
      await payNowButton.click({ delay: 50 });
      await this.page.waitForTimeout(2000);
      return true;
    } catch (error) {
      return false;
    }
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

  private async openAddPaymentSection(): Promise<void> {
    for (const selector of this.addPaymentSelectors) {
      const addPaymentButton = this.page.locator(selector).first();
      const visible = await addPaymentButton.isVisible({ timeout: 1000 }).catch(() => false);
      if (visible) {
        try {
          await addPaymentButton.scrollIntoViewIfNeeded();
          await addPaymentButton.click({ delay: 50 });
          await this.waitForPaymentModal(5000);
          return;
        } catch (error) {
          // Ignore click errors
        }
      }
    }
  }

  private async dismissBlockingOverlays(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      const overlay = await this.findFirstVisibleLocator(this.overlaySelectors, 500);
      if (!overlay) {
        break;
      }

      try {
        await this.page.keyboard.press('Escape');
        await this.page.waitForTimeout(500);
      } catch {
        // ignore
      }

      const closeButton = await this.findFirstVisibleLocator([
        'button:has-text("Close")',
        'button:has-text("Cancel")',
        'button:has-text("Dismiss")',
        'button[aria-label*="close" i]',
        '[data-eram-test-id*="close"]',
        '[data-testid*="close"]'
      ], 500);

      if (closeButton) {
        try {
          await closeButton.click({ delay: 50 });
          await this.page.waitForTimeout(300);
        } catch {
          // ignore
        }
      }
    }
  }

  private async isPaymentModalOpen(): Promise<boolean> {
    const payNowButton = await this.findFirstVisibleLocator(this.payNowSelectors, 500, true);
    if (payNowButton) {
      return true;
    }

    const cardInput = await this.findFirstVisibleLocator(this.cardNumberSelectors, 500, true);
    return Boolean(cardInput);
  }

  private async waitForPaymentModal(timeout = 15000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.isPaymentModalOpen()) {
        return true;
      }
      const frame = await this.getPaymentFrame(250);
      if (frame) {
        return true;
      }
      await this.page.waitForTimeout(250);
    }
    return false;
  }
  private async findFirstVisibleLocator(selectors: string[], timeout = 2000, includePaymentFrame = false): Promise<Locator | null> {
    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      const visible = await locator.isVisible({ timeout }).catch(() => false);
      if (visible) {
        return locator;
      }
    }

    if (!includePaymentFrame) {
      return null;
    }

    const frame = await this.getPaymentFrame(timeout);
    if (!frame) {
      return null;
    }

    for (const selector of selectors) {
      const locator = frame.locator(selector).first();
      const visible = await locator.isVisible({ timeout }).catch(() => false);
      if (visible) {
        return locator;
      }
    }

    return null;
  }

  private async getPaymentFrame(timeout = 2000): Promise<Frame | null> {
    if (this.paymentFrame) {
      return this.paymentFrame;
    }

    const start = Date.now();
    while (Date.now() - start < timeout) {
      for (const selector of this.paymentFrameSelectors) {
        const frameHandle = await this.page.locator(selector).first().elementHandle({ timeout: 500 }).catch(() => null);
        if (frameHandle) {
          const contentFrame = await frameHandle.contentFrame();
          if (contentFrame) {
            this.paymentFrame = contentFrame;
            return contentFrame;
          }
        }
      }
      await this.page.waitForTimeout(250);
    }

    return null;
  }
}

