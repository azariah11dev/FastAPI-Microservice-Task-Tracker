import { test, expect, Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------
const MOCK_ENTRY = {
  timestamp: 1700000000000,
  readable: "2023-11-14 12:00:00",
  name: "Sprint Planning",
  tasks: ["Build login page", "Write unit tests"],
  statuses: {
    "Build login page": "in_progress",
    "Write unit tests": "not_started",
  },
  analysis: {
    queries: {
      "Build login page": {
        estimated_duration_hours: 4,
        confidence_score: 0.9,
        requirements: ["React", "Tailwind CSS"],
      },
      "Write unit tests": {
        estimated_duration_hours: 2,
        confidence_score: 0.8,
        requirements: ["Jest", "React Testing Library"],
      },
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Seed localStorage before the page JS runs via storageState or addInitScript */
async function seedStorage(page: Page, entries: any[] = [MOCK_ENTRY]) {
  await page.addInitScript((data) => {
    localStorage.setItem("analysis_history", JSON.stringify(data));
  }, entries);
}

/** Mock both network calls so tests are fully offline */
async function mockNetwork(page: Page, backendEntries: any[] = []) {
  await page.route("**/task_retrieval/existing_tasks", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify(backendEntries) })
  );
  await page.route("**/query_builder/save_tasks", (route) =>
    route.fulfill({ status: 200, body: JSON.stringify({ ok: true }) })
  );
}

async function mockNetworkBackendFail(page: Page) {
  await page.route("**/task_retrieval/existing_tasks", (route) =>
    route.abort("failed")
  );
}

/** Login helper — reusable across suites */
async function login(page: Page, username = "Azariah", targetPath = "/task-management") {
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator('input[placeholder="Enter username"]').waitFor({ state: "visible" });

  await page.evaluate(() => {
    window.localStorage.setItem("access_token", "abc123");
    window.localStorage.setItem("username", "Azariah");
    window.localStorage.setItem("role", "user");
  });

  if (targetPath !== "/dashboard") {
    await page.goto(targetPath, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(new RegExp(`^http://localhost:3000${targetPath.replace(/\//g, "\\/")}$`));
  }
}

// ===========================================================================
// SUITE 1 — Auth & page load
// ===========================================================================
test.beforeEach(async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    window.localStorage.clear();
  }).catch(() => undefined);
});

test.describe("TaskManagement — auth & page load", () => {
  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/task-management", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test("page loads after login and shows heading", async ({ page }) => {
    await seedStorage(page, []);
    await mockNetwork(page);
    await login(page);

    await expect(page.getByRole("heading", { name: /task history/i })).toBeVisible();
  });

  test("shows empty state when no history and backend returns empty list", async ({
    page,
  }) => {
    await seedStorage(page, []);
    await mockNetwork(page, []);
    await login(page);

    await expect(page.getByText(/no past analyses found/i)).toBeVisible();
  });
});

// ===========================================================================
// SUITE 2 — Loading & backend error states
// ===========================================================================
test.describe("TaskManagement — loading & backend error", () => {
  test("shows loading message while backend is pending", async ({ page }) => {
    await seedStorage(page, []);

    // Delay backend response long enough to catch the loading state
    await page.route("**/task_retrieval/existing_tasks", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      await route.fulfill({ status: 200, body: "[]" });
    });

    await login(page);

    await expect(page.getByText(/checking for saved analyses/i)).toBeVisible();
  });

  test("shows warning banner when backend fetch fails", async ({ page }) => {
    await seedStorage(page, []);
    await mockNetworkBackendFail(page);
    await login(page);

    await expect(
      page.getByText(/showing local analyses only/i)
    ).toBeVisible();
  });

  test("does NOT show warning banner when backend succeeds", async ({
    page,
  }) => {
    await seedStorage(page, []);
    await mockNetwork(page, []);
    await login(page);

    await expect(
      page.getByText(/showing local analyses only/i)
    ).not.toBeVisible();
  });
});

// ===========================================================================
// SUITE 3 — Entry rendering
// ===========================================================================
test.describe("TaskManagement — entry rendering", () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);
  });

  test("renders entry name from localStorage", async ({ page }) => {
    await expect(page.getByText("Sprint Planning")).toBeVisible();
  });

  test("renders readable timestamp", async ({ page }) => {
    await expect(page.getByText(MOCK_ENTRY.readable)).toBeVisible();
  });

  test("renders View Details toggle button", async ({ page }) => {
    await expect(page.getByText("View Details")).toBeVisible();
  });
});

