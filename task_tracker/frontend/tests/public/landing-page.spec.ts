import { test, expect } from "@playwright/test";

test("landing page loads correctly", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByText("Build Faster. Work Smarter.")).toBeVisible();
  await expect(page.getByText(/streamline your workflow/i)).toBeVisible();

  // CTA buttons
  await expect(page.getByRole("link", { name: "View Demo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();

  // Feature cards
  await expect(page.getByText("Fast Setup")).toBeVisible();
  await expect(page.getByText("Modern Stack")).toBeVisible();
  await expect(page.getByText("Scalable Design")).toBeVisible();
});

test("CTA buttons navigate correctly", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "View Demo" }).click();
  await expect(page).toHaveURL("/demo");

  await page.goto("/");
  await page.getByRole("link", { name: "Get Started" }).click();
  await expect(page).toHaveURL("/signup");
});
