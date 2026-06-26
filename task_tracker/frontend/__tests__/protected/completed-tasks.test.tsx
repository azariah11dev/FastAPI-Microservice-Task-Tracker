import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CompletedTasksPage from "@/app/(protected)/completed-tasks/page";

global.fetch = jest.fn();
console.error = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe("CompletedTasksPage", () => {
  it("shows loading state initially", () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<CompletedTasksPage />);
    expect(
      screen.getByText("Checking for completed analyses...")
    ).toBeInTheDocument();
  });

  it("shows backend error message", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<CompletedTasksPage />);

    await waitFor(() =>
      expect(
        screen.getByText("Could not reach backend — showing nothing.")
      ).toBeInTheDocument()
    );
  });

  it("shows empty state when no completed tasks", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<CompletedTasksPage />);

    await waitFor(() =>
      expect(
        screen.getByText("No completed analyses found.")
      ).toBeInTheDocument()
    );
  });

  it("renders completed tasks from backend", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          timestamp: 123,
          name: "Analysis A",
          readable: "Jan 1, 2024",
          tasks: ["Task 1", "Task 2"],
          total_estimated_hours: 5,
          remaining_estimated_hours: 0,
        },
      ],
    });

    render(<CompletedTasksPage />);

    await waitFor(() =>
      expect(screen.getByText("Analysis A")).toBeInTheDocument()
    );

    expect(screen.getByText("Task 1")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Total Hours: 5")).toBeInTheDocument();
  });

  it("deletes a task entry", async () => {
    // First fetch: load tasks
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          timestamp: 123,
          name: "Analysis A",
          readable: "Jan 1, 2024",
          tasks: ["Task 1"],
          total_estimated_hours: 3,
          remaining_estimated_hours: 0,
        },
      ],
    });

    // Second fetch: delete request
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    render(<CompletedTasksPage />);

    await waitFor(() =>
      expect(screen.getByText("Analysis A")).toBeInTheDocument()
    );

    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() =>
      expect(screen.queryByText("Analysis A")).not.toBeInTheDocument()
    );
  });
});
