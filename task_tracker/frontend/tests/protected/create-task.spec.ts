import { test, expect } from "@playwright/test";

async function login(page, targetPath = "/create-task") {
  await page.route("**/auth/login", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        access_token: "abc123",
        username: "azariah",
        role: "user",
      }),
    });
  });

  await page.goto("/login");
  await page.fill('input[placeholder="Enter username"]', "azariah");
  await page.fill('input[placeholder="Enter password"]', "secret");
  await page.click('button:has-text("Sign In")');

  await expect(page).toHaveURL(/\/dashboard$/);

  if (targetPath !== "/dashboard") {
    await page.goto(targetPath);
    await expect(page).toHaveURL(new RegExp(`${targetPath.replace(/\//g, "\\/")}$`));
  }
}

test("user can add and remove tasks", async ({ page }) => {
  await login(page);
  await page.goto("/create-task");

  await page.fill('input[name="task"]', "Task A");
  await page.getByRole("button", { name: "Add Task" }).click();

  await expect(page.getByText("Task A")).toBeVisible();

  await page.getByText("Task A").click();
  await page.getByRole("button", { name: "Remove Task" }).click();

  await expect(page.getByText("Task A")).not.toBeVisible();
});

test("analyze tasks triggers modal", async ({ page }) => {
  await login(page);
  await page.goto("/create-task");

  await page.route("**/query_builder/analyze_tasks", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ summary: "ok" }),
    });
  });

  await page.fill('input[name="task"]', "Task A");
  await page.click("text=Add Task");

  await page.click("text=Analyze");

  await expect(page.getByText("What would you like to do?")).toBeVisible();
});

test("continue button navigates to task management", async ({ page }) => {
  await login(page);
  await page.goto("/create-task");

  await page.route("**/query_builder/analyze_tasks", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ summary: "ok" }),
    });
  });

  await page.fill('input[name="task"]', "Task A");
  await page.click("text=Add Task");
  await page.click("text=Analyze");

  await page.click("text=Continue");

  await expect(page).toHaveURL("/task-management");
});
