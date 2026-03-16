import { test, expect } from "@playwright/test";

test.describe("checkout-demo smoke tests", () => {
  test("homepage loads with product grid and no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      // Only capture JS runtime errors, not network 404s (images may be missing in dev)
      if (msg.type() === "error" && !msg.text().includes("Failed to load resource")) {
        errors.push(msg.text());
      }
    });

    await page.goto("/");

    // Page title / nav visible
    await expect(page).toHaveTitle(/checkout|crate|demo/i);

    // Product grid rendered
    const grid = page.locator('[data-testid="product-grid"]');
    await expect(grid).toBeVisible();

    // At least one product card
    const cards = page.locator('[data-testid="product-card"]');
    await expect(cards.first()).toBeVisible();

    // No JS console errors
    expect(errors).toHaveLength(0);
  });

  test("add product to cart increments cart count", async ({ page }) => {
    await page.goto("/");

    // Cart count before — may be empty (no badge) or 0
    const cartLink = page.locator('a[href="/cart"]');
    await expect(cartLink).toBeVisible();

    // Click "Add to Cart" on the first product
    const addButton = page.locator("button", { hasText: /add to cart/i }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Cart badge should appear with at least 1
    const badge = cartLink.locator("span");
    await expect(badge).toBeVisible();
    const countText = await badge.textContent();
    expect(Number(countText)).toBeGreaterThanOrEqual(1);
  });

  test("checkout page loads with payment form", async ({ page }) => {
    await page.goto("/");

    // Add item to cart via button click
    const addButton = page.locator("button", { hasText: /add to cart/i }).first();
    await addButton.click();

    // Click cart link in nav (stays in same context so cart state is preserved)
    const cartLink = page.locator('a[href="/cart"]');
    await cartLink.click();
    await page.waitForURL("**/cart");

    // Proceed to checkout
    const checkoutLink = page.locator('a[href="/checkout"]');
    await expect(checkoutLink).toBeVisible();
    await checkoutLink.click();
    await page.waitForURL("**/checkout");

    // Checkout loaded — shipping step is visible first
    const shippingHeading = page.locator("h2", { hasText: /shipping/i });
    await expect(shippingHeading).toBeVisible({ timeout: 10_000 });

    // Fill shipping form and proceed to payment step
    await page.fill('input[placeholder="Jane Doe"]', "Test User");
    await page.fill('input[placeholder="jane@example.com"]', "test@example.com");
    await page.fill('input[placeholder="123 Main St"]', "123 Test St");
    await page.fill('input[placeholder="Springfield"]', "Phoenix");
    await page.fill('input[placeholder="CA"]', "AZ");
    await page.fill('input[placeholder="90210"]', "85001");
    await page.locator("button", { hasText: /continue to payment/i }).click();
    await page.waitForTimeout(500);

    // Payment form now visible
    const paymentForm = page.locator('[data-testid="payment-form"]');
    await expect(paymentForm).toBeVisible({ timeout: 10_000 });
  });
});
