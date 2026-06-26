import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskManagement from "@/app/(protected)/task-management/page";

// ---------------------------------------------------------------------------
// Global fetch mock
// ---------------------------------------------------------------------------
const mockFetch = jest.fn();
global.fetch = mockFetch;

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
function seedLocalStorage(entries: any[] = [MOCK_ENTRY]) {
  localStorage.setItem("analysis_history", JSON.stringify(entries));
}

function backendOk(entries: any[] = []) {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => entries,
  } as unknown as Response);
}

function backendFail() {
  mockFetch.mockRejectedValueOnce(new Error("Network error"));
}

function saveOk() {
  mockFetch.mockResolvedValueOnce({ ok: true } as unknown as Response);
}

function saveFail() {
  mockFetch.mockResolvedValueOnce({ ok: false } as unknown as Response);
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------
beforeEach(() => {
  localStorage.clear();
  mockFetch.mockReset();
});

// ===========================================================================
// SUITE 1 — Initial render & localStorage
// ===========================================================================
describe("TaskManagement — initial render", () => {
  it("shows empty state when no history exists and backend fails", async () => {
    backendFail();
    render(<TaskManagement />);

    await waitFor(() =>
      expect(
        screen.getByText(/no past analyses found/i)
      ).toBeInTheDocument()
    );
  });

  it("reads and displays entries from localStorage immediately", async () => {
    seedLocalStorage();
    backendOk();

    render(<TaskManagement />);

    // Name appears before backend resolves
    expect(screen.getByText("Sprint Planning")).toBeInTheDocument();
  });

  it("shows the readable timestamp for each entry", async () => {
    seedLocalStorage();
    backendOk();

    render(<TaskManagement />);

    expect(screen.getByText(MOCK_ENTRY.readable)).toBeInTheDocument();
  });

  it("shows 'Checking for saved analyses…' while backend is loading", () => {
    seedLocalStorage();
    // Never resolves — keeps the loading state active
    mockFetch.mockReturnValueOnce(new Promise(() => {}));

    render(<TaskManagement />);

    expect(
      screen.getByText(/checking for saved analyses/i)
    ).toBeInTheDocument();
  });

  it("shows a warning banner when backend fetch fails", async () => {
    backendFail();
    render(<TaskManagement />);

    await waitFor(() =>
      expect(
        screen.getByText(/showing local analyses only/i)
      ).toBeInTheDocument()
    );
  });

  it("does NOT show the warning banner when backend succeeds", async () => {
    backendOk();
    render(<TaskManagement />);

    await waitFor(() =>
      expect(
        screen.queryByText(/showing local analyses only/i)
      ).not.toBeInTheDocument()
    );
  });
});

// ===========================================================================
// SUITE 2 — Backend merge
// ===========================================================================
describe("TaskManagement — backend merge", () => {
  it("merges backend entries with local entries (no duplicates)", async () => {
    const localEntry = { ...MOCK_ENTRY, name: "Local Only" };
    const backendEntry = {
      ...MOCK_ENTRY,
      timestamp: 1700000001000,
      name: "Backend Only",
    };

    seedLocalStorage([localEntry]);
    backendOk([backendEntry]);

    render(<TaskManagement />);

    await waitFor(() => {
      expect(screen.getByText("Local Only")).toBeInTheDocument();
      expect(screen.getByText("Backend Only")).toBeInTheDocument();
    });
  });

  it("backend entry wins when timestamps collide", async () => {
    const localEntry = { ...MOCK_ENTRY, name: "Local Name" };
    const backendEntry = { ...MOCK_ENTRY, name: "Backend Name" }; // same timestamp

    seedLocalStorage([localEntry]);
    backendOk([backendEntry]);

    render(<TaskManagement />);

    await waitFor(() => {
      expect(screen.getByText("Backend Name")).toBeInTheDocument();
      expect(screen.queryByText("Local Name")).not.toBeInTheDocument();
    });
  });

  it("renders multiple entries in descending timestamp order", async () => {
    const older = { ...MOCK_ENTRY, timestamp: 1000, name: "Older Entry" };
    const newer = { ...MOCK_ENTRY, timestamp: 9000, name: "Newer Entry" };

    seedLocalStorage([older, newer]);
    backendOk();

    render(<TaskManagement />);

    const headings = await screen.findAllByRole("heading", { level: 2 });
    const names = headings.map((h) => h.textContent);

    expect(names.indexOf("Newer Entry")).toBeLessThan(
      names.indexOf("Older Entry")
    );
  });
});

// ===========================================================================
// SUITE 3 — HistoryCard expand / collapse
// ===========================================================================
describe("HistoryCard — expand / collapse", () => {
  beforeEach(() => {
    seedLocalStorage();
    backendOk();
  });

  it("hides task details by default", async () => {
    render(<TaskManagement />);

    await screen.findByText("Sprint Planning");

    expect(screen.queryByText("Build login page")).not.toBeInTheDocument();
  });

  it("reveals task details after clicking 'View Details'", async () => {
    render(<TaskManagement />);

    const toggle = await screen.findByText("View Details");
    fireEvent.click(toggle);

    expect(screen.getByText("Build login page")).toBeInTheDocument();
    expect(screen.getByText("Write unit tests")).toBeInTheDocument();
  });

  it("shows 'Hide Details' label when expanded", async () => {
    render(<TaskManagement />);

    fireEvent.click(await screen.findByText("View Details"));

    expect(screen.getByText("Hide Details")).toBeInTheDocument();
  });

  it("collapses again when 'Hide Details' is clicked", async () => {
    render(<TaskManagement />);

    const toggle = await screen.findByText("View Details");
    fireEvent.click(toggle);
    fireEvent.click(screen.getByText("Hide Details"));

    expect(screen.queryByText("Build login page")).not.toBeInTheDocument();
  });
});

// ===========================================================================
// SUITE 4 — Task status
// ===========================================================================
describe("HistoryCard — task status", () => {
  beforeEach(async () => {
    seedLocalStorage();
    backendOk();
  });

  it("shows status selects with correct initial values", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    const values = selects.map((s) => s.value);

    expect(values).toContain("in_progress");
    expect(values).toContain("not_started");
  });

  it("updates task status when select changes", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    const selects = screen.getAllByRole("combobox") as HTMLSelectElement[];
    fireEvent.change(selects[0], { target: { value: "completed" } });

    expect(selects[0].value).toBe("completed");
  });

  it("strikes through task name when status is 'completed'", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "completed" } });

    const taskHeading = screen.getByText("Build login page");
    expect(taskHeading).toHaveClass("line-through");
  });

  it("persists status change to localStorage", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "completed" } });

    const saved = JSON.parse(localStorage.getItem("analysis_history") || "[]");
    expect(saved[0].statuses["Write unit tests"]).toBe("completed");
  });
});

// ===========================================================================
// SUITE 5 — Hour totals
// ===========================================================================
describe("HistoryCard — hour totals", () => {
  beforeEach(async () => {
    seedLocalStorage();
    backendOk();
  });

  it("displays correct total estimated hours", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    // 4 + 2 = 6
    expect(screen.getByText(/total estimated time:\s*6\.00 hrs/i)).toBeInTheDocument();
  });

  it("displays correct remaining hours (excludes completed tasks)", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    // Mark first task completed (4 hrs) — remaining should be 2
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "completed" } });

    expect(screen.getByText(/remaining:\s*2\.00 hrs/i)).toBeInTheDocument();
  });

  it("shows 0 remaining hours when all tasks are completed", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    const selects = screen.getAllByRole("combobox");
    selects.forEach((s) => fireEvent.change(s, { target: { value: "completed" } }));

    expect(screen.getByText(/remaining:\s*0\.00 hrs/i)).toBeInTheDocument();
  });

  it("shows task completed count in heading", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    expect(screen.getByText(/tasks \(0\/2 completed\)/i)).toBeInTheDocument();

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "completed" } });

    expect(screen.getByText(/tasks \(1\/2 completed\)/i)).toBeInTheDocument();
  });
});

// ===========================================================================
// SUITE 6 — Inline rename
// ===========================================================================
describe("HistoryCard — inline rename", () => {
  beforeEach(() => {
    seedLocalStorage();
    backendOk();
  });

  it("shows an input when the entry name is clicked", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("Sprint Planning"));

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("commits rename on Enter", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("Sprint Planning"));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Q4 Sprint" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("Q4 Sprint")).toBeInTheDocument();
  });

  it("cancels rename on Escape", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("Sprint Planning"));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Abandoned Name" } });
    fireEvent.keyDown(input, { key: "Escape" });

    expect(screen.getByText("Sprint Planning")).toBeInTheDocument();
    expect(screen.queryByText("Abandoned Name")).not.toBeInTheDocument();
  });

  it("commits rename on blur", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("Sprint Planning"));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Blurred Name" } });
    fireEvent.blur(input);

    expect(screen.getByText("Blurred Name")).toBeInTheDocument();
  });

  it("falls back to generated name when blank on commit", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("Sprint Planning"));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(screen.getByText("Analysis #1")).toBeInTheDocument();
  });

  it("persists renamed entry to localStorage", async () => {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("Sprint Planning"));

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "Persisted Name" } });
    fireEvent.keyDown(input, { key: "Enter" });

    const saved = JSON.parse(localStorage.getItem("analysis_history") || "[]");
    expect(saved[0].name).toBe("Persisted Name");
  });
});