// ===========================================================================
// SUITE 4 — Expand / collapse
// ===========================================================================
test.describe("TaskManagement — expand / collapse", () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);
  });

  test("task details are hidden by default", async ({ page }) => {
    await expect(page.getByText("Build login page")).not.toBeVisible();
  });

  test("clicking View Details expands the card", async ({ page }) => {
    await page.click("text=View Details");

    await expect(page.getByText("Build login page")).toBeVisible();
    await expect(page.getByText("Write unit tests")).toBeVisible();
  });

  test("clicking Hide Details collapses the card", async ({ page }) => {
    await page.click("text=View Details");
    await expect(page.getByText("Build login page")).toBeVisible();

    await page.click("text=Hide Details");
    await expect(page.getByText("Build login page")).not.toBeVisible();
  });

  test("toggle label changes between View Details and Hide Details", async ({
    page,
  }) => {
    await expect(page.getByText("View Details")).toBeVisible();

    await page.click("text=View Details");
    await expect(page.getByText("Hide Details")).toBeVisible();

    await page.click("text=Hide Details");
    await expect(page.getByText("View Details")).toBeVisible();
  });
});

// ===========================================================================
// SUITE 5 — Task details content
// ===========================================================================
test.describe("TaskManagement — task details content", () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);
    await page.click("text=View Details");
  });

  test("shows estimated hours for each task", async ({ page }) => {
    await expect(page.getByText("Estimated Hours: 4")).toBeVisible();
    await expect(page.getByText("Estimated Hours: 2")).toBeVisible();
  });

  test("shows confidence score for each task", async ({ page }) => {
    await expect(page.getByText("0.9")).toBeVisible();
    await expect(page.getByText("0.8")).toBeVisible();
  });

  test("shows all requirements as list items", async ({ page }) => {
    await expect(page.getByText(/^React$/)).toBeVisible();
    await expect(page.getByText("Tailwind CSS")).toBeVisible();
    await expect(page.getByText("Jest")).toBeVisible();
    await expect(page.getByText("React Testing Library")).toBeVisible();
  });

  test("shows correct total hours", async ({ page }) => {
    await expect(page.getByText(/total estimated time:\s*6\.00 hrs/i)).toBeVisible();
  });

  test("shows correct remaining hours based on initial statuses", async ({
    page,
  }) => {
    // "in_progress" task = 4 hrs + "not_started" task = 2 hrs → 6 remaining
    await expect(page.getByText(/remaining:\s*6\.00 hrs/i)).toBeVisible();
  });

  test("shows task completed count", async ({ page }) => {
    await expect(page.getByText(/tasks \(0\/2 completed\)/i)).toBeVisible();
  });
});

// ===========================================================================
// SUITE 6 — Status select
// ===========================================================================
test.describe("TaskManagement — status selects", () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);
    await page.click("text=View Details");
  });

  test("status selects reflect initial statuses from localStorage", async ({
    page,
  }) => {
    const selects = page.locator("select");
    await expect(selects.nth(0)).toHaveValue("in_progress");
    await expect(selects.nth(1)).toHaveValue("not_started");
  });

  test("changing status to completed updates the select", async ({ page }) => {
    const select = page.locator("select").first();
    await select.selectOption("completed");
    await expect(select).toHaveValue("completed");
  });

  test("marking task completed reduces remaining hours", async ({ page }) => {
    await page.locator("select").first().selectOption("completed");
    // 4 hrs completed → 2 remaining
    await expect(page.getByText(/remaining:\s*2\.00 hrs/i)).toBeVisible();
  });

  test("marking all tasks completed shows 0 remaining hours", async ({
    page,
  }) => {
    const selects = page.locator("select");
    await selects.nth(0).selectOption("completed");
    await selects.nth(1).selectOption("completed");

    await expect(page.getByText(/remaining:\s*0\.00 hrs/i)).toBeVisible();
  });

  test("completed task name gets strike-through style", async ({ page }) => {
    await page.locator("select").first().selectOption("completed");

    const taskName = page.getByText("Build login page");
    await expect(taskName).toHaveClass(/line-through/);
  });

  test("completed count heading updates when tasks are marked done", async ({
    page,
  }) => {
    await page.locator("select").first().selectOption("completed");
    await expect(page.getByText(/tasks \(1\/2 completed\)/i)).toBeVisible();
  });
});

// ===========================================================================
// SUITE 7 — Inline rename
// ===========================================================================
test.describe("TaskManagement — inline rename", () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);
  });

  test("clicking entry name shows an input field", async ({ page }) => {
    await page.click("text=Sprint Planning");
    await expect(page.locator("input[type=text], input:not([type])").first()).toBeVisible();
  });

  test("pressing Enter commits the new name", async ({ page }) => {
    await page.click("text=Sprint Planning");
    await page.keyboard.press("Control+a");
    await page.keyboard.type("Q4 Sprint");
    await page.keyboard.press("Enter");

    await expect(page.getByText("Q4 Sprint")).toBeVisible();
  });

  test("pressing Escape cancels rename", async ({ page }) => {
    await page.click("text=Sprint Planning");
    await page.keyboard.press("Control+a");
    await page.keyboard.type("Abandoned Name");
    await page.keyboard.press("Escape");

    await expect(page.getByText("Sprint Planning")).toBeVisible();
    await expect(page.getByText("Abandoned Name")).not.toBeVisible();
  });

  test("blurring the input commits the rename", async ({ page }) => {
    await page.click("text=Sprint Planning");
    await page.keyboard.press("Control+a");
    await page.keyboard.type("Blurred Name");
    await page.locator("h1").click(); // click away to blur

    await expect(page.getByText("Blurred Name")).toBeVisible();
  });
});

