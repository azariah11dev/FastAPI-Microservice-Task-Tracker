import { test, expect } from "@playwright/test";

test("login page loads correctly", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page.getByPlaceholder("Enter username")).toBeVisible();
  await expect(page.getByPlaceholder("Enter password")).toBeVisible();
});

test("user can log in successfully", async ({ page }) => {
  await page.goto("/login");

  await page.fill('input[name="username"]', "azariah");
  await page.fill('input[name="password"]', "secret");

  // Mock backend login
  await page.route("**/auth/login", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        access_token: "abc123",
        username: "azariah",
        role: "user",
      }),
    })
  );

  await page.click('button[type="submit"]');

  // Expect redirect
  await expect(page).toHaveURL("/dashboard");
});
