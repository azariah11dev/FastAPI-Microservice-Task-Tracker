import { test, expect } from "@playwright/test";

test("demo page loads correctly", async ({ page }) => {
  await page.goto("/demo");

  await expect(page.getByText("Task Forge Demo")).toBeVisible();

  await expect(
    page.getByText(/walkthrough of the Task Forge platform/i)
  ).toBeVisible();

  // iframe visible
  const iframe = page.frameLocator('iframe[title="Task Forge Demo Video"]');
  await expect(iframe).toBeDefined();
});

test("iframe has correct YouTube embed URL", async ({ page }) => {
  await page.goto("/demo");

  const iframe = page.locator('iframe[title="Task Forge Demo Video"]');
  await expect(iframe).toHaveAttribute(
    "src",
    "https://www.youtube.com/embed/YOUR_VIDEO_ID"
  );
});
