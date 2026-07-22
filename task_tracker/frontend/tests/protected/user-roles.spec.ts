import { test, expect } from "@playwright/test";

async function loginAsAdmin(page, targetPath = "/user-roles") {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator('input[placeholder="Enter username"]').waitFor({ state: "visible" });

  await page.evaluate(() => {
    window.localStorage.setItem("access_token", "abc123");
    window.localStorage.setItem("username", "Azariah");
    window.localStorage.setItem("role", "Admin");
  });

  if (targetPath !== "/dashboard") {
    await page.goto(targetPath, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`${targetPath.replace(/\//g, "\\/")}$`));
  }
}

test("renders users from backend", async ({ page }) => {
  await loginAsAdmin(page);

  await page.route("**/existing_users/all_users", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          id: 1,
          username: "john",
          email: "john@example.com",
          role: "User",
        },
      ]),
    });
  });

  await page.goto("/user-roles");

  await expect(page.getByText("john", { exact: true })).toBeVisible();
  await expect(page.getByText("john@example.com", { exact: true })).toBeVisible();
  await expect(page.locator("select").first()).toBeVisible();
});

test("updates user role", async ({ page }) => {
  await loginAsAdmin(page);

  await page.route("**/existing_users/all_users", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          id: 1,
          username: "john",
          email: "john@example.com",
          role: "User",
        },
      ]),
    });
  });

  await page.route("**/user_role/assign_role**", async (route) => {
    await route.fulfill({
      status: 200,
      body: "",
    });
  });

  await page.goto("/user-roles");

  const select = page.locator("select").first();
  await select.selectOption("Admin");

  await expect(page.getByText("Saving...")).toBeVisible();
  await expect(select).toHaveValue("Admin");
});

test("shows backend error message", async ({ page }) => {
  await loginAsAdmin(page);

  await page.route("**/existing_users/all_users", async (route) => {
    await route.fulfill({
      status: 500,
      body: "Internal Server Error",
    });
  });

  await page.goto("/user-roles");

  await expect(
    page.getByText("Could not load users — backend unreachable.")
  ).toBeVisible();
});
