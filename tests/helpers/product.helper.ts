import { Page, Locator } from '@playwright/test';

/**
 * Product Helper
 * Handles product selection and navigation
 */
export class ProductHelper {
  constructor(
    private page: Page,
    private productsPage: any,
    private homePage: any
  ) {}

  /**
   * Select a category and wait for products to load
   * @param options Configuration options
   * @returns Selected category info and products
   */
  async selectCategoryWithProducts(options: {
    preferredCategories?: string[];
    maxAttempts?: number;
  } = {}): Promise<{
    products: Locator[];
    categoryName: string;
    categoryIndex: number;
  }> {
    const { 
      preferredCategories = ['All', 'كل', 'Fruits', 'Vegetables', 'Beverages'], 
      maxAttempts = 5 
    } = options;
    
    const categories = await this.homePage.getAllCategories();
    
    if (categories.length === 0) {
      throw new Error('No categories found on homepage');
    }
    
    // Try preferred categories first
    for (const preferred of preferredCategories) {
      for (let i = 0; i < categories.length; i++) {
        const text = await categories[i].textContent() || '';
        if (text.toLowerCase().includes(preferred.toLowerCase())) {
          console.log(`Trying preferred category: ${text}`);
          await categories[i].click();
          await this.page.waitForTimeout(2000);
          
          const products = await this.waitForProducts();
          if (products.length > 0) {
            console.log(`✅ Found ${products.length} products in category: ${text}`);
            return { products, categoryName: text, categoryIndex: i };
          }
        }
      }
    }
    
    // Fallback: try random categories
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const randomIndex = Math.floor(Math.random() * categories.length);
      const categoryName = await categories[randomIndex].textContent() || 'Unknown';
      console.log(`Trying random category ${attempt + 1}/${maxAttempts}: ${categoryName}`);
      
      await categories[randomIndex].click();
      await this.page.waitForTimeout(2000);
      
      const products = await this.waitForProducts();
      if (products.length > 0) {
        console.log(`✅ Found ${products.length} products in category: ${categoryName}`);
        return { products, categoryName, categoryIndex: randomIndex };
      }
      
      // Reload homepage and try again
      await this.homePage.goto();
      await this.page.waitForTimeout(1000);
    }
    
    throw new Error(`Could not find category with products after ${maxAttempts} attempts`);
  }

  /**
   * Wait for products to load with retry and scroll logic
   * @param maxAttempts Maximum number of attempts
   * @returns Array of product locators
   */
  async waitForProducts(maxAttempts = 5): Promise<Locator[]> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await this.page.waitForTimeout(2000);
      
      const products = await this.productsPage.getAllProducts();
      
      if (products.length > 0) {
        return products;
      }
      
      if (attempt < maxAttempts) {
        console.log(`No products found, attempt ${attempt}/${maxAttempts} - trying scroll...`);
        // Scroll to trigger lazy loading
        await this.page.evaluate(() => window.scrollBy(0, 500));
        await this.page.waitForTimeout(1000);
        await this.page.evaluate(() => window.scrollTo(0, 0));
      }
    }
    
    return [];
  }

  /**
   * Select a random product from the list
   * @param products Array of product locators
   * @returns Product name and locator
   */
  async selectRandomProduct(products: Locator[]): Promise<{
    productName: string;
    productIndex: number;
  }> {
    if (products.length === 0) {
      throw new Error('No products available to select');
    }
    
    const randomIndex = Math.floor(Math.random() * products.length);
    const productName = await products[randomIndex].textContent() || 'Unknown Product';
    
    console.log(`Selected product ${randomIndex + 1}/${products.length}: ${productName}`);
    
    await products[randomIndex].click();
    await this.page.waitForTimeout(2000);
    
    return { productName, productIndex: randomIndex };
  }

  /**
   * Extract price from text
   * @param text Text containing price
   * @returns Extracted price or 0
   */
  extractPrice(text: string): number {
    const patterns = [
      /(\d+\.?\d*)\s*(?:SAR|SR|ر\.س)/i,
      /(?:SAR|SR|ر\.س)\s*(\d+\.?\d*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1]);
      }
    }
    
    return 0;
  }
}

