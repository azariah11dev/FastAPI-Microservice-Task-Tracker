import { test, expect } from "@playwright/test";

test("about page loads correctly", async ({ page }) => {
  await page.goto("/about");

  await expect(page.getByText("About Us")).toBeVisible();

  await expect(
    page.getByText(/simplify workflows/i)
  ).toBeVisible();

  await expect(
    page.getByText(/clean design, thoughtful engineering/i)
  ).toBeVisible();

  await expect(
    page.getByText(/Next\.js, Tailwind CSS, and FastAPI/i)
  ).toBeVisible();
});
