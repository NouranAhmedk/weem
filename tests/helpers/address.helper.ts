import { Page, Locator } from '@playwright/test';

/**
 * Address Helper
 * Encapsulates address map interactions with resilient selectors
 */
export class AddressHelper {
  constructor(private page: Page) {}

  private readonly searchSelectors = [
    'input.pac-target-input',
    'input#search-input.pac-target-input',
    'input.pac-target-input[placeholder*="location" i]',
    'input.pac-target-input[placeholder*="search" i]',
    '[data-eram-test-id="address-map"] input[placeholder*="location" i]',
    '[data-eram-test-id*="map"] input[placeholder*="search" i]'
  ];

  private readonly suggestionSelectors = [
    '[data-eram-test-id*="search-result"]',
    'li[role="option"]',
    '.pac-item',
    'button:has-text("Use this location")',
    'button:has-text("Use this Location")'
  ];

  private readonly confirmSelectors = [
    '[data-eram-test-id*="confirm-location"]',
    'button:has-text("Confirm Location")',
    'button:has-text("Confirm location")',
    'button:has-text("Use this location")',
    'button:has-text("Add address")',
    'button:has-text("Add Address")',
    'button:has-text("Continue")',
    'button:has-text("Next")'
  ];

  private readonly addressNameSelectors = [
    '[data-eram-test-id*="address-name"]',
    'input[placeholder*="address name" i]',
    'input[placeholder*="name" i]',
    'input[placeholder*="title" i]',
    'input[placeholder*="nickname" i]',
    'input[aria-label*="address" i]',
    'input[name*="address" i]',
    'input[id*="address" i]'
  ];

  private readonly submitSelectors = [
    '[data-eram-test-id*="submit"]',
    '[data-eram-test-id*="save"]',
    'button:has-text("Save")',
    'button:has-text("Submit")',
    'button:has-text("Add Address")',
    'button[type="submit"]'
  ];

  private readonly errorSelectors = [
    '[data-eram-test-id*="error"]',
    'text=/outside service/i',
    'text=/not deliver/i',
    'text=/not available/i',
    '.error-message',
    '.alert-error'
  ];

  /**
   * Wait for map UI to load (search input visible)
   */
  async waitForMapToLoad(timeout = 15000): Promise<boolean> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      for (const selector of this.searchSelectors) {
        const input = this.page.locator(selector).first();
        const visible = await input.isVisible({ timeout: 500 }).catch(() => false);
        if (visible) {
          return true;
        }
      }

