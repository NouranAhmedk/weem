import { Page, Locator, Frame, ElementHandle } from '@playwright/test';

/**
 * Checkout Helper
 * Handles checkout operations and price calculations
 */
export class CheckoutHelper {
  constructor(private page: Page) {}

  private readonly cardNumberSelectors = [
    'input#cardNumber',
    'input[name="card_input"]',
    'input[id="cardNumber"]',
    '[data-testid*="card-number"]',
    '[data-eram-test-id*="card-number"]',
    'input[name*="cardNumber" i]',
    'input[id*="card-number" i]',
    'input[placeholder*="card number" i]'
  ];

  private readonly expirySelectors = [
    'input#date_input',
    'input[name="date_input"]',
    'input[id="date_input"]',
    'input[placeholder="MM/YY"]',
    '[data-testid*="expiry"]',
    '[data-eram-test-id*="expiry"]',
    'input[name*="expiry" i]',
    'input[id*="expiry" i]',
    'input[placeholder*="expiry" i]',
    'input[placeholder*="mm/yy" i]'
  ];

  private readonly cvvSelectors = [
    'input#cvv_input',
    'input[name="cvv_input"]',
    'input[id="cvv_input"]',
    'input[placeholder="CVV"]',
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
    '[data-testid="DefaultPayButton"]',
    '[data-testid="ButtonToRender_container"] button',
    'button:has-text("Pay with")',
    'button:has-text("Pay now")',
    'button:has-text("Pay Now")',
    'button[type="submit"]'
  ];

  private readonly outerPaymentFrameSelectors = [
    'iframe[src*="checkout.tap"]',
    'iframe[src*="tap.company"]',
    'iframe[data-testid*="Checkout"]',
    'iframe[id*="tap"]',
    'iframe[name*="tap"]'
  ];

  private readonly cardPaymentFrameSelectors = [
    'iframe#tap-card-iframe',
    'iframe[name="tapCardFrame"]',
    'iframe[src*="card"]',
    'iframe[id*="card"]',
    'iframe[name*="card"]',
    'iframe[data-testid*="card"]'
  ];

  private readonly overlaySelectors = [
    'div[data-state="open"][data-slot="dialog-overlay"]',
    '.modal-backdrop',
    'div[data-testid*="modal-backdrop"]',
    'div[data-eram-test-id*="modal-backdrop"]'
  ];

  private outerPaymentFrame: Frame | null = null;
  private cardPaymentFrame: Frame | null = null;

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
    console.log('🔍 Starting to fill credit card details...');

    // Wait for modal to be present and stable (don't try to open it, assume it's already open)
    await this.page.waitForTimeout(10000);

    console.log('🔍 Resolving Tap payment frames...');

    // Reset cached frames to ensure we get the current ones
    this.outerPaymentFrame = null;
    this.cardPaymentFrame = null;

    const { outer, card } = await this.resolveTapFrames(15000);
    const frame = card ?? outer;

    if (!frame) {
      console.log('❌ Payment frames not found');
      return false;
    }
    console.log(`✅ Payment frame found (card frame: ${Boolean(card)}, outer frame: ${Boolean(outer)})`);

    // Scroll the iframe modal into view on the main page to ensure inputs are in viewport
    console.log('📜 Scrolling payment modal into view...');
    try {
      const frameElement = await frame.frameElement();
      if (frameElement) {
        await frameElement.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(1000);
        console.log('✅ Modal scrolled into view');
      }
    } catch (error) {
      console.log('⚠️  Could not scroll modal:', error.message);
    }

    // Log all input elements in the frame for debugging
    const allInputs = await frame.locator('input').all();
    console.log(`📄 Found ${allInputs.length} input elements in frame`);

    for (let i = 0; i < allInputs.length; i++) {
      const inputInfo = await allInputs[i].evaluate((el: HTMLInputElement) => ({
        id: el.id,
        name: el.name,
        type: el.type,
        placeholder: el.placeholder,
        className: el.className,
        visible: el.offsetParent !== null,
        testId: el.getAttribute('data-testid')
      }));
      console.log(`  Input ${i}:`, JSON.stringify(inputInfo));
    }

    // Try multiple selectors for card inputs in the frame
    // NOTE: Tap Payments uses a visible mini input for display, not the hidden cardNumber input
    const cardNumberSelectors = [
      'input#card_input_mini',  // The actual VISIBLE input field
      'input[name="card_input_mini"]',
      'input#cardNumber',  // Fallback to hidden input
      'input[name="card_input"]',
      'input[placeholder*="card" i]'
    ];

    const expirySelectors = [
      'input#date_input',
      'input[name="date_input"]',
      'input[placeholder*="MM" i]',
      '[data-testid*="expiry"] input',
      '[data-testid*="date"] input'
    ];

    const cvvSelectors = [
      'input#cvv_input',
      'input[name="cvv_input"]',
      'input[placeholder*="CVV" i]',
      '[data-testid*="cvv"] input',
      '[data-testid*="cvc"] input'
    ];

    // Try to find and fill card number
    let cardNumberFilled = false;
    for (const selector of cardNumberSelectors) {
      const input = frame.locator(selector).first();
      const exists = await input.count().then(c => c > 0);
      if (exists) {
        console.log(`📝 Found card number input with selector: ${selector}`);
        try {
          // Make the input visible and interactable
          await input.evaluate((el: HTMLInputElement) => {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
          });
          await this.page.waitForTimeout(300);

          // Scroll the input into view within the iframe
          await input.scrollIntoViewIfNeeded().catch(() => {});
          await this.page.waitForTimeout(300);

          // Click on the card number field to activate it
          console.log('🖱️  Clicking card number field...');
          await input.click({ force: true });
          await this.page.waitForTimeout(500);

          // Remove any maxlength restriction
          await input.evaluate((el: HTMLInputElement) => {
            el.removeAttribute('maxlength');
            el.removeAttribute('maxLength');
          });

          // Type using real keyboard events via page.keyboard
          console.log('⌨️  Typing card number with real keyboard events...');
          await input.focus();
          await this.page.waitForTimeout(300);

          // Type each digit using page.keyboard which generates real keyboard events
          for (const char of details.number) {
            await this.page.keyboard.press(char);
            await this.page.waitForTimeout(50);
          }

          await this.page.waitForTimeout(1000);

          // Check the value
          let value = await input.inputValue().catch(() => '');
          console.log('✅ Card number typed with keyboard, value length:', value.length, 'Expected:', details.number.length);

          if (value.length > 0) {
            cardNumberFilled = true;
            break;
          } else {
            console.log('⚠️  Value not set, trying next selector...');
          }
        } catch (error) {
          console.log(`❌ Failed to fill with ${selector}:`, error.message);
        }
      }
    }

    // ALSO fill the hidden cardNumber field to trigger validation
    console.log('🔧 Filling hidden cardNumber field for validation...');
    const hiddenCardInput = frame.locator('input#cardNumber');
    const hiddenExists = await hiddenCardInput.count().then(c => c > 0);
    if (hiddenExists) {
      await hiddenCardInput.evaluate((el: HTMLInputElement, value: string) => {
        el.value = value;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }, details.number);
      console.log('✅ Hidden cardNumber field filled');
    }

    if (!cardNumberFilled) {
      console.log('⚠️  Card number not filled in frame, trying page...');
      await this.fillCardInputsOnPage(details);
      return true;
    }

    await this.page.waitForTimeout(500);

    // Try to find and fill expiry
    let expiryFilled = false;
    for (const selector of expirySelectors) {
      const input = frame.locator(selector).first();
      const exists = await input.count().then(c => c > 0);
      if (exists) {
        console.log(`📝 Found expiry input with selector: ${selector}`);
        try {
          // Make the input visible and interactable
          await input.evaluate((el: HTMLInputElement) => {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
          });
          await this.page.waitForTimeout(300);

          // Scroll the input into view
          await input.scrollIntoViewIfNeeded().catch(() => {});
          await this.page.waitForTimeout(300);

          // Click on the expiry field to activate it
          console.log('🖱️  Clicking expiry field...');
          await input.click({ force: true });
          await this.page.waitForTimeout(500);

          // Type character by character to simulate real user input
          console.log('⌨️  Typing expiry date...');
          await input.pressSequentially(details.expiry, { delay: 100 });
          await this.page.waitForTimeout(1000);

          // Verify the value was set
          const value = await input.inputValue().catch(() => '');
          console.log('✅ Expiry typed, value length:', value.length, 'Expected:', details.expiry.length);

          if (value.length > 0) {
            expiryFilled = true;
            break;
          } else {
            console.log('⚠️  Value not set, trying next selector...');
          }
        } catch (error) {
          console.log(`❌ Failed to fill expiry with ${selector}:`, error.message);
        }
      }
    }

    await this.page.waitForTimeout(500);

    // Try to find and fill CVV
    let cvvFilled = false;
    for (const selector of cvvSelectors) {
      const input = frame.locator(selector).first();
      const exists = await input.count().then(c => c > 0);
      if (exists) {
        console.log(`📝 Found CVV input with selector: ${selector}`);
        try {
          // Make the input visible and interactable
          await input.evaluate((el: HTMLInputElement) => {
            el.style.visibility = 'visible';
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
          });
          await this.page.waitForTimeout(300);

          // Scroll the input into view
          await input.scrollIntoViewIfNeeded().catch(() => {});
          await this.page.waitForTimeout(300);

          // Click on the CVV field to activate it
          console.log('🖱️  Clicking CVV field...');
          await input.click({ force: true });
          await this.page.waitForTimeout(500);

          // Type character by character to simulate real user input
          console.log('⌨️  Typing CVV...');
          await input.pressSequentially(details.cvv, { delay: 100 });
          await this.page.waitForTimeout(1000);

          // Verify the value was set
          const value = await input.inputValue().catch(() => '');
          console.log('✅ CVV typed, value length:', value.length, 'Expected:', details.cvv.length);

          if (value.length > 0) {
            cvvFilled = true;
            break;
          } else {
            console.log('⚠️  Value not set, trying next selector...');
          }
        } catch (error) {
          console.log(`❌ Failed to fill CVV with ${selector}:`, error.message);
        }
      }
    }

    await this.page.waitForTimeout(500);

    // Try to find and fill cardholder name if provided
    let cardholderFilled = true; // Default to true if no cardholder provided
    if (details.cardholder) {
      cardholderFilled = false;
      const cardholderSelectors = [
        'input[placeholder*="cardholder" i]',
        'input[placeholder*="name" i]',
        'input[name*="cardholder" i]',
        'input[id*="cardholder" i]',
        '[data-testid*="cardholder"] input',
        'input[type="text"]:not(#cardNumber):not(#date_input)'
      ];

      for (const selector of cardholderSelectors) {
        const input = frame.locator(selector).first();
        const exists = await input.count().then(c => c > 0);
        if (exists) {
          console.log(`📝 Found cardholder input with selector: ${selector}`);
          try {
            // Make the input visible and interactable
            await input.evaluate((el: HTMLInputElement) => {
              el.style.visibility = 'visible';
              el.style.opacity = '1';
              el.style.pointerEvents = 'auto';
            });
            await this.page.waitForTimeout(300);

            // Scroll the input into view
            await input.scrollIntoViewIfNeeded().catch(() => {});
            await this.page.waitForTimeout(300);

            // Click on the cardholder field to activate it
            console.log('🖱️  Clicking cardholder field...');
            await input.click({ force: true });
            await this.page.waitForTimeout(500);

            // Type character by character to simulate real user input
            console.log('⌨️  Typing cardholder name...');
            await input.pressSequentially(details.cardholder, { delay: 100 });
            await this.page.waitForTimeout(1000);

            // Verify the value was set
            const value = await input.inputValue().catch(() => '');
            console.log('✅ Cardholder typed, value length:', value.length, 'Expected:', details.cardholder.length);

            if (value.length > 0) {
              cardholderFilled = true;
              break;
            } else {
              console.log('⚠️  Value not set, trying next selector...');
            }
          } catch (error) {
            console.log(`❌ Failed to fill cardholder with ${selector}:`, error.message);
          }
        }
      }
    }

