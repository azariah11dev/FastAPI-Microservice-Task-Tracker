import { test, expect } from "@playwright/test";

test("contact page loads correctly", async ({ page }) => {
  await page.goto("/contact");

  await expect(page.getByText("Contact Us")).toBeVisible();
  await expect(
    page.getByText(/Have a question or want to work together/i)
  ).toBeVisible();
});

test("user can fill out and submit the contact form", async ({ page }) => {
  await page.goto("/contact");

  await page.fill('input[name="name"]', "John Doe");
  await page.fill('input[name="email"]', "john@example.com");
  await page.fill('textarea[name="message"]', "Hello from Playwright!");

  // Intercept backend call (optional)
  await page.route("**/contact/all_questions", (route) =>
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true }),
    })
  );

  await page.click('button[type="submit"]');

  await expect(
    page.getByText("Message sent successfully.")
  ).toBeVisible();
});
