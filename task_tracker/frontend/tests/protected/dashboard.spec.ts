import { test, expect } from "@playwright/test";

async function login(page, targetPath = "/dashboard") {
  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        access_token: "abc123",
        username: "Azariah",
        role: "user",
      }),
    });
  });

  await page.goto("/login");
  await page.fill('input[placeholder="Enter username"]', "Azariah");
  await page.fill('input[placeholder="Enter password"]', "secret");
  await page.click('button:has-text("Sign In")');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("username"))).toBe("Azariah");

  if (targetPath !== "/dashboard") {
    await page.goto(targetPath);
    await expect(page).toHaveURL(new RegExp(`^${targetPath.replace(/\//g, "\\/")}$`));
  }
}

test("dashboard loads and shows username", async ({ page }) => {
  await login(page);

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Azariah");
});

test("dashboard shows quick action cards", async ({ page }) => {
  await login(page);

  await expect(page.getByText("Create Tasks")).toBeVisible();
  await expect(page.getByRole("link", { name: "Task Management", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Analytics", exact: true })).toBeVisible();
});

test("dashboard quick actions navigate correctly", async ({ page }) => {
  await login(page);

  await page.click("text=Create Tasks");
  await expect(page).toHaveURL("/create-task");

  await page.goto("/dashboard");
  await page.click("text=Task Management");
  await expect(page).toHaveURL("/task-management");

  await page.goto("/dashboard");
  await page.click("text=Analytics");
  await expect(page).toHaveURL("/analytics");
});