    // Wait 1 second before tabbing/blurring
    await this.page.waitForTimeout(1000);

    // Trigger blur on the last filled input to signal form completion
    console.log('🔄 Triggering blur event to signal form completion...');
    try {
      // Find any filled input in the frame and blur it
      const lastInput = frame.locator('input#cvv_input, input[placeholder*="name" i]').last();
      const exists = await lastInput.count().then(c => c > 0);
      if (exists) {
        await this.page.waitForTimeout(1000);  // Wait 1 sec before tabbing
        await lastInput.blur();
        console.log('✅ Blur event triggered on last input');
        await this.page.waitForTimeout(3000);
      }
    } catch (error) {
      console.log('⚠️  Could not trigger blur:', error.message);
    }

    // Inspect buttons inside the payment frame for debugging
    try {
      const frameButtons = await frame.locator('button').all();
      console.log(`📊 Payment frame currently has ${frameButtons.length} button elements`);
      for (let i = 0; i < Math.min(frameButtons.length, 10); i++) {
        const info = await frameButtons[i].evaluate((el) => ({
          text: el.textContent?.trim(),
          testId: el.getAttribute('data-testid'),
          type: el.getAttribute('type'),
          classes: el.className,
          visible: (el as HTMLElement).offsetParent !== null,
          disabled: (el as HTMLButtonElement).disabled,
          outerHTML: el.outerHTML.slice(0, 200)
        }));
        console.log(`   Frame button ${i}:`, JSON.stringify(info));
      }
    } catch (error) {
      console.log('⚠️  Unable to inspect frame buttons:', error.message);
    }

    try {
      const frameRoleButtons = await frame.locator('[role="button"]').all();
      console.log(`📊 Payment frame currently has ${frameRoleButtons.length} [role="button"] elements`);
      for (let i = 0; i < Math.min(frameRoleButtons.length, 10); i++) {
        const info = await frameRoleButtons[i].evaluate((el) => ({
          text: el.textContent?.trim(),
          testId: el.getAttribute('data-testid'),
          classes: el.className,
          visible: (el as HTMLElement).offsetParent !== null
        }));
        console.log(`   Frame role button ${i}:`, JSON.stringify(info));
      }
    } catch (error) {
      console.log('⚠️  Unable to inspect frame [role="button"] elements:', error.message);
    }

    try {
      const frameHtml = await frame.evaluate(() => document.body.innerHTML);
      console.log('📄 Payment frame HTML snippet:', frameHtml.slice(0, 1000));
    } catch (error) {
      console.log('⚠️  Unable to dump frame HTML:', error.message);
    }

