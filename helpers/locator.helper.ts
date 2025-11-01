import { Page, Locator } from '@playwright/test';

/**
 * Locator Helper - Common locator strategies
 */
export class LocatorHelper {
  constructor(private page: Page) {}

  /**
   * Find element by ID
   */
  byId(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  /**
   * Find element by Name attribute
   */
  byName(name: string): Locator {
    return this.page.locator(`[name="${name}"]`);
  }

  /**
   * Find element by Class
   */
  byClass(className: string): Locator {
    return this.page.locator(`.${className}`);
  }

  /**
   * Find element by CSS Selector
   */
  byCss(css: string): Locator {
    return this.page.locator(css);
  }

  /**
   * Find element by XPath
   */
  byXPath(xpath: string): Locator {
    return this.page.locator(xpath);
  }

  /**
   * Find element by Text content
   */
  byText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Find element by Role
   */
  byRole(role: 'button' | 'link' | 'textbox' | 'heading' | 'checkbox' | 'radio', name?: string): Locator {
    return this.page.getByRole(role, name ? { name } : {});
  }

  /**
   * Find element by Alt text
   */
  byAltText(altText: string): Locator {
    return this.page.getByAltText(altText);
  }

  /**
   * Find element by Label
   */
  byLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  /**
   * Find element by Placeholder
   */
  byPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }

  /**
   * Find element by Title
   */
  byTitle(title: string): Locator {
    return this.page.getByTitle(title);
  }

  /**
   * Find element by Test ID
   */
  byTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Find element by data-eram-test-id attribute
   * PRIMARY METHOD for Weem application - use this for all Weem elements
   *
   * @param testId - The value of data-eram-test-id attribute
   * @returns Locator for the element
   *
   * @example
   * // Register button
   * locators.byEramTestId('user-dropdown-register-button')
   *
   * // OTP input field (indexed)
   * locators.byEramTestId('otp-input-0')
   *
   * // Category link (dynamic ID)
   * locators.byEramTestId(`category-${categoryId}-link`)
   *
   * // Product card (dynamic ID)
   * locators.byEramTestId(`product-image-${productId}-link`)
   */
  byEramTestId(testId: string): Locator {
    return this.page.locator(`[data-eram-test-id="${testId}"]`);
  }
}