      // Wait briefly before retrying
      await this.page.waitForTimeout(500);
    }

    console.log('⚠️ Map search input not detected within timeout');
    return false;
  }

  /**
   * Search for a location and select the first suggestion
   */
  async searchAndSelectLocation(query: string): Promise<boolean> {
    const searchInput = await this.findFirstVisibleLocator(this.searchSelectors);

    if (!searchInput) {
      console.log('⚠️ Unable to locate map search input');
      return false;
    }

    await searchInput.click({ delay: 50 });
    await searchInput.fill('');
    await searchInput.type(query, { delay: 50 });
    await searchInput.press('Enter').catch(() => undefined);
    await this.page.waitForTimeout(1500);

    // Try to click on suggestion
    const suggestion = await this.findFirstVisibleLocator(this.suggestionSelectors);
    if (suggestion) {
      await suggestion.click({ delay: 50 });
      await this.page.waitForTimeout(1500);
      return true;
    }

    // If no suggestion visible, rely on Enter action
    console.log('⚠️ No suggestion element clicked, relying on Enter result');
    return true;
  }

  /**
   * Click confirm location button if available
   */
  async confirmLocation(): Promise<boolean> {
    const confirmButton = await this.findFirstVisibleLocator(this.confirmSelectors);
    if (confirmButton) {
      await confirmButton.click({ delay: 50 });
      await this.page.waitForTimeout(2000);
      return true;
    }

    console.log('⚠️ Confirm location button not found');
    return false;
  }

  /**
   * Fill address name input (and optional details)
   */
  async fillAddressDetails(addressName: string, additionalDetails?: string): Promise<boolean> {
    await this.page.waitForTimeout(1500);

    const form = await this.findFirstVisibleLocator(
      ['[data-eram-test-id*="address-form"]', 'form'],
      5000
    );

    if (!form) {
      console.log('⚠️ Address form container not located');
      return false;
    }

    await this.selectOtherAddressType();

    const fillableInputs = form.locator(':scope input:not([type="radio"]):not([type="checkbox"]):not([readonly])');
    const inputCount = await fillableInputs.count();

    if (inputCount === 0) {
      console.log('⚠️ No editable inputs detected inside address form');
      return false;
    }

    let nameInput: Locator | null = null;

    for (let i = 0; i < inputCount; i++) {
      const input = fillableInputs.nth(i);
      const id = (await input.getAttribute('id')) || '';
      const nameAttr = ((await input.getAttribute('name')) || '').toLowerCase();
      const placeholder = ((await input.getAttribute('placeholder')) || '').toLowerCase();
      const typeAttr = ((await input.getAttribute('type')) || '').toLowerCase();

      if (id === 'search-input' || placeholder.includes('location') || typeAttr === 'hidden') {
        continue;
      }

      const isNameField =
        placeholder.includes('name') ||
        placeholder.includes('title') ||
        placeholder.includes('nickname') ||
        nameAttr.includes('name') ||
        nameAttr.includes('title');

      if (isNameField) {
        nameInput = input;
        break;
      }

      if (!nameInput) {
        nameInput = input;
      }
    }

    if (!nameInput) {
      console.log('⚠️ Unable to find address name input');
      return false;
    }

    await nameInput.fill(addressName);
    await nameInput.press('Enter').catch(() => undefined);

    // Populate remaining empty inputs with sensible values
    for (let i = 0; i < inputCount; i++) {
      const input = fillableInputs.nth(i);
      const empty = await input.inputValue().catch(() => '');
      if (empty) continue;

      const nameAttr = ((await input.getAttribute('name')) || '').toLowerCase();
      const placeholder = ((await input.getAttribute('placeholder')) || '').toLowerCase();

      if (nameAttr.includes('phone') || placeholder.includes('phone')) {
        await input.fill(`5${Math.floor(100000000 + Math.random() * 900000000)}`.slice(0, 9)).catch(() => undefined);
      } else if (nameAttr.includes('building') || placeholder.includes('building')) {
        await input.fill('123').catch(() => undefined);
      } else if (nameAttr.includes('street') || placeholder.includes('street')) {
        await input.fill('Automation Street').catch(() => undefined);
      } else if (nameAttr.includes('floor') || placeholder.includes('floor')) {
        await input.fill('1').catch(() => undefined);
      } else {
        await input.fill(`Auto Field ${i + 1}`).catch(() => undefined);
      }
    }

    const textareaLocator = form.locator(':scope textarea');
    const hasTextarea = await textareaLocator.count();
    if (hasTextarea > 0) {
      const detailTextarea = textareaLocator.first();
      await detailTextarea.fill(additionalDetails || 'Automated address details').catch(() => undefined);
    }

    return true;
  }

  /**
   * Submit address form
   */
  async submitAddress(): Promise<boolean> {
    const submitButton = await this.findFirstVisibleLocator(this.submitSelectors);
    if (!submitButton) {
      console.log('⚠️ Submit button not found');
      return false;
    }

    await submitButton.click({ delay: 50 });
    await this.page.waitForTimeout(3000);
    return true;
  }

  /**
   * Wait for address success confirmation
   */
  async waitForSuccess(addressName: string, timeout = 10000): Promise<boolean> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const successMessage = this.page.locator(
        'text=/address added|saved successfully|success|تم الحفظ/i'
      ).first();
      const visible = await successMessage.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        return true;
      }

      // Check if address appears in list
      const addressCard = this.page.locator(`text=/.*${this.escapeRegex(addressName)}.*/i`).first();
      const cardVisible = await addressCard.isVisible({ timeout: 500 }).catch(() => false);
      if (cardVisible) {
        return true;
      }

      // Check URL for addresses page
      const currentUrl = this.page.url();
      if (currentUrl.includes('/addresses')) {
        return true;
      }

      await this.page.waitForTimeout(500);
    }

    console.log('⚠️ Success confirmation not detected');
    return false;
  }

  async waitForAddressesPage(timeout = 15000): Promise<boolean> {
    try {
      await this.page.waitForURL(/\/addresses/i, { timeout });
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => undefined);
      return true;
    } catch {
      return false;
    }
  }

  async addressExists(addressName: string, timeout = 10000): Promise<boolean> {
    const start = Date.now();
    const pattern = this.escapeRegex(addressName);

    while (Date.now() - start < timeout) {
      const card = this.page.locator(`text=/${pattern}/i`).first();
      const visible = await card.isVisible({ timeout: 500 }).catch(() => false);
      if (visible) {
        return true;
      }

      await this.page.waitForTimeout(500);
    }

    console.log(`⚠️ Saved address "${addressName}" not visible after submission`);
    return false;
  }

  /**
   * Complete full address creation flow (assumes map view is already open)
   */
  async addAddress(addressName: string, location: string, additionalDetails?: string): Promise<boolean> {
    const searched = await this.searchAndSelectLocation(location);
    if (!searched) {
      console.log('⚠️ Failed to search location while adding address');
      return false;
    }

    const confirmed = await this.confirmLocation();
    if (!confirmed) {
      console.log('⚠️ Unable to confirm location while adding address');
      return false;
    }

    const filled = await this.fillAddressDetails(addressName, additionalDetails);
    if (!filled) {
      console.log('⚠️ Unable to fill address form');
      return false;
    }

    const submitted = await this.submitAddress();
    if (!submitted) {
      console.log('⚠️ Unable to submit address form');
      return false;
    }

    await this.waitForAddressesPage();
    const success = await this.waitForSuccess(addressName);
    if (!success) {
      console.log('⚠️ Address success confirmation not detected');
      return false;
    }

    const exists = await this.addressExists(addressName);
    return exists;
  }

  /**
   * Detect outside service area error
   */
  async waitForServiceError(timeout = 10000): Promise<{ found: boolean; message?: string }> {
    const start = Date.now();

    while (Date.now() - start < timeout) {
      const errorLocator = await this.findFirstVisibleLocator(this.errorSelectors, 500);
      if (errorLocator) {
        const message = await errorLocator.textContent().catch(() => '');
        return { found: true, message: message?.trim() };
      }

      await this.page.waitForTimeout(500);
    }

    return { found: false };
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Find the first visible locator from a list of selectors
   */
  private async findFirstVisibleLocator(
    selectors: string[],
    timeout = 2000,
    predicate?: (locator: Locator) => Promise<boolean>
  ): Promise<Locator | null> {
    for (const selector of selectors) {
      const locator = this.page.locator(selector).first();
      const visible = await locator.isVisible({ timeout }).catch(() => false);
      if (visible) {
        if (predicate) {
          const matches = await predicate(locator).catch(() => false);
          if (!matches) {
            continue;
          }
        }

        console.log(`Using selector: ${selector}`);
        return locator;
      }
    }

    return null;
  }

  /**
   * Attempt to select "Other" address type to reveal custom name input
   */
  private async selectOtherAddressType(): Promise<void> {
    const otherSelectors = [
      'label:has-text("Other")',
      'label:has-text("OTHER")',
      'input[type="radio"][value="OTHER"]',
      'input[type="radio"][value="other"]'
    ];

    const otherOption = await this.findFirstVisibleLocator(otherSelectors, 1000);
    if (!otherOption) {
      return;
    }

    const tag = await otherOption.evaluate((el) => el.tagName.toLowerCase()).catch(() => '');
    try {
      if (tag === 'input') {
        await otherOption.check({ force: true });
      } else {
        await otherOption.click({ delay: 50 });
      }
      await this.page.waitForTimeout(500);
    } catch (error) {
      console.log(`⚠️ Unable to select "Other" address type: ${error instanceof Error ? error.message : error}`);
    }
  }
}


