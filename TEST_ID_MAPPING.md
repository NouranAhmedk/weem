# Weem Test ID Mapping

This document maps all `data-eram-test-id` attributes found in the Weem application to their purposes and locations.

> **Last Updated:** 2025-10-30
> **Total Test IDs:** 83+

---

## Table of Contents
- [Header & Navigation](#header--navigation)
- [Search](#search)
- [User Authentication](#user-authentication)
- [Registration Modal](#registration-modal)
- [OTP Input](#otp-input)
- [Categories](#categories)
- [Banners](#banners)
- [Products](#products)
- [Cart](#cart)
- [Download App](#download-app)
- [Footer](#footer)

---

## Header & Navigation

| Test ID | Element Type | Purpose | Text/Label |
|---------|-------------|---------|------------|
| `logo-link` | Link (a) | Weem logo/home link | "" |
| `mobile-menu-button` | Button | Mobile hamburger menu toggle | "" |
| `deliver-to-button` | Button | Delivery location selector | "Deliver to Choose" |
| `language-dropdown-button` | Div | Language switcher dropdown | "English" / "العربية" |
| `user-dropdown-register-button` | Button | Register/Login button | "Register" |

---

## Search

| Test ID | Element Type | Purpose | Placeholder |
|---------|-------------|---------|-------------|
| `search-input` | Input (text) | Product search input field | "Search" |
| `search-button` | Button (submit) | Submit search query | "" |

---

## User Authentication

### Registration Modal

| Test ID | Element Type | Purpose | Text/Label |
|---------|-------------|---------|------------|
| `register-panel-title` | H2 | Modal title | "Register by phone number" |
| `phone-input` | Input (tel) | Phone number input | "Phone Number" |
| `country-select-button` | Button | Country code selector | "+966" |
| `submit-button` | Button (submit) | Submit phone/OTP | "Submit" |
| `guest-button` | Button | Continue without registration | "Continue as guest" |
| `close-button` | Button | Close modal | "" |

### OTP Input Fields

| Test ID | Element Type | Purpose | Properties |
|---------|-------------|---------|------------|
| `otp-input-0` | Input (text) | First OTP digit | maxlength="1", inputmode="numeric" |
| `otp-input-1` | Input (text) | Second OTP digit | maxlength="1", inputmode="numeric" |
| `otp-input-2` | Input (text) | Third OTP digit | maxlength="1", inputmode="numeric" |
| `otp-input-3` | Input (text) | Fourth OTP digit | maxlength="1", inputmode="numeric" |
| `otp-input-4` | Input (text) | Fifth OTP digit | maxlength="1", inputmode="numeric" |

**Usage Pattern:**
```typescript
// Loop through OTP inputs
for (let i = 0; i < 5; i++) {
  await page.locator(`[data-eram-test-id="otp-input-${i}"]`).fill(digit);
}
```

---

## Categories

### Category Navigation (Dropdown Triggers)

| Test ID Pattern | Example | Purpose |
|-----------------|---------|---------|
| `category-{id}-dropdown-trigger` | `category-13-dropdown-trigger` | Category dropdown button |
| `category-{id}-dropdown-arrow` | `category-13-dropdown-arrow` | Dropdown arrow icon |
| `category-{id}-link` | `category-13-link` | Direct category link |

### Available Category IDs

| Category ID | Name (English) | Name (Arabic) |
|-------------|----------------|---------------|
| 1 | Frozen | - |
| 2 | Dairy | - |
| 3 | Breakfast | - |
| 4 | Fruits | - |
| 5 | Vegetables | - |
| 6 | Beverages | - |
| 7 | Snacks | - |
| 8 | Bakery | - |
| 9 | Meat | - |
| 10 | Seafood | - |
| 11 | Canned | - |
| 12 | Sweets | - |
| 13 | - | كل مجموعات الأصناف |
| 15 | - | العناية بالمنزل |
| 17 | - | الاحتياجات اليومية |
| 18 | - | الصيدلية والتغذية الصحية |
| 19 | - | العناية بالطفل |
| 20 | - | القرطاسية |
| 21 | - | المشروبات |
| 22 | - | مقاضي |
| 23 | - | جروب موقت |

### Category Section

| Test ID | Element Type | Purpose | Text |
|---------|-------------|---------|------|
| `shop-by-category-title` | H2 | Section title | "Shop by Category" |
| `previous-category-button` | Button | Carousel previous button | "" |
| `next-category-button` | Button | Carousel next button | "" |

---

## Banners

### Banner Carousel

| Test ID | Element Type | Purpose |
|---------|-------------|---------|
| `previous-banner-button` | Button | Previous banner navigation |
| `next-banner-button` | Button | Next banner navigation |

### Banner Links

| Test ID Pattern | Example | Purpose |
|-----------------|---------|---------|
| `banner-{id}-link` | `banner-7-link` | Clickable banner/promotional link |

**Available Banner IDs:** 7, 8, 9, 10, 11, 12, 13, 14, 15

---

## Products

### Product Section

| Test ID | Element Type | Purpose | Text |
|---------|-------------|---------|------|
| `best-seller-title` | H2 | Best seller section title | "Best Seller" |

### Product Cards

| Test ID Pattern | Example | Purpose |
|-----------------|---------|---------|
| `product-image-{id}-link` | `product-image-1145-link` | Product image link |
| `product-name-{id}-link` | `product-name-1145-link` | Product name link |
| `add-to-cart-button` | `add-to-cart-button` | Add product to cart |

**Note:** `product-id` is dynamic based on the actual product (e.g., 1145, 5786, 3707, etc.)

**Add to Cart Button:**
- Multiple instances on page (one per product)
- Use `.first()`, `.last()`, or filter by aria-label to target specific product
- aria-label format: `"Add {product-name} to cart"`

---

## Cart

| Test ID | Element Type | Purpose | Notes |
|---------|-------------|---------|-------|
| `add-to-cart-button` | Button | Add item to cart | Multiple instances per page |

**Missing Cart Test IDs:**
The following cart functionalities may not have test IDs yet:
- Cart icon/badge
- Cart count indicator
- Cart drawer/modal
- Remove from cart button
- Cart item quantity controls
- Checkout button
- Cart total
- Coupon input

> ⚠️ **Action Required:** Request dev team to add test IDs for cart page/drawer elements

---

## Download App

| Test ID | Element Type | Purpose | Text |
|---------|-------------|---------|------|
| `download-app-title` | H2 | Section title | "Download App" |
| `google-play-link` | Link (a) | Google Play store link | "Get It on Google Play" |
| `app-store-link` | Link (a) | Apple App Store link | "Download on the App Store" |

---

## Footer

| Test ID | Element Type | Purpose | Text |
|---------|-------------|---------|------|
| `privacy-policy-link` | Link (a) | Privacy policy page | "Privacy Policy" |
| `terms-and-conditions-link` | Link (a) | Terms page | "Terms and Conditions" |
| `terms-and-conditions-tag` | SVG | Icon for terms link | "" |
| `faqs-link` | Link (a) | FAQs page | "FAQs" |
| `faqs-tag` | SVG | Icon for FAQs link | "" |
| `help-center-link` | Link (a) | Help center page | "Help Center" |
| `help-center-tag` | SVG | Icon for help center link | "" |
| `subscribe-button` | Button (submit) | Newsletter subscription | "" |

---

## Usage Best Practices

### 1. Direct Test ID Selection
```typescript
// Best practice - use test ID directly
await page.locator('[data-eram-test-id="search-input"]').fill('product');
await page.locator('[data-eram-test-id="search-button"]').click();
```

### 2. Dynamic Test IDs (Products, Categories)
```typescript
// For dynamic IDs, use template literals
const categoryId = 13;
await page.locator(`[data-eram-test-id="category-${categoryId}-link"]`).click();

const productId = 1145;
await page.locator(`[data-eram-test-id="product-image-${productId}-link"]`).click();
```

### 3. Multiple Elements (Add to Cart)
```typescript
// When multiple elements share the same test ID, use additional selectors
await page.locator('[data-eram-test-id="add-to-cart-button"]').first().click();

// Or filter by aria-label
await page.locator('[data-eram-test-id="add-to-cart-button"][aria-label*="Product Name"]').click();
```

### 4. OTP Inputs (Indexed Pattern)
```typescript
// Fill OTP using indexed test IDs
const otp = "12345";
for (let i = 0; i < otp.length; i++) {
  await page.locator(`[data-eram-test-id="otp-input-${i}"]`).fill(otp[i]);
}
```

### 5. Fallback Strategy
```typescript
// Primary: test ID, Fallback: role-based
const registerButton = page.locator('[data-eram-test-id="user-dropdown-register-button"]')
  .or(page.getByRole('button', { name: 'Register' }));
await registerButton.click();
```

---

## Missing Test IDs Checklist

Elements that may need test IDs added by dev team:

- [ ] Cart icon/badge in header
- [ ] Cart count indicator
- [ ] Cart drawer/modal
- [ ] Cart item quantity increase/decrease buttons
- [ ] Remove item from cart button
- [ ] Clear cart button
- [ ] Cart total/subtotal display
- [ ] Checkout/proceed button
- [ ] Coupon/promo code input
- [ ] Apply coupon button
- [ ] User profile dropdown menu
- [ ] User profile link
- [ ] Logout button
- [ ] My orders link
- [ ] Product quantity selector on product page
- [ ] Product size/variant selectors
- [ ] Product color selectors
- [ ] Product filters (price, brand, etc.)
- [ ] Sort dropdown
- [ ] Pagination buttons

---

## Maintenance Notes

- This document should be updated whenever new test IDs are added to the application
- Run `node extract-test-ids.js` to generate an updated list
- Test IDs should follow kebab-case naming convention
- Dynamic IDs should use consistent patterns (e.g., `element-{id}-action`)
