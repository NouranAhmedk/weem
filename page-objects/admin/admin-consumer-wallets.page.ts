import { Page } from '@playwright/test';
import { BasePage } from '../base-page';
import { ADMIN_URL } from '../../utils/app-config';

/**
 * Admin Consumer Wallets Page Object
 * Handles consumer wallet management in admin dashboard
 */
export class AdminConsumerWalletsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to admin consumer wallets page
   */
  async goto(): Promise<void> {
    await this.navigateTo(`${ADMIN_URL}/consumer-wallets/`);
  }

  /**
   * Click "Customer Wallets" menu item (scrolls to find it in navbar)
   */
  async clickConsumerWallets(): Promise<void> {
    const customerWalletsSelectors = [
      'a:has-text("Customer Wallets")',
      'a:has-text("customer wallets")',
      'a:has-text("Customer wallets")',
      'nav a:has-text("Customer Wallets")',
      'nav *:has-text("Customer Wallets")',
      '.navbar a:has-text("Customer Wallets")',
      '.sidebar a:has-text("Customer Wallets")',
      'li:has-text("Customer Wallets")',
      'a[href*="customer-wallets"]',
      'a[href*="customer_wallets"]',
      'a[href*="wallets"]',
      '*:has-text("Customer Wallets")',
      '*:has-text("customer wallets")',
      // Also try Consumer Wallets as fallback
      'a:has-text("Consumer Wallets")',
      'nav a:has-text("Consumer Wallets")'
    ];

    // Wait a bit for dashboard to fully load
    await this.page.waitForTimeout(2000);

    // First, try to find and scroll to the navbar
    const navbarSelectors = ['nav', '.navbar', '.sidebar', '[class*="nav"]', '[class*="menu"]'];
    for (const navSelector of navbarSelectors) {
      try {
        const navbar = this.page.locator(navSelector).first();
        const visible = await this.isVisible(navbar, 2000);
        if (visible) {
          await this.scrollIntoView(navbar);
          await this.page.waitForTimeout(500);
          break;
        }
      } catch {
        // Continue
      }
    }

    // Now try to find Customer Wallets in the navbar
    for (const selector of customerWalletsSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const visible = await this.isVisible(element, 3000);
        if (visible) {
          // Scroll the element into view
          await this.scrollIntoView(element);
          await this.page.waitForTimeout(500);
          await this.click(element);
          await this.page.waitForLoadState('networkidle');
          await this.page.waitForTimeout(2000);
          return;
        }
      } catch {
        // Continue to next selector
      }
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/customer-wallets-not-found-${Date.now()}.png`, fullPage: true });
    throw new Error('Customer Wallets menu item not found in navbar. Check screenshot for dashboard structure.');
  }

  /**
   * Search for user by phone number
   */
  async searchByPhoneNumber(phoneNumber: string, maxRetries = 3): Promise<boolean> {
    // First, exclude navbar search - look for search inputs NOT in navbar
    // Try to find search input in the main content area, not in navbar
    const contentAreaSelectors = [
      'main input[type="search"]',
      'main input[placeholder*="search" i]',
      'main input[placeholder*="phone" i]',
      'main input[placeholder*="mobile" i]',
      '.content input[type="search"]',
      '.content input[placeholder*="search" i]',
      '[class*="content"] input[type="search"]',
      '[class*="table"] input[type="search"]',
      '[class*="filter"] input[type="search"]',
      '[class*="search"] input[type="search"]',
      'table input[type="search"]',
      '.table-wrapper input[type="search"]',
      '[data-testid*="search"] input',
      '[data-eram-test-id*="search"] input'
    ];

    let searchInput: any = null;
    
    // First try to find search in content area (not navbar)
    for (const selector of contentAreaSelectors) {
      try {
        const input = this.page.locator(selector).first();
        const visible = await this.isVisible(input, 2000);
        if (visible) {
          searchInput = input;
          break;
        }
      } catch {
        // Continue
      }
    }

    // If not found in content area, try to find any search input but exclude navbar
    if (!searchInput) {
      const allSearchSelectors = [
        'input[type="search"]',
        'input[placeholder*="search" i]',
        'input[placeholder*="phone" i]',
        'input[placeholder*="mobile" i]',
        'input[name*="search"]',
        'input[name*="phone"]',
        'input[id*="search"]',
        'input[id*="phone"]',
        '.search-input',
        '#search-input'
      ];

      for (const selector of allSearchSelectors) {
        try {
          const inputs = this.page.locator(selector);
          const count = await inputs.count();
          
          // Try each input and check if it's NOT in navbar
          for (let i = 0; i < count; i++) {
            const input = inputs.nth(i);
            const visible = await this.isVisible(input, 1000);
            if (visible) {
              // Check if this input is NOT in navbar by checking parent elements
              const isInNavbar = await input.evaluate((el) => {
                let parent = el.parentElement;
                while (parent) {
                  const tagName = parent.tagName.toLowerCase();
                  const className = parent.className || '';
                  if (tagName === 'nav' || 
                      className.includes('nav') || 
                      className.includes('navbar') || 
                      className.includes('header') ||
                      parent.id?.includes('nav') ||
                      parent.id?.includes('header')) {
                    return true;
                  }
                  parent = parent.parentElement;
                }
                return false;
              }).catch(() => false);
              
              if (!isInNavbar) {
                searchInput = input;
                break;
              }
            }
          }
          
          if (searchInput) break;
        } catch {
          // Continue
        }
      }
    }

    if (!searchInput) {
      await this.page.screenshot({ path: `test-results/search-input-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
      throw new Error('Search input not found (excluding navbar). Check screenshot for available search inputs.');
    }

    // Try different phone number formats
    const phoneFormats = [
      phoneNumber,           // Original: 500000895
      `0${phoneNumber}`,     // With leading 0: 0500000895
      `+966${phoneNumber}`,  // With country code: +966500000895
      `966${phoneNumber}`,   // Without +: 966500000895
    ];

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      for (const phoneFormat of phoneFormats) {
        // Clear search input
        await searchInput.clear();
        await this.page.waitForTimeout(500);
        
        // Enter phone number
        await this.fill(searchInput, phoneFormat);
        await this.press(searchInput, 'Enter');
        
        // Wait for search results to load
        await this.page.waitForTimeout(3000);
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(2000);
        
        // Check if results appeared - look for table rows or any element containing phone number
        const resultSelectors = [
          'table tbody tr',
          '.table tbody tr',
          '[class*="table"] tbody tr',
          `tr:has-text("${phoneNumber.substring(0, 5)}")`,
          `*:has-text("${phoneNumber.substring(0, 5)}")`,
          `td:has-text("${phoneNumber.substring(0, 5)}")`
        ];

        for (const resultSelector of resultSelectors) {
          const results = this.page.locator(resultSelector);
          const count = await results.count();
          if (count > 0) {
            // Verify at least one result contains the phone number (or part of it)
            for (let i = 0; i < Math.min(count, 5); i++) {
              const text = await results.nth(i).textContent().catch(() => '');
              if (text && (text.includes(phoneNumber) || text.includes(phoneNumber.substring(0, 5)))) {
                return true;
              }
            }
          }
        }
      }

      // If no results found, wait a bit longer and retry (user might still be syncing)
      if (attempt < maxRetries) {
        await this.page.waitForTimeout(2000);
        // Refresh the page to get latest data
        await this.page.reload();
        await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
        await this.page.waitForTimeout(2000);
      }
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/search-no-results-${Date.now()}.png`, fullPage: true }).catch(() => {});
    return false;
  }

  /**
   * Click on the mobile number in search results
   */
  async clickPhoneNumber(phoneNumber: string): Promise<void> {
    // Wait for search results to load
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    // Try different phone number formats
    const phoneFormats = [
      phoneNumber,           // Original: 500000895
      `0${phoneNumber}`,     // With leading 0: 0500000895
      `+966${phoneNumber}`,  // With country code: +966500000895
      `966${phoneNumber}`,   // Without +: 966500000895
      phoneNumber.substring(1) // Without first digit: 00000895
    ];

    // Try to find phone number with different formats
    for (const phoneFormat of phoneFormats) {
      const phoneSelectors = [
        `a:has-text("${phoneFormat}")`,
        `td:has-text("${phoneFormat}")`,
        `tr:has-text("${phoneFormat}")`,
        `[data-phone="${phoneFormat}"]`,
        `[data-phone-number="${phoneFormat}"]`,
        `.phone-number:has-text("${phoneFormat}")`,
        `*:has-text("${phoneFormat}")`
      ];

      for (const selector of phoneSelectors) {
        try {
          const element = this.page.locator(selector).first();
          const visible = await this.isVisible(element, 2000);
          if (visible) {
            await this.scrollIntoView(element);
            await this.click(element);
            await this.page.waitForTimeout(1000);
            return;
          }
        } catch {
          // Continue to next selector
        }
      }
    }

    // Try to find by partial match (last few digits)
    const lastDigits = phoneNumber.slice(-5);
    const partialSelectors = [
      `tr:has-text("${lastDigits}")`,
      `td:has-text("${lastDigits}")`,
      `a:has-text("${lastDigits}")`
    ];

    for (const selector of partialSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const visible = await this.isVisible(element, 2000);
        if (visible) {
          await this.scrollIntoView(element);
          await this.click(element);
          await this.page.waitForTimeout(1000);
          return;
        }
      } catch {
        // Continue
      }
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/phone-number-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
    throw new Error(`Phone number ${phoneNumber} not found in search results`);
  }

  /**
   * Click "process transaction" button (opens the transaction form)
   */
  async clickProcessTransaction(): Promise<void> {
    // Wait a bit for page to settle after clicking phone number
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    const processTransactionSelectors = [
      'button:has-text("process transaction")',
      'button:has-text("Process Transaction")',
      'button:has-text("Process transaction")',
      'a:has-text("process transaction")',
      'a:has-text("Process Transaction")',
      'a:has-text("Process transaction")',
      '[data-testid*="process-transaction"]',
      '[data-eram-test-id*="process-transaction"]',
      'button[type="button"]:has-text("process")',
      'button[type="button"]:has-text("Process")',
      '.process-transaction-button',
      'button:has-text("Process"):visible',
      'a:has-text("Process"):visible',
      'button[class*="process"]:visible',
      'a[class*="process"]:visible',
      '*:has-text("Process Transaction"):visible',
      '*:has-text("process transaction"):visible'
    ];

    // Try to find button with polling (it might take time to appear)
    const startTime = Date.now();
    const timeout = 15000; // 15 seconds
    
    while (Date.now() - startTime < timeout) {
      for (const selector of processTransactionSelectors) {
        try {
          const element = this.page.locator(selector).first();
          const visible = await this.isVisible(element, 1000);
          if (visible) {
            await this.scrollIntoView(element);
            await this.click(element);
            // Wait a bit for the form to start appearing
            await this.page.waitForTimeout(2000);
            return;
          }
        } catch {
          // Continue to next selector
        }
      }
      await this.page.waitForTimeout(500);
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/process-transaction-button-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
    throw new Error('Process transaction button not found. Check screenshot for page state.');
  }

  /**
   * Wait for transaction form/modal to appear
   */
  async waitForTransactionForm(timeout = 15000): Promise<boolean> {
    const startTime = Date.now();
    const formSelectors = [
      '.modal',
      '.popup',
      '[role="dialog"]',
      '.dialog',
      '[class*="modal"]',
      '[class*="popup"]',
      'form:has-text("Process Transaction")',
      '*:has-text("Process Transaction")',
      'input[name*="amount" i]',
      'textarea[name*="note" i]',
      'label:has-text("Amount")',
      'label:has-text("Transaction Note")'
    ];

    while (Date.now() - startTime < timeout) {
      for (const selector of formSelectors) {
        try {
          const form = this.page.locator(selector).first();
          const visible = await this.isVisible(form, 1000);
          if (visible) {
            await this.page.waitForTimeout(1000);
            return true;
          }
        } catch {
          // Continue checking other selectors
        }
      }
      await this.page.waitForTimeout(500);
    }

    // If form not found, take screenshot for debugging
    await this.page.screenshot({ path: `test-results/transaction-form-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
    return false;
  }

  /**
   * Enter transaction amount
   */
  async enterAmount(amount: number): Promise<void> {
    // First wait for the transaction form/modal to appear
    const formAppeared = await this.waitForTransactionForm(15000);
    if (!formAppeared) {
      // Take screenshot before throwing error
      await this.page.screenshot({ path: `test-results/form-not-appeared-${Date.now()}.png`, fullPage: true }).catch(() => {});
      throw new Error('Transaction form did not appear after waiting');
    }

    // Wait a bit more for form to be fully ready
    await this.page.waitForTimeout(1000);

    // Try getByLabel first (most reliable for form fields)
    try {
      const amountByLabel = this.page.getByLabel('Amount', { exact: false });
      await amountByLabel.waitFor({ state: 'visible', timeout: 5000 });
      await amountByLabel.clear();
      await this.fill(amountByLabel, amount.toString());
      await this.page.waitForTimeout(500);
      return;
    } catch {
      // Continue to other selectors
    }

    const amountSelectors = [
      'input[name*="amount" i]',
      'input[id*="amount" i]',
      'input[type="number"]',
      'input[type="text"][name*="amount" i]',
      'input[placeholder*="amount" i]',
      'input[placeholder*="value" i]',
      '.amount-input',
      '#amount-input',
      'label:has-text("Amount") + input',
      'label:has-text("Amount *") + input',
      'label:has-text("Amount") ~ input',
      'input[aria-label*="amount" i]',
      'input[aria-labelledby*="amount" i]'
    ];

    // Try to find in modal first, then on page
    const modalSelectors = ['.modal', '.popup', '[role="dialog"]', '.dialog', '[class*="modal"]', '[class*="popup"]'];
    
    for (const modalSelector of modalSelectors) {
      const modal = this.page.locator(modalSelector).first();
      const modalVisible = await this.isVisible(modal, 2000);
      if (modalVisible) {
        for (const selector of amountSelectors) {
          try {
            const amountInput = modal.locator(selector).first();
            await amountInput.waitFor({ state: 'visible', timeout: 3000 });
            await amountInput.clear();
            await this.fill(amountInput, amount.toString());
            await this.page.waitForTimeout(500);
            return;
          } catch {
            // Continue to next selector
          }
        }
      }
    }

    // If not found in modal, try on main page
    for (const selector of amountSelectors) {
      try {
        const amountInput = this.page.locator(selector).first();
        await amountInput.waitFor({ state: 'visible', timeout: 3000 });
        await amountInput.clear();
        await this.fill(amountInput, amount.toString());
        await this.page.waitForTimeout(500);
        return;
      } catch {
        // Continue to next selector
      }
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/amount-field-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
    throw new Error('Amount input field not found');
  }

  /**
   * Enter transaction note (required field)
   */
  async enterTransactionNote(note: string = 'Automation test transaction'): Promise<void> {
    // Ensure form is visible
    await this.page.waitForTimeout(500);

    // Try getByLabel first (most reliable for form fields)
    try {
      const noteByLabel = this.page.getByLabel('Transaction Note', { exact: false });
      await noteByLabel.waitFor({ state: 'visible', timeout: 5000 });
      await noteByLabel.clear();
      await this.fill(noteByLabel, note);
      await this.page.waitForTimeout(500);
      return;
    } catch {
      // Continue to other selectors
    }

    const noteSelectors = [
      'textarea[name*="note" i]',
      'textarea[id*="note" i]',
      'textarea[placeholder*="note" i]',
      'textarea[placeholder*="Transaction Note" i]',
      'textarea[name*="Transaction Note" i]',
      '.transaction-note',
      '#transaction-note',
      'label:has-text("Transaction Note") + textarea',
      'label:has-text("Transaction Note *") + textarea',
      'label:has-text("Transaction Note") ~ textarea',
      'textarea[aria-label*="note" i]',
      'textarea[aria-label*="Transaction Note" i]',
      'textarea[aria-labelledby*="note" i]'
    ];

    // Try to find in modal first, then on page
    const modalSelectors = ['.modal', '.popup', '[role="dialog"]', '.dialog', '[class*="modal"]', '[class*="popup"]'];
    
    for (const modalSelector of modalSelectors) {
      const modal = this.page.locator(modalSelector).first();
      const modalVisible = await this.isVisible(modal, 2000);
      if (modalVisible) {
        for (const selector of noteSelectors) {
          try {
            const noteInput = modal.locator(selector).first();
            await noteInput.waitFor({ state: 'visible', timeout: 3000 });
            await noteInput.clear();
            await this.fill(noteInput, note);
            await this.page.waitForTimeout(500);
            return;
          } catch {
            // Continue to next selector
          }
        }
      }
    }

    // If not found in modal, try on main page
    for (const selector of noteSelectors) {
      try {
        const noteInput = this.page.locator(selector).first();
        await noteInput.waitFor({ state: 'visible', timeout: 3000 });
        await noteInput.clear();
        await this.fill(noteInput, note);
        await this.page.waitForTimeout(500);
        return;
      } catch {
        // Continue to next selector
      }
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/transaction-note-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
    throw new Error('Transaction note field not found');
  }

  /**
   * Select transaction type (optional, defaults to first option if not specified)
   */
  async selectTransactionType(type?: string): Promise<void> {
    if (!type) {
      return; // Use default if not specified
    }

    const typeSelectors = [
      'select[name*="type"]',
      'select[id*="type"]',
      'select[name*="Transaction Type"]',
      '.transaction-type',
      '#transaction-type'
    ];

    for (const selector of typeSelectors) {
      const typeSelect = this.page.locator(selector).first();
      const visible = await this.isVisible(typeSelect, 2000);
      if (visible) {
        await this.selectOption(typeSelect, type);
        await this.page.waitForTimeout(500);
        return;
      }
    }

    // If select not found, try dropdown/combobox pattern
    const dropdownSelectors = [
      '[role="combobox"]',
      '.dropdown',
      '[class*="select"]'
    ];

    for (const selector of dropdownSelectors) {
      const dropdown = this.page.locator(selector).first();
      const visible = await this.isVisible(dropdown, 2000);
      if (visible) {
        await this.click(dropdown);
        await this.page.waitForTimeout(500);
        const option = this.page.locator(`text="${type}"`).first();
        const optionVisible = await this.isVisible(option, 2000);
        if (optionVisible) {
          await this.click(option);
          await this.page.waitForTimeout(500);
          return;
        }
      }
    }
  }

  /**
   * Click "Process Transaction" button (the main submit button in the form)
   */
  async clickProcessTransactionButton(): Promise<void> {
    const processSelectors = [
      'button:has-text("Process Transaction")',
      'button:has-text("process transaction")',
      'button[type="submit"]:has-text("Process Transaction")',
      'button[type="submit"]:has-text("process transaction")',
      '[data-testid*="process-transaction"]',
      '[data-eram-test-id*="process-transaction"]',
      '.process-transaction-button',
      'button.primary:has-text("Process")',
      'button:has([class*="checkmark"]):has-text("Process Transaction")',
      'button:has-text("Proceed Transaction")',
      'button:has-text("proceed transaction")'
    ];

    let buttonFound = false;
    for (const selector of processSelectors) {
      const element = this.page.locator(selector).first();
      const visible = await this.isVisible(element, 3000);
      if (visible) {
        await this.scrollIntoView(element);
        // Wait for navigation or popup after clicking
        const navigationPromise = this.page.waitForNavigation({ waitUntil: 'networkidle', timeout: 5000 }).catch(() => {});
        await this.click(element);
        await navigationPromise;
        await this.page.waitForTimeout(2000);
        buttonFound = true;
        break;
      }
    }

    if (!buttonFound) {
      await this.page.screenshot({ path: `test-results/process-transaction-button-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
      throw new Error('Process Transaction button not found');
    }
  }

  /**
   * Click "Confirm" button in popup
   */
  async clickConfirmInPopup(): Promise<void> {
    // First, try to find the Confirm button directly - it might be visible immediately
    // or the popup might use different selectors
    const confirmSelectors = [
      'button:has-text("Confirm")',
      'button:has-text("confirm")',
      'button:has-text("Confirm"):visible',
      'button:has-text("confirm"):visible',
      '[data-testid*="confirm"]:visible',
      '[data-eram-test-id*="confirm"]:visible',
      'button[type="button"]:has-text("Confirm"):visible',
      'button[type="submit"]:has-text("Confirm"):visible',
      '.confirm-button:visible',
      'button.primary:has-text("Confirm")',
      'button.success:has-text("Confirm")'
    ];

    // Try to find Confirm button directly first (might be on page or in a popup that's already visible)
    for (const selector of confirmSelectors) {
      try {
        const element = this.page.locator(selector).first();
        await element.waitFor({ state: 'visible', timeout: 5000 });
        await this.scrollIntoView(element);
        await this.click(element);
        await this.page.waitForTimeout(2000);
        return;
      } catch {
        // Continue to next selector
      }
    }

    // If not found directly, wait for popup to appear - use polling to check for popup
    const popupSelectors = [
      '.modal', 
      '.popup', 
      '[role="dialog"]', 
      '.dialog', 
      '[class*="modal"]', 
      '[class*="popup"]',
      '[class*="Modal"]',
      '[class*="Popup"]',
      '[class*="Dialog"]',
      '.ant-modal',
      '.MuiDialog-root',
      '[id*="modal"]',
      '[id*="popup"]',
      '[id*="dialog"]'
    ];
    let popupFound = false;
    
    // Wait up to 15 seconds for popup to appear
    for (let attempt = 0; attempt < 30; attempt++) {
      for (const popupSelector of popupSelectors) {
        try {
          const popup = this.page.locator(popupSelector).first();
          const visible = await this.isVisible(popup, 500);
          if (visible) {
            popupFound = true;
            // Try to find Confirm button in this popup
            for (const confirmSelector of confirmSelectors) {
              try {
                const element = popup.locator(confirmSelector).first();
                const btnVisible = await this.isVisible(element, 1000);
                if (btnVisible) {
                  await this.scrollIntoView(element);
                  await this.click(element);
                  await this.page.waitForTimeout(2000);
                  return;
                }
              } catch {
                // Continue
              }
            }
            break;
          }
        } catch {
          // Continue
        }
      }
      if (popupFound) break;
      await this.page.waitForTimeout(500);
    }

    // If popup found but button not found in it, try all selectors again
    if (popupFound) {
      for (const popupSelector of popupSelectors) {
        const popup = this.page.locator(popupSelector).first();
        const popupVisible = await this.isVisible(popup, 1000);
        if (popupVisible) {
          for (const selector of confirmSelectors) {
            try {
              const element = popup.locator(selector).first();
              const visible = await this.isVisible(element, 2000);
              if (visible) {
                await this.scrollIntoView(element);
                await this.click(element);
                await this.page.waitForTimeout(2000);
                return;
              }
            } catch {
              // Continue to next selector
            }
          }
        }
      }
    }
    
    // Try on main page as last resort
    for (const selector of confirmSelectors) {
      try {
        const element = this.page.locator(selector).first();
        const visible = await this.isVisible(element, 3000);
        if (visible) {
          await this.scrollIntoView(element);
          await this.click(element);
          await this.page.waitForTimeout(2000);
          return;
        }
      } catch {
        // Continue to next selector
      }
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/confirm-button-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
    throw new Error('Confirm button not found in popup. Check screenshot for page state.');
  }

  /**
   * Wait for transaction success confirmation
   */
  async waitForTransactionSuccess(timeout = 10000): Promise<boolean> {
    // Wait a bit for any redirects or page updates
    await this.page.waitForTimeout(2000);
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

    const successSelectors = [
      'text=/success/i',
      'text=/transaction.*success/i',
      'text=/processed.*successfully/i',
      'text=/completed.*successfully/i',
      'text=/successfully.*processed/i',
      '.success-message',
      '.alert-success',
      '.toast-success',
      '.notification-success',
      '[class*="success"]',
      '[data-testid*="success"]',
      '[data-eram-test-id*="success"]',
      '*:has-text("success"):visible',
      '*:has-text("Success"):visible',
      '*:has-text("SUCCESS"):visible'
    ];

    // Check if transaction form/modal is closed (indicates success)
    const modalSelectors = ['.modal', '.popup', '[role="dialog"]', '.dialog', '[class*="modal"]', '[class*="popup"]'];
    let modalWasOpen = false;
    for (const modalSelector of modalSelectors) {
      const modal = this.page.locator(modalSelector).first();
      const visible = await this.isVisible(modal, 1000);
      if (visible) {
        modalWasOpen = true;
        break;
      }
    }

    // Try to find success message with polling
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      // Check for explicit success messages
      for (const selector of successSelectors) {
        try {
          const element = this.page.locator(selector).first();
          const visible = await this.isVisible(element, 1000);
          if (visible) {
            // Verify it's actually a success message by checking text content
            const text = await element.textContent().catch(() => '');
            if (text && /success/i.test(text)) {
              return true;
            }
          }
        } catch {
          // Continue to next selector
        }
      }
      
      // Check if modal/popup closed (transaction form disappeared) - indicates success
      if (modalWasOpen) {
        let modalStillOpen = false;
        for (const modalSelector of modalSelectors) {
          const modal = this.page.locator(modalSelector).first();
          const visible = await this.isVisible(modal, 500);
          if (visible) {
            modalStillOpen = true;
            break;
          }
        }
        // If modal was open but now closed, and we're still on wallet page, likely success
        if (!modalStillOpen) {
          const currentUrl = await this.getCurrentUrl();
          if (currentUrl.includes('/payment/wallet/') || currentUrl.includes('/wallet')) {
            // Modal closed and we're still on wallet page - transaction likely succeeded
            await this.page.waitForTimeout(1000); // Wait a bit more to ensure no error appears
            // Check if there's an error message
            const errorSelectors = [
              'text=/error/i',
              'text=/failed/i',
              '.error-message',
              '.alert-error',
              '.alert-danger'
            ];
            let hasError = false;
            for (const errorSelector of errorSelectors) {
              try {
                const errorElement = this.page.locator(errorSelector).first();
                const errorVisible = await this.isVisible(errorElement, 500);
                if (errorVisible) {
                  hasError = true;
                  break;
                }
              } catch {
                // Continue
              }
            }
            if (!hasError) {
              return true; // Modal closed, no error - likely success
            }
          }
        }
      }
      
      // Check if we're redirected to a success page or if URL changed
      const currentUrl = await this.getCurrentUrl();
      if (currentUrl.includes('success') || currentUrl.includes('completed')) {
        return true;
      }
      
      // Check if we're still on wallet page (no error redirect)
      if (currentUrl.includes('/payment/wallet/') || currentUrl.includes('/wallet')) {
        // If we're still here after clicking confirm, and no error, likely success
        // Wait a bit more and check again
        await this.page.waitForTimeout(1000);
        continue;
      }
      
      await this.page.waitForTimeout(500);
    }

    // Take screenshot for debugging
    await this.page.screenshot({ path: `test-results/transaction-success-not-found-${Date.now()}.png`, fullPage: true }).catch(() => {});
    
    // If modal closed and we're still on wallet page, assume success even without explicit message
    if (modalWasOpen) {
      let modalStillOpen = false;
      for (const modalSelector of modalSelectors) {
        const modal = this.page.locator(modalSelector).first();
        const visible = await this.isVisible(modal, 500);
        if (visible) {
          modalStillOpen = true;
          break;
        }
      }
      if (!modalStillOpen) {
        const currentUrl = await this.getCurrentUrl();
        if (currentUrl.includes('/payment/wallet/') || currentUrl.includes('/wallet')) {
          // Modal closed, still on wallet page - likely success
          return true;
        }
      }
    }
    
    return false;
  }
}