// ===========================================================================
// SUITE 8 — Discard
// ===========================================================================
test.describe("TaskManagement — discard", () => {
  test("clicking Discard removes entry from the list", async ({ page }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);

    await page.click("text=View Details");
    await page.click("text=Discard");

    await expect(page.getByText("Sprint Planning")).not.toBeVisible();
    await expect(page.getByText(/no past analyses found/i)).toBeVisible();
  });

  test("multiple entries: discarding one leaves the other intact", async ({
    page,
  }) => {
    const second = { ...MOCK_ENTRY, timestamp: 1700000001000, name: "Second Entry" };
    await seedStorage(page, [MOCK_ENTRY, second]);
    await mockNetwork(page);
    await login(page);

    // Open and discard only the first card
    const firstCard = page
      .locator("div.bg-\\[\\#1f2833\\]")
      .filter({ has: page.locator("h2", { hasText: "Sprint Planning" }) })
      .first();
    await firstCard.getByRole("button", { name: "View Details" }).click();
    await expect(firstCard.getByRole("button", { name: "Discard" })).toBeVisible();
    await firstCard.getByRole("button", { name: "Discard" }).click();

    await expect(page.getByText("Sprint Planning")).not.toBeVisible();
    await expect(page.getByText("Second Entry")).toBeVisible();
  });
});

// ===========================================================================
// SUITE 9 — Save (POST)
// ===========================================================================
test.describe("TaskManagement — save", () => {
  test.beforeEach(async ({ page }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);
    await page.click("text=View Details");
  });

  test("shows 'Saved!' after a successful save", async ({ page }) => {
    await page.click("text=Save");
    await expect(page.getByText("Saved!")).toBeVisible();
  });

  test("shows error text when save endpoint returns non-OK", async ({
    page,
  }) => {
    await page.route("**/query_builder/save_tasks", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" })
    );

    await page.click("text=Save");
    await expect(
      page.getByText(/save endpoint not implemented yet/i)
    ).toBeVisible();
  });

  test("POST is sent to the correct endpoint", async ({ page }) => {
    let capturedUrl = "";
    await page.route("**/query_builder/save_tasks", (route) => {
      capturedUrl = route.request().url();
      route.fulfill({ status: 200, body: "{}" });
    });

    const requestPromise = page.waitForRequest("**/query_builder/save_tasks");
    await page.getByRole("button", { name: "Save" }).click();
    const request = await requestPromise;

    expect(request.url()).toContain("/query_builder/save_tasks");
  });

  test("POST payload contains expected fields", async ({ page }) => {
    let body: any = null;
    await page.route("**/query_builder/save_tasks", async (route) => {
      body = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, body: "{}" });
    });

    const requestPromise = page.waitForRequest("**/query_builder/save_tasks");
    await page.getByRole("button", { name: "Save" }).click();
    await requestPromise;

    expect(body.timestamp).toBe(MOCK_ENTRY.timestamp);
    expect(body.name).toBe("Sprint Planning");
    expect(body.tasks).toEqual(MOCK_ENTRY.tasks);
    expect(typeof body.total_estimated_hours).toBe("number");
    expect(typeof body.remaining_estimated_hours).toBe("number");
  });

  test("payload analysis does not include 'raw' field", async ({ page }) => {
    let body: any = null;
    await page.route("**/query_builder/save_tasks", async (route) => {
      body = JSON.parse(route.request().postData() || "{}");
      await route.fulfill({ status: 200, body: "{}" });
    });

    const requestPromise = page.waitForRequest("**/query_builder/save_tasks");
    await page.getByRole("button", { name: "Save" }).click();
    await requestPromise;

    const firstTask = Object.values(body.analysis.queries)[0] as any;
    expect(firstTask).not.toHaveProperty("raw");
  });
});

// ===========================================================================
// SUITE 10 — Navigation (from task management page)
// ===========================================================================
test.describe("TaskManagement — navigation", () => {
  test("navigating away and back preserves localStorage entries", async ({
    page,
  }) => {
    await seedStorage(page);
    await mockNetwork(page);
    await login(page);

    // Navigate away
    await page.goto("/dashboard");
    // Return
    await page.goto("/task-management");
    await mockNetwork(page);

    await expect(page.getByText("Sprint Planning")).toBeVisible();

  });
});