import { test, expect } from "@playwright/test";

async function login(page, targetPath = "/task-history") {
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

  if (targetPath !== "/dashboard") {
    await page.goto(targetPath);
    await expect(page).toHaveURL(new RegExp(`${targetPath.replace(/\//g, "\\/")}$`));
  }
}

test("shows completed tasks from backend", async ({ page }) => {
  await page.route("**/task_retrieval/completed_tasks", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          timestamp: 123,
          name: "Analysis A",
          readable: "Jan 1, 2024",
          tasks: ["Task 1", "Task 2"],
          total_estimated_hours: 5,
          remaining_estimated_hours: 0,
        },
      ]),
    });
  });

  await login(page);
  await page.goto("/task-history");

  await expect(page.getByText("Analysis A")).toBeVisible();
  await expect(page.getByText("Task 1")).toBeVisible();
  await expect(page.getByText("Task 2")).toBeVisible();
});

test("deletes a completed task", async ({ page }) => {
  await page.route("**/task_retrieval/completed_tasks", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([
        {
          timestamp: 123,
          name: "Analysis A",
          readable: "Jan 1, 2024",
          tasks: ["Task 1"],
          total_estimated_hours: 3,
          remaining_estimated_hours: 0,
        },
      ]),
    });
  });

  await page.route("**/task_remover/123", async (route) => {
    await route.fulfill({ status: 200, body: "" });
  });

  await login(page);
  await page.goto("/task-history");

  await expect(page.getByText("Analysis A")).toBeVisible();

  await page.click("text=Delete");

  await expect(page.getByText("Analysis A")).not.toBeVisible();
});

test("shows empty state when no completed tasks", async ({ page }) => {
  await page.route("**/task_retrieval/completed_tasks", async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify([]),
    });
  });

  await login(page);
  await page.goto("/task-history");

  await expect(page.getByText("No completed analyses found.")).toBeVisible();
});

test("shows backend error message", async ({ page }) => {
  await page.route("**/task_retrieval/completed_tasks", async (route) => {
    await route.fulfill({
      status: 500,
      body: "Internal Server Error",
    });
  });

  await login(page);
  await page.goto("/task-history");

  await expect(
    page.getByText("Could not reach backend — showing nothing.")
  ).toBeVisible();
});
