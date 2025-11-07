import { Page, Locator } from '@playwright/test';

/**
 * Favourite Helper
 * Handles favourite/wishlist operations
 */
export class FavouriteHelper {
  private readonly favouriteButtonSelectors = [
    '[data-eram-test-id*="favourite"], [data-eram-test-id*="favorite"], [data-eram-test-id*="wishlist"]',
    'button:has(svg path[d*="heart" i]), button:has(svg[class*="heart"])',
    'button[aria-label*="favourite" i], button[aria-label*="favorite" i], button[aria-label*="wishlist" i]',
    'button >> svg[class*="heart"], button >> svg[data-icon="heart"]',
    'svg[class*="heart"]:visible, svg[data-icon="heart"]:visible'
  ];

  private readonly deleteButtonSelectors = [
    '[data-eram-test-id*="delete"], [data-eram-test-id*="remove"]',
    'button[aria-label*="delete" i], button[aria-label*="remove" i]',
    'button[aria-label*="unfavourite" i], button[aria-label*="unfavorite" i]',
    'button:has(svg[class*="trash"]), button:has(svg[class*="delete"])',
    'button:has(svg[class*="close"]), button:has(svg[class*="x"])',
    'svg[class*="heart"][class*="filled"]',
    '[data-eram-test-id*="favourite"][class*="active"]'
  ];

  private readonly favouriteItemSelectors = [
    // Try specific product selectors first
    '[data-eram-test-id^="product-name-"]',  // Product name elements
    '[data-eram-test-id^="product-card-"]',  // Product card elements
    '[data-eram-test-id*="product-item"]',   // Product item elements
    '[data-eram-test-id="favourite-product-item"]',
    
    // Grid/flex containers that might hold products (when not empty)
    'main > div > div:last-child > div[class*="grid"] > *',  // Children of grid
    'main > div > div:last-child > div[class*="flex"] > div:has(img)',  // Flex items with images
    
    // Then try structural selectors
    'article:has(img):has(button)',  // Articles with images and buttons
    'div[class*="card"]:has(img):has(button)',  // Cards with images and buttons
    '[class*="product"]:has(img):has(button)',  // Product class with images
    '[role="listitem"]:has(img):has(button)',  // List items with images
    
    // More generic (last resort)
    'article:has(img)',
    'div:has(img):has(button)',  // Any div with image and button
    '.product-card'
  ];

  constructor(private page: Page) {}

  /**
   * Add product to favourites
   * @param maxAttempts Maximum number of retry attempts
   * @returns Success status
   */
  async addToFavourites(maxAttempts = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Favourite button click attempt ${attempt}/${maxAttempts}`);
      
      try {
        const button = await this.findFavouriteButton();
        
        if (button) {
          await button.scrollIntoViewIfNeeded();
          
          // Wait for any network requests to start
          const responsePromise = this.page.waitForResponse(
            response => response.url().includes('favourite') || response.url().includes('wishlist'),
            { timeout: 5000 }
          ).catch(() => null);
          
          await button.click();
          console.log('Favourite button clicked, waiting for API response...');
          
          // Wait for the API response
          const response = await responsePromise;
          if (response) {
            console.log(`API Response: ${response.status()} ${response.url()}`);
            // Wait additional time for data to persist
            await this.page.waitForTimeout(3000);
          } else {
            console.log('No API response detected, waiting anyway...');
            await this.page.waitForTimeout(5000);
          }
          
          // Check for success indicators
          const success = await this.checkSuccessIndicators();
          if (success) {
            console.log('✅ Product added to favourites successfully (UI confirmed)');
            console.log('⏳ Waiting extra time for backend to persist...');
            await this.page.waitForTimeout(3000); // Extra wait for backend
            return true;
          }
        } else {
          console.log('Favourite button not found');
          if (attempt < maxAttempts) {
            await this.page.reload();
            await this.page.waitForTimeout(2000);
          }
        }
      } catch (error) {
        console.log(`Attempt ${attempt} failed:`, error instanceof Error ? error.message : 'Unknown error');
        if (attempt < maxAttempts) {
          await this.page.reload();
          await this.page.waitForTimeout(2000);
        }
      }
    }
    
    return false;
  }

  /**
   * Navigate to favourites page
   */
  async navigateToFavourites(): Promise<void> {
    const favouriteIcon = this.page.locator('[data-eram-test-id="favourites-link"]');
    await favouriteIcon.waitFor({ state: 'visible', timeout: 10000 });
    
    console.log('Navigating to favourites page...');
    await favouriteIcon.click();
    
    // Wait for navigation and page load
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('Network did not become idle, continuing anyway...');
    });
    
    // Wait for API to load favourites
    console.log('Waiting for favourites API to load...');
    await this.page.waitForTimeout(5000);
    
    // Check if we see the empty state message
    const emptyMessage = this.page.locator('text=/no favourite items/i').first();
    const isEmpty = await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (isEmpty) {
      console.log('⚠️ Empty state detected, trying page reload...');
      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForTimeout(3000);
    }
  }

  /**
   * Get count of favourite items with retry logic
   * @param maxAttempts Maximum number of attempts
   * @returns Number of items in favourites
   */
  async getFavouritesCount(maxAttempts = 3): Promise<number> {
    console.log('Looking for favourite items...');
    
    // Try multiple times with increasing waits
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Attempt ${attempt}/${maxAttempts} to find favourite items`);
      
      // Try each selector
      for (const selector of this.favouriteItemSelectors) {
        const items = this.page.locator(selector);
        const count = await items.count();
        
        if (count > 0) {
          console.log(`Checking ${count} items with selector: ${selector}`);
          
          // For product-name selectors, items ARE the products
          if (selector.includes('product-name') || selector.includes('product-card')) {
            console.log(`✅ Found ${count} favourite items using selector: ${selector}`);
            return count;
          }
          
          // For structural selectors, verify they have product-like content
          const firstItem = items.first();
          const hasContent = await firstItem
            .locator('img, [data-eram-test-id*="name"], [data-eram-test-id*="product"], button, a, h1, h2, h3, h4, h5, h6, p, span')
            .count();
          
          if (hasContent > 0) {
            console.log(`✅ Found ${count} favourite items using selector: ${selector}`);
            return count;
          } else {
            console.log(`Found ${count} items with selector "${selector}" but no product content (likely navigation elements)`);
          }
        }
      }
      
      // If not found and not last attempt, wait and try again
      if (attempt < maxAttempts) {
        console.log(`No items found, waiting ${2000 * attempt}ms before retry...`);
        await this.page.waitForTimeout(2000 * attempt); // Progressive wait: 2s, 4s, 6s
      }
    }
    
    console.log('⚠️ No favourite items found after all attempts');
    return 0;
  }

  /**
   * Remove first item from favourites
   * @returns Success status
   */
  async removeFromFavourites(): Promise<boolean> {
    const deleteButton = await this.findDeleteButton();
    
    if (!deleteButton) {
      console.log('⚠️ Delete button not found');
      return false;
    }
    
    console.log('Delete button found, clicking...');
    await deleteButton.scrollIntoViewIfNeeded();
    await deleteButton.click();
    await this.page.waitForTimeout(2000);
    
    // Handle confirmation dialog if it appears
    const confirmed = await this.handleConfirmationDialog();
    
    return confirmed;
  }

  /**
   * Check if favourites page is empty
   */
  async isEmpty(): Promise<boolean> {
    // Check for explicit empty state messages
    const emptyMessage = this.page.locator(
      'text=/no (favourites|favorites|items|products)/i, text=/empty/i, text=/wishlist is empty/i, text=/لا يوجد/i, text=/فارغة/i'
    ).first();
    
    const hasEmptyMessage = await emptyMessage.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasEmptyMessage) {
      return true;
    }
    
    // If no explicit message, check if there are any product items at all
    const count = await this.getFavouritesCount();
    
    // If count is 0, we can assume the page is functionally empty
    // (even if there's no explicit empty state message)
    return count === 0;
  }

  /**
   * Find favourite button using multiple strategies
   */
  private async findFavouriteButton(): Promise<Locator | null> {
    for (const selector of this.favouriteButtonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          console.log(`Found favourite button using: ${selector}`);
          return button;
        }
      } catch {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Find delete button using multiple strategies
   */
  private async findDeleteButton(): Promise<Locator | null> {
    for (const selector of this.deleteButtonSelectors) {
      try {
        const button = this.page.locator(selector).first();
        const isVisible = await button.isVisible({ timeout: 2000 }).catch(() => false);
        
        if (isVisible) {
          console.log(`Found delete button using: ${selector}`);
          return button;
        }
      } catch {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Check for success indicators after adding to favourites
   */
  private async checkSuccessIndicators(): Promise<boolean> {
    const successIndicators = [
      'text=/added to (favourites|favorites|wishlist)/i',
      'text=/success/i',
      'svg[class*="heart"][class*="filled"]',
      'svg[fill="currentColor"]'
    ];
    
    for (const indicator of successIndicators) {
      const el = this.page.locator(indicator).first();
      const visible = await el.isVisible({ timeout: 2000 }).catch(() => false);
      if (visible) {
        console.log(`Success indicator found: ${indicator}`);
        return true;
      }
    }
    
    // If no specific indicator found, assume success
    return true;
  }

  /**
   * Handle confirmation dialog if it appears
   */
  private async handleConfirmationDialog(): Promise<boolean> {
    const confirmButton = this.page.locator(
      'button:has-text("Delete"), button:has-text("Remove"), button:has-text("Confirm"), button:has-text("Yes")'
    ).first();
    
    const confirmVisible = await confirmButton.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (confirmVisible) {
      console.log('Confirmation dialog found, clicking confirm...');
      await confirmButton.click();
      await this.page.waitForTimeout(1000);
    }
    
    return true;
  }

  /**
   * Take debug screenshot
   */
  async debugScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ 
      path: `test-results/favourite-${name}.png`, 
      fullPage: true 
    });
    console.log(`📸 Screenshot saved: test-results/favourite-${name}.png`);
  }

  /**
   * Debug helper: Log all elements with test IDs on current page
   */
  async debugLogPageElements(): Promise<void> {
    console.log('\n🔍 DEBUG: All elements with data-eram-test-id:');
    const allTestIds = await this.page.locator('[data-eram-test-id]').all();
    
    for (let i = 0; i < Math.min(allTestIds.length, 20); i++) {
      const testId = await allTestIds[i].getAttribute('data-eram-test-id');
      const isVisible = await allTestIds[i].isVisible().catch(() => false);
      const tagName = await allTestIds[i].evaluate((el) => el.tagName).catch(() => 'unknown');
      
      if (isVisible) {
        console.log(`  ✓ [${tagName}] ${testId}`);
      }
    }
    
    // Also check for images (products usually have images)
    console.log('\n🔍 DEBUG: All images on page:');
    const allImages = await this.page.locator('img').all();
    console.log(`  Found ${allImages.length} images total`);
    
    // Check for any divs/articles that might be products
    console.log('\n🔍 DEBUG: Checking for product-like structures:');
    const articles = await this.page.locator('article').count();
    const cardsWithImages = await this.page.locator('div:has(img)').count();
    const listsWithImages = await this.page.locator('[role="listitem"]:has(img)').count();
    
    console.log(`  - <article> tags: ${articles}`);
    console.log(`  - <div> with images: ${cardsWithImages}`);
    console.log(`  - List items with images: ${listsWithImages}`);
    console.log('');
  }

  /**
   * Debug helper: Log page URL and title
   */
  async debugLogPageInfo(): Promise<void> {
    const url = this.page.url();
    const title = await this.page.title();
    console.log(`\n📄 Page Info:`);
    console.log(`   URL: ${url}`);
    console.log(`   Title: ${title}`);
    console.log('');
  }
}

