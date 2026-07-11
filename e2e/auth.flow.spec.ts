import { test, expect, Page } from "@playwright/test";

const OWNER_EMAIL = "owner@little-hogsmeade.test";
const OWNER_PASSWORD = "Module4!2026";

const fillLoginForm = async (page: Page, email: string, password: string) => {
  await page.getByPlaceholder("admin@littlehogsmeade.vn").fill(email);
  await page.locator('input[name="password"]').fill(password);
};

async function loginAsOwner(page: Page) {
  await page.goto("/login");
  await fillLoginForm(page, OWNER_EMAIL, OWNER_PASSWORD);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 15000 });
}

// Flow 1: Happy path - owner login → redirect admin dashboard
test("owner login redirects to admin dashboard", async ({ page }) => {
  await loginAsOwner(page);
  await expect(page).toHaveURL(/\/admin\/dashboard/);
});

// Flow 2: Session được lưu - F5 vẫn còn token
test("auth session persists after page reload", async ({ page }) => {
  await loginAsOwner(page);

  // Reload
  await page.reload();

  // Vẫn ở dashboard, không bị redirect về login
  await expect(page).toHaveURL(/\/admin\/dashboard/);
});

// Flow 3: Token được lưu trong localStorage đúng key
test("token is stored in localStorage after login", async ({ page }) => {
  await loginAsOwner(page);

  // Kiểm tra localStorage
  const raw = await page.evaluate(() =>
    localStorage.getItem("little-hogsmeade-auth"),
  );
  expect(raw).not.toBeNull();

  const session = JSON.parse(raw!);
  expect(session.token).toBeTruthy();
  expect(typeof session.token).toBe("string");
  expect(session.token.split(".")).toHaveLength(3); // JWT
  expect(session.accountType).toBe("employee");
  expect(session.user.roleName?.toLowerCase()).toContain("owner");
});

// Flow 4: Protected route - chưa login → redirect /login
test("unauthenticated user is redirected to login", async ({ page }) => {
  // Xoá localStorage để chắc chắn chưa login
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto("/admin/dashboard");

  // Redirect về /login
  await page.waitForURL(/\/login/);
  await expect(page).toHaveURL(/\/login/);
});

// Flow 5: Sai mật khẩu → hiển thị lỗi, không redirect
test("wrong password shows error and stays on login", async ({ page }) => {
  await page.goto("/login");
  await fillLoginForm(page, OWNER_EMAIL, "WrongPassword123!");
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).click();

  // Chờ error message hiển thị
  const error = page.locator("text=/invalid|sai|không đúng|401|error/i");
  await expect(error).toBeVisible({ timeout: 15000 });

  // Không bị redirect
  await expect(page).toHaveURL(/\/login/);
});

// Flow 6: Owner vào được các route admin quan trọng
test("owner can access key admin routes after login", async ({ page }) => {
  await loginAsOwner(page);

  const adminRoutes = [
    "/admin/dashboard",
    "/admin/operations/tables",
    "/admin/cms",
    "/admin/settings",
    "/admin/owner",
  ];
  for (const route of adminRoutes) {
    await page.goto(route);
    await expect(page).not.toHaveURL(/\/login/);
  }
});
