import { test, expect } from "@playwright/test";

test("signup page loads correctly", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByText("Create Account")).toBeVisible();
  await expect(page.getByPlaceholder("Enter username")).toBeVisible();
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
});

test("password mismatch shows alert", async ({ page }) => {
  await page.goto("/signup");

  await page.fill('input[name="password"]', "abc");
  await page.fill('input[name="confirmPassword"]', "xyz");

  page.on("dialog", (dialog) => {
    expect(dialog.message()).toBe("Passwords do not match");
    dialog.dismiss();
  });

  await page.click('button[type="submit"]');
});

test("successful signup redirects to login", async ({ page }) => {
  await page.goto("/signup");

  await page.fill('input[name="username"]', "azariah");
  await page.fill('input[name="email"]', "azariah@example.com");
  await page.fill('input[name="password"]', "secret");
  await page.fill('input[name="confirmPassword"]', "secret");

  // Mock backend
  await page.route("**/auth/register", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({}),
    })
  );

  await page.click('button[type="submit"]');

  await expect(page).toHaveURL("/login");
});