    console.log('Summary: Card:', cardNumberFilled, 'Expiry:', expiryFilled, 'CVV:', cvvFilled, 'Cardholder:', cardholderFilled);
    return cardNumberFilled && expiryFilled && cvvFilled && cardholderFilled;
  }

  private async fillCardInputsOnPage(details: { number: string; expiry: string; cvv: string }): Promise<boolean> {
    console.log('🔍 Looking for card inputs directly on page (not in iframe)...');

    // Look for inputs within CreditCard container
    const creditCardContainer = this.page.locator('[data-testid="CreditCard"]');
    const containerExists = await creditCardContainer.isVisible({ timeout: 2000 }).catch(() => false);

    if (containerExists) {
      console.log('✅ Found CreditCard container on page');

      // Try to find inputs within the container
      const cardInput = creditCardContainer.locator('input').first();
      const cardInputExists = await cardInput.count().then(c => c > 0);

      if (cardInputExists) {
        console.log('📝 Filling inputs in CreditCard container');
        const allInputs = await creditCardContainer.locator('input').all();
        console.log('Found', allInputs.length, 'inputs in CreditCard container');

        if (allInputs.length >= 3) {
          // Assume first is card number, second is expiry, third is CVV
          await allInputs[0].fill(details.number, { force: true });
          console.log('✅ Filled card number in container');
          await this.page.waitForTimeout(300);

          await allInputs[1].fill(details.expiry, { force: true });
          console.log('✅ Filled expiry in container');
          await this.page.waitForTimeout(300);

          await allInputs[2].fill(details.cvv, { force: true });
          console.log('✅ Filled CVV in container');

          return true;
        }
      }
    }

    // Fallback: try to find any visible card inputs on the page
    const pageInputSelectors = [
      'input[placeholder*="card" i]',
      'input[name*="card" i]',
      'input[type="tel"]',
      'input[inputmode="numeric"]'
    ];

    for (const selector of pageInputSelectors) {
      const inputs = await this.page.locator(selector).all();
      if (inputs.length >= 3) {
        console.log(`📝 Found ${inputs.length} inputs with selector ${selector} on page`);
        await inputs[0].fill(details.number, { force: true });
        await inputs[1].fill(details.expiry, { force: true });
        await inputs[2].fill(details.cvv, { force: true });
        console.log('✅ Filled all card inputs on page');
        return true;
      }
    }

    console.log('⚠️  Could not find card inputs on page');
    return false;
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
      await this.page.waitForTimeout(6000);
    } catch (error) {
      return false;
    }

    const modalOpened = await this.waitForPaymentModal(50000);
    if (!modalOpened) {
      return false;
    }

    return true;
  }

  async submitPayment(): Promise<boolean> {
    console.log('💳 Attempting to submit payment...');

    await this.openAddPaymentSection();
    const modalReady = await this.waitForPaymentModal(15000);
    if (!modalReady) {
      console.log('❌ Payment modal is not open, aborting submit.');
      return false;
    }

    const { outer } = await this.resolveTapFrames(10000);
    if (!outer) {
      console.log('❌ Unable to locate outer Tap payment frame.');
      return false;
    }

    // Allow the provider to enable the pay button after validation
    await this.page.waitForTimeout(1500);

    for (let attempt = 1; attempt <= 10; attempt++) {
      const payNowButton = await this.findPayButtonInFrame(outer, 2000);

      if (payNowButton) {
        const enabled = await payNowButton.isEnabled().catch(() => false);
        const visible = await payNowButton.isVisible().catch(() => false);
        console.log(`✅ Pay button located on attempt ${attempt} (visible=${visible}, enabled=${enabled})`);

        if (enabled && visible) {
          try {
            const popupPromise = this.page.waitForEvent('popup', { timeout: 10000 }).catch(() => null);
            await payNowButton.scrollIntoViewIfNeeded();
            await payNowButton.click({ force: true });
            console.log('✅ Pay Now button clicked');

            const popup = await popupPromise;
            if (popup) {
              console.log(`📄 Payment popup opened with URL: ${popup.url()}`);
            }

            const acsHandled = await this.clickAcsSubmitButton(20000);
            if (!acsHandled) {
              console.log('❌ ACS submit button not found or clickable.');
              return false;
            }

            await this.page.waitForTimeout(4000);
            return true;
          } catch (error) {
            console.log('⚠️  Failed to click Pay Now button:', error.message);
          }
        }
      } else {
        console.log(`📄 Attempt ${attempt}: Pay button not available yet, retrying...`);
      }

      await this.page.waitForTimeout(1000);
    }

    console.log('❌ Pay Now button not found or not clickable after retries.');
    return false;
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
    if (await this.isPaymentModalOpen()) {
      return;
    }

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
    const payNowButton = await this.findFirstVisibleLocator(this.payNowSelectors, 2000, true);
    if (payNowButton) {
      return true;
    }

    const cardInput = await this.findFirstVisibleLocator(this.cardNumberSelectors, 2000, true);
    return Boolean(cardInput);
  }

  private async waitForPaymentModal(timeout = 15000): Promise<boolean> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.isPaymentModalOpen()) {
        return true;
      }
      const { outer, card } = await this.resolveTapFrames(250);
      if (outer || card) {
        return true;
      }
      await this.page.waitForTimeout(500);
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

    const { outer, card } = await this.resolveTapFrames(timeout);
    const frames: Frame[] = [];
    if (card) {
      frames.push(card);
    }
    if (outer) {
      frames.push(outer);
    }

    for (const frame of frames) {
      for (const selector of selectors) {
        const locator = frame.locator(selector).first();
        const visible = await locator.isVisible({ timeout }).catch(() => false);
        if (visible) {
          return locator;
        }
      }
    }

    return null;
  }

  private async resolveTapFrames(timeout = 5000): Promise<{ outer: Frame | null; card: Frame | null }> {
    let outer = this.outerPaymentFrame && !this.outerPaymentFrame.isDetached() ? this.outerPaymentFrame : null;
    let card = this.cardPaymentFrame && !this.cardPaymentFrame.isDetached() ? this.cardPaymentFrame : null;

    const deadline = Date.now() + timeout;

    while (Date.now() < deadline && (!outer || !card)) {
      if (!outer) {
        for (const selector of this.outerPaymentFrameSelectors) {
          const locator = this.page.locator(selector).first();
          const handle = await locator.elementHandle({ timeout: 500 }).catch(() => null);
          if (!handle) {
            continue;
          }

          const frame = await handle.contentFrame();
          if (frame && !frame.isDetached()) {
            outer = frame;
            this.outerPaymentFrame = frame;
            break;
          }
        }
      }

      if (!card) {
        if (outer) {
          const innerHandles = await outer.locator('iframe').elementHandles().catch(() => [] as ElementHandle<HTMLIFrameElement>[]);
          for (const handle of innerHandles) {
            const frame = await handle.contentFrame();
            if (!frame || frame.isDetached()) {
              continue;
            }

            const hasCardInputs = await frame
              .locator('#card-main-container, input#card_input_mini, input[name="card_input_mini"], input[id="card_input_mini"]')
              .first()
              .isVisible({ timeout: 100 })
              .catch(() => false);

            if (hasCardInputs) {
              card = frame;
              this.cardPaymentFrame = frame;
              break;
            }
          }
        }

        if (!card) {
          for (const selector of this.cardPaymentFrameSelectors) {
            const locator = this.page.locator(selector).first();
            const handle = await locator.elementHandle({ timeout: 500 }).catch(() => null);
            if (!handle) {
              continue;
            }

            const frame = await handle.contentFrame();
            if (frame && !frame.isDetached()) {
              card = frame;
              this.cardPaymentFrame = frame;
              break;
            }
          }
        }
      }

      if (!outer || !card) {
        await this.page.waitForTimeout(150);
      }
    }

    return { outer: outer ?? null, card: card ?? null };
  }

  private async findPayButtonInFrame(frame: Frame, timeout = 2000): Promise<Locator | null> {
    for (const selector of this.payNowSelectors) {
      const button = frame.locator(selector).first();
      const visible = await button.isVisible({ timeout }).catch(() => false);
      if (!visible) {
        continue;
      }

      const enabled = await button.isEnabled().catch(() => false);
      if (enabled) {
        return button;
      }
    }

    return null;
  }

  private async clickAcsSubmitButton(timeout = 20000): Promise<boolean> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const frames = new Set<Frame>();
      this.page.frames().forEach((frame) => frames.add(frame));
      this.page.context().pages().forEach((page) => page.frames().forEach((frame) => frames.add(frame)));

      for (const frame of frames) {
        if (frame.isDetached()) {
          continue;
        }

        const submit = frame.locator('input#acssubmit').first();
        const visible = await submit.isVisible({ timeout: 500 }).catch(() => false);
        if (!visible) {
          continue;
        }

        try {
          await submit.scrollIntoViewIfNeeded();
          await submit.click({ force: true });
          console.log('✅ ACS submit button clicked');

          await submit.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
          await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

          return true;
        } catch (error) {
          console.log('⚠️  Failed to click ACS submit button:', error.message);
        }
      }

      await this.page.waitForTimeout(500);
    }

    return false;
  }
}

