import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CreateTask from "@/app/(protected)/create-task/page";

global.fetch = jest.fn();
console.error = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

describe("CreateTask Component", () => {
  it("adds tasks to the list", () => {
    render(<CreateTask />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task A" },
    });

    fireEvent.click(screen.getByText("Add Task"));

    expect(screen.getByText("Task A")).toBeInTheDocument();
  });

  it("does not add empty tasks", () => {
    render(<CreateTask />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "   " },
    });

    fireEvent.click(screen.getByText("Add Task"));

    expect(screen.queryByText("   ")).not.toBeInTheDocument();
  });

  it("selects and removes a task", () => {
    render(<CreateTask />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task A" },
    });
    fireEvent.click(screen.getByText("Add Task"));

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task B" },
    });
    fireEvent.click(screen.getByText("Add Task"));

    fireEvent.click(screen.getByText("Task A")); // select first task
    fireEvent.click(screen.getByText("Remove Task"));

    expect(screen.queryByText("Task A")).not.toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
  });

  it("shows loading overlay during analysis", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ summary: "ok" }),
    });

    render(<CreateTask />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task A" },
    });
    fireEvent.click(screen.getByText("Add Task"));

    fireEvent.click(screen.getByText("Analyze"));

    expect(screen.getByText("Analyzing tasks...")).toBeInTheDocument();

    await waitFor(() =>
      expect(
        screen.queryByText("Analyzing tasks...")
      ).not.toBeInTheDocument()
    );
  });

  it("writes analysis history to localStorage", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ summary: "ok" }),
    });

    render(<CreateTask />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task A" },
    });
    fireEvent.click(screen.getByText("Add Task"));

    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() => {
      const history = JSON.parse(
        localStorage.getItem("analysis_history") || "[]"
      );
      expect(history.length).toBe(1);
      expect(history[0].tasks).toEqual(["Task A"]);
      expect(history[0].analysis).toEqual({ summary: "ok" });
    });
  });

  it("shows modal after successful analysis", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ summary: "ok" }),
    });

    render(<CreateTask />);

    fireEvent.change(screen.getByRole("textbox"), {
      target: { value: "Task A" },
    });
    fireEvent.click(screen.getByText("Add Task"));

    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() =>
      expect(
        screen.getByText("What would you like to do?")
      ).toBeInTheDocument()
    );
  });

  it("handles network error", async () => {
    window.alert = jest.fn();
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<CreateTask />);

    fireEvent.click(screen.getByText("Analyze"));

    await waitFor(() =>
      expect(window.alert).toHaveBeenCalledWith("Something went wrong")
    );
  });
});