// ===========================================================================
// SUITE 7 — Discard
// ===========================================================================
describe("HistoryCard — discard", () => {
  it("removes entry from the list after clicking Discard", async () => {
    seedLocalStorage();
    backendOk();

    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));
    fireEvent.click(screen.getByText("Discard"));

    expect(screen.queryByText("Sprint Planning")).not.toBeInTheDocument();
    expect(screen.getByText(/no past analyses found/i)).toBeInTheDocument();
  });

  it("removes discarded entry from localStorage", async () => {
    seedLocalStorage();
    backendOk();

    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));
    fireEvent.click(screen.getByText("Discard"));

    const saved = JSON.parse(localStorage.getItem("analysis_history") || "[]");
    expect(saved).toHaveLength(0);
  });
});

// ===========================================================================
// SUITE 8 — Save (POST)
// ===========================================================================
describe("HistoryCard — save", () => {
  beforeEach(() => {
    // First fetch call = GET for backend history
    backendOk();
    seedLocalStorage();
  });

  async function openAndSave() {
    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));
    fireEvent.click(screen.getByText("Save"));
  }

  it("shows 'Saving…' while POST is in-flight", async () => {
    mockFetch.mockReturnValueOnce(new Promise(() => {})); // POST never resolves

    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));
    fireEvent.click(screen.getByText("Save"));

    expect(screen.getByText("Saving...")).toBeInTheDocument();
  });

  it("shows 'Saved!' after successful POST", async () => {
    saveOk();
    await openAndSave();

    await waitFor(() =>
      expect(screen.getByText("Saved!")).toBeInTheDocument()
    );
  });

  it("shows error message after failed POST", async () => {
    saveFail();
    await openAndSave();

    await waitFor(() =>
      expect(
        screen.getByText(/save endpoint not implemented yet/i)
      ).toBeInTheDocument()
    );
  });

  it("sends POST to the correct endpoint", async () => {
    saveOk();
    await openAndSave();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2)); // GET + POST

    const [url, options] = mockFetch.mock.calls[1];
    expect(url).toBe("http://localhost:8000/query_builder/save_tasks");
    expect(options.method).toBe("POST");
  });

  it("payload includes timestamp, name, tasks, statuses, and cleaned analysis", async () => {
    saveOk();
    await openAndSave();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    const body = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body.timestamp).toBe(MOCK_ENTRY.timestamp);
    expect(body.name).toBe("Sprint Planning");
    expect(body.tasks).toEqual(MOCK_ENTRY.tasks);
    expect(body.statuses).toBeDefined();
    expect(body.analysis.queries["Build login page"]).not.toHaveProperty("raw");
  });

  it("payload total_estimated_hours equals sum of all task hours", async () => {
    saveOk();
    await openAndSave();

    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));

    const body = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body.total_estimated_hours).toBeCloseTo(6, 2);
  });
});

// ===========================================================================
// SUITE 9 — Task requirements
// ===========================================================================
describe("HistoryCard — task requirements", () => {
  it("renders all requirements as list items", async () => {
    seedLocalStorage();
    backendOk();

    render(<TaskManagement />);
    fireEvent.click(await screen.findByText("View Details"));

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("Tailwind CSS")).toBeInTheDocument();
    expect(screen.getByText("Jest")).toBeInTheDocument();
    expect(screen.getByText("React Testing Library")).toBeInTheDocument();
  });
});