import { WeemHomePage } from '../../page-objects/weem-home.page';
import { WeemProductsPage } from '../../page-objects/weem-products.page';
import { WeemCartPage } from '../../page-objects/weem-cart.page';

/**
 * Shopping Helper Utilities
 * Reusable functions for random product shopping flows
 */

/**
 * Navigate to a random category from homepage
 * @param homePage - Instance of WeemHomePage
 * @returns Promise<void>
 */
export async function navigateToRandomCategory(homePage: WeemHomePage): Promise<void> {
  console.log('--- Navigating to random category ---');
  await homePage.navigateToFirstCategory();
}

/**
 * Navigate to first available category from homepage
 * @param homePage - Instance of WeemHomePage
 * @returns Promise<void>
 */
export async function navigateToFirstCategory(homePage: WeemHomePage): Promise<void> {
  console.log('--- Navigating to first category ---');
  await homePage.navigateToFirstCategory();
}

/**
 * Select and click first product on products page
 * @param productsPage - Instance of WeemProductsPage
 * @returns Promise<void>
 */
export async function selectFirstProduct(productsPage: WeemProductsPage): Promise<void> {
  console.log('--- Selecting first product ---');
  await productsPage.waitForProductsToLoad();
  await productsPage.clickFirstProduct();
}

/**
 * Select and click random product on products page
 * @param productsPage - Instance of WeemProductsPage
 * @returns Promise<void>
 */
export async function selectRandomProduct(productsPage: WeemProductsPage): Promise<void> {
  console.log('--- Selecting random product ---');
  await productsPage.waitForProductsToLoad();
  await productsPage.clickRandomProduct();
}

/**
 * Add current product to cart
 * Checks stock status before adding
 * @param productsPage - Instance of WeemProductsPage
 * @returns Promise<boolean> - Returns true if successfully added, false if out of stock
 */
export async function addProductToCart(productsPage: WeemProductsPage): Promise<boolean> {
  console.log('--- Adding product to cart ---');

  // Check if product is in stock
  const inStock = await productsPage.isProductInStock();

  if (!inStock) {
    console.log('Product is out of stock, skipping add to cart');
    return false;
  }

  // Add to cart
  await productsPage.addToCart();
  console.log('Product added to cart successfully');
  return true;
}

/**
 * Complete random product selection and add to cart
 * Combines category navigation, product selection, and cart addition
 * @param homePage - Instance of WeemHomePage
 * @param productsPage - Instance of WeemProductsPage
 * @param useRandomProduct - If true, selects random product; if false, selects first
 * @returns Promise<boolean> - Returns true if product was added successfully
 */
export async function addRandomProductToCart(
  homePage: WeemHomePage,
  productsPage: WeemProductsPage,
  useRandomProduct: boolean = false
): Promise<boolean> {
  console.log('=== Starting random product to cart flow ===');

  // Navigate to first/random category
  if (useRandomProduct) {
    await navigateToRandomCategory(homePage);
  } else {
    await navigateToFirstCategory(homePage);
  }

  // Select product
  if (useRandomProduct) {
    await selectRandomProduct(productsPage);
  } else {
    await selectFirstProduct(productsPage);
  }

  // Add to cart
  const success = await addProductToCart(productsPage);

  console.log('=== Random product to cart flow complete ===');
  return success;
}

/**
 * Open cart from any page
 * @param cartPage - Instance of WeemCartPage
 * @returns Promise<void>
 */
export async function openCart(cartPage: WeemCartPage): Promise<void> {
  console.log('--- Opening cart ---');
  await cartPage.openCart();
  await cartPage.waitForCartToLoad();
}

/**
 * Verify cart has items
 * @param cartPage - Instance of WeemCartPage
 * @returns Promise<boolean>
 */
export async function verifyCartHasItems(cartPage: WeemCartPage): Promise<boolean> {
  console.log('--- Verifying cart has items ---');
  const hasItems = await cartPage.hasItems();

  if (hasItems) {
    const items = await cartPage.getAllCartItems();
    console.log(`Cart has ${items.length} item(s)`);
  } else {
    console.log('Cart is empty');
  }

  return hasItems;
}

/**
 * Remove first item from cart
 * @param cartPage - Instance of WeemCartPage
 * @returns Promise<void>
 */
export async function removeFirstItemFromCart(cartPage: WeemCartPage): Promise<void> {
  console.log('--- Removing first item from cart ---');
  await cartPage.removeFirstItemFromCart();
}

/**
 * Proceed to checkout
 * @param cartPage - Instance of WeemCartPage
 * @returns Promise<void>
 */
export async function proceedToCheckout(cartPage: WeemCartPage): Promise<void> {
  console.log('--- Proceeding to checkout ---');
  await cartPage.proceedToCheckout();
}

/**
 * Complete full random shopping flow
 * From homepage to checkout with random product
 * @param homePage - Instance of WeemHomePage
 * @param productsPage - Instance of WeemProductsPage
 * @param cartPage - Instance of WeemCartPage
 * @param useRandomProduct - If true, selects random product; if false, selects first
 * @returns Promise<boolean> - Returns true if flow completed successfully
 */
export async function completeRandomShoppingFlow(
  homePage: WeemHomePage,
  productsPage: WeemProductsPage,
  cartPage: WeemCartPage,
  useRandomProduct: boolean = false
): Promise<boolean> {
  console.log('====== Starting complete random shopping flow ======');

  try {
    // Step 1: Add product to cart
    const addedToCart = await addRandomProductToCart(homePage, productsPage, useRandomProduct);

    if (!addedToCart) {
      console.log('Failed to add product to cart, aborting flow');
      return false;
    }

    // Step 2: Open cart
    await openCart(cartPage);

    // Step 3: Verify cart has items
    const hasItems = await verifyCartHasItems(cartPage);

    if (!hasItems) {
      console.log('Cart is empty after adding product, aborting flow');
      return false;
    }

    // Step 4: Proceed to checkout
    await proceedToCheckout(cartPage);

    console.log('====== Random shopping flow completed successfully ======');
    return true;
  } catch (error) {
    console.error('Error in random shopping flow:', error);
    return false;
  }
}

/**
 * Generic helper: Get random element from array
 * @param elements - Array of elements
 * @returns Random element from array
 */
export function getRandomElement<T>(elements: T[]): T {
  if (elements.length === 0) {
    throw new Error('Cannot get random element from empty array');
  }

  const randomIndex = Math.floor(Math.random() * elements.length);
  return elements[randomIndex];
}

/**
 * Generic helper: Get first element from array
 * @param elements - Array of elements
 * @returns First element from array
 */
export function getFirstElement<T>(elements: T[]): T {
  if (elements.length === 0) {
    throw new Error('Cannot get first element from empty array');
  }

  return elements[0];
}
