import { test, expect } from "@playwright/test";

async function loginAs(page, role: "admin" | "user") {
  await page.goto("/login");

  // Intercept login request
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

  // After login, user lands on dashboard (protected)
  await expect(page).toHaveURL("/dashboard");
}

test("sidebar renders base links for normal user", async ({ page }) => {
  await loginAs(page, "user");

  await expect(page.getByRole("link", { name: "Create Task", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Task Management", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Task History", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Analytics", exact: true })).toBeVisible();

  await expect(page.getByRole("link", { name: "User Roles", exact: true })).not.toBeVisible();
});

test("sidebar shows admin-only link when logged in as admin", async ({ page }) => {
  await loginAs(page, "admin");

  await expect(page.getByRole("link", { name: "User Roles", exact: true })).toBeVisible();
});

test("sidebar navigation works", async ({ page }) => {
  await loginAs(page, "user");

  await page.getByRole("link", { name: "Create Task", exact: true }).click();
  await expect(page).toHaveURL("/create-task");

  await page.getByRole("link", { name: "Task Management", exact: true }).click();
  await expect(page).toHaveURL("/task-management");

  await page.getByRole("link", { name: "Task History", exact: true }).click();
  await expect(page).toHaveURL("/task-history");

  await page.getByRole("link", { name: "Analytics", exact: true }).click();
  await expect(page).toHaveURL("/analytics");
});
