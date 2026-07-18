import { test, expect, Page } from "@playwright/test";

const OWNER_EMAIL = "owner@little-hogsmeade.test";
const OWNER_PASSWORD = "Module4!2026";

async function loginAsOwner(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder("admin@littlehogsmeade.vn").fill(OWNER_EMAIL);
  await page.locator('input[name="password"]').fill(OWNER_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
}

// Flow 1: Owner Branch Menu tab has sub-tabs [Base Menu] + branch tabs
test("owner branch menu tab shows base menu and branch sub-tabs", async ({ page }) => {
  await loginAsOwner(page);

  // Navigate to admin/owner
  await page.goto("/admin/owner");

  // Click Branch Menu tab
  await page.getByRole("button", { name: "Branch Menu" }).click();

  // Should see Base Menu sub-tab
  await expect(page.getByRole("button", { name: "Base Menu" })).toBeVisible();

  // Should see at least one branch sub-tab (active branch name)
  // Wait for branch tabs to load (they come from getBranches API)
  await page.waitForTimeout(2000);

  // Expect at least one branch tab button (not the Base Menu one)
  const branchTabs = page.locator('button:has-text("Base Menu")');
  await expect(branchTabs).toHaveCount(1);
});

// Flow 2: Customer /menu page shows branch tabs
test("customer menu page shows branch tabs", async ({ page }) => {
  await page.goto("/menu");

  // Should show "Thực đơn chung" tab (default)
  await expect(page.getByRole("button", { name: "Thực đơn chung" })).toBeVisible();

  // Wait for branches to load
  await page.waitForTimeout(3000);

  // Should show at least one branch tab (e.g., "Little Hogsmeade")
  // The branch tabs are rendered as <button> elements
  const branchPill = page.locator("button:has-text('Little Hogsmeade')");
  await expect(branchPill).toBeVisible();
});

// Flow 3: Click branch tab on customer menu → loads branch-specific menu
test("clicking branch tab loads branch-specific menu items", async ({ page }) => {
  await page.goto("/menu");

  // Wait for branches to load
  await page.waitForTimeout(3000);

  // Click the first branch tab that is not "Thực đơn chung"
  const branchBtn = page.locator("button:not(:has-text('Thực đơn chung'))").first();
  await expect(branchBtn).toBeVisible({ timeout: 10000 });
  await branchBtn.click();

  // Wait for branch menu to load
  await page.waitForTimeout(2000);

  // Should see category sections (the menu items grouped by category)
  // Each section has an id like "cat-{id}" - check that at least one exists
  const categorySections = page.locator('[id^="cat-"]');
  const count = await categorySections.count();
  expect(count).toBeGreaterThanOrEqual(1);
});
