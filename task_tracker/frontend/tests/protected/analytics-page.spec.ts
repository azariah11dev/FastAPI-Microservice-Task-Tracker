import { test, expect } from "@playwright/test";

test("analytics page loads and displays metrics", async ({ page }) => {
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

  // Mock backend response
  await page.route("**/task_retrieval/completed_tasks", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          tasks: [{}, {}, {}], // 3 tasks
          total_estimated_hours: 10,
          remaining_estimated_hours: 0,
        },
        {
          tasks: [{}], // 1 task
          total_estimated_hours: 5,
          remaining_estimated_hours: 2,
        },
      ]),
    });
  });

  await page.goto("/login");
  await page.fill('input[placeholder="Enter username"]', "Azariah");
  await page.fill('input[placeholder="Enter password"]', "secret");
  await page.click('button:has-text("Sign In")');
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/analytics");

  await expect(page.getByText("Analytics Dashboard")).toBeVisible();

  // Total Analyses = 2
  await expect(page.getByText("Total Analyses")).toBeVisible();
  await expect(page.getByText("2", { exact: true })).toBeVisible();

  // Completed Analyses = 1
  await expect(page.getByText("Completed Analyses")).toBeVisible();
  await expect(page.getByText("1", { exact: true })).toBeVisible();

  // Completion Rate = 50.0%
  await expect(page.getByText("Completion Rate")).toBeVisible();
  await expect(page.getByText("50.0%")).toBeVisible();

  // Total Tasks = 4
  await expect(page.getByText("Total Tasks Analyzed")).toBeVisible();
  await expect(page.getByText("4", { exact: true })).toBeVisible();

  // Avg Tasks per Analysis = 2.0
  await expect(page.getByText("Avg Tasks per Analysis")).toBeVisible();
  await expect(page.getByText("2.0", { exact: true })).toBeVisible();

  // Avg Hours per Analysis = 7.5
  await expect(page.getByText("Avg Estimated Hours per Analysis")).toBeVisible();
  await expect(page.getByText("7.5", { exact: true })).toBeVisible();
});

test("analytics page shows error message when backend fails", async ({ page }) => {
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

  // Mock backend failure
  await page.route("**/task_retrieval/completed_tasks", async (route) => {
    await route.fulfill({
      status: 500,
      body: "Internal Server Error",
    });
  });

  await page.goto("/analytics");

  // Wait for loading to disappear
  await expect(
    page.getByText("Loading analytics...")
  ).not.toBeVisible({ timeout: 5000 });

  // Error message
  await expect(
    page.getByText("Could not load analytics — backend unreachable.")
  ).toBeVisible();
});
