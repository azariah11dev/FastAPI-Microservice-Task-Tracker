import { test, expect } from "@playwright/test";

test("features page loads correctly", async ({ page }) => {
  await page.goto("/features");

  await expect(page.getByRole("heading", { name: "Features" })).toBeVisible();

  await expect(
    page.getByText(/Explore the core features that make this project/i)
  ).toBeVisible();
});

test("all feature cards are visible", async ({ page }) => {
  await page.goto("/features");

  const titles = [
    "Fast & Modern",
    "API-Ready",
    "Responsive Design",
    "Clean Architecture",
    "Reusable Components",
    "Developer-Friendly",
  ];

  for (const title of titles) {
    await expect(page.getByText(title)).toBeVisible();
  }
});
