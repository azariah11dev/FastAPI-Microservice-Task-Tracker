import { test, expect } from "@playwright/test";

test("navbar renders and links navigate correctly", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Navbar visible
  await expect(page.getByText("Task Forge")).toBeVisible();

  // Features link
  await page.getByRole("link", { name: "Features" }).click();
  await expect(page).toHaveURL("/features");

  // Back to home
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // About link
  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL("/about");

  // Back to home
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Contact link
  await page.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL("/contact");

  // Back to home
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // Login link
  await page.getByRole("link", { name: "Login" }).click();
  await expect(page).toHaveURL("/login");
});
