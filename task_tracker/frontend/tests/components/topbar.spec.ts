import { test, expect } from "@playwright/test";

async function loginAs(page, role: "admin" | "user") {
  await page.goto("/login");

  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        access_token: "abc123",
        username: "azariah",
        role,
      }),
    });
  });

  await page.fill('input[placeholder="Enter username"]', "azariah");
  await page.fill('input[placeholder="Enter password"]', "secret");
  await page.click('button:has-text("Sign In")');

  await expect(page).toHaveURL("/dashboard");
}

test("topbar shows username and role after login", async ({ page }) => {
  await loginAs(page, "admin");

  await expect(page.getByText("azariah (admin)")).toBeVisible();
});

test("topbar shows date and time", async ({ page }) => {
  await loginAs(page, "user");

  const topbar = page.locator("nav").filter({ hasText: "Task Forge" }).first();
  await expect(topbar).toContainText("•");
});

test("logout clears session and redirects to login", async ({ page }) => {
  await loginAs(page, "user");

  const logoutButton = page.getByRole("link", { name: "Logout" });
  await expect(logoutButton).toBeVisible();
  await logoutButton.click();

  await expect(page).toHaveURL("/login");
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
});
