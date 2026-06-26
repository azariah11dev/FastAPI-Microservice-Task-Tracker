import { render, screen, waitFor } from "@testing-library/react";
import AnalyticsPage from "@/app/(protected)/analytics/page";

global.fetch = jest.fn();
console.error = jest.fn(); // silence expected errors

describe("AnalyticsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows loading state initially", () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<AnalyticsPage />);

    expect(screen.getByText("Loading analytics...")).toBeInTheDocument();
  });

  it("renders analytics correctly after successful fetch", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          tasks: [{}, {}, {}], // 3 tasks
          total_estimated_hours: 10,
          remaining_estimated_hours: 0,
        },
        {
          tasks: [{}], // 1 task
          total_estimated_hours: 5,
          remaining_estimated_hours: 2,
        },
      ],
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(
        screen.queryByText("Loading analytics...")
      ).not.toBeInTheDocument();
    });

    // Total analyses = 2
    expect(screen.getByText("2")).toBeInTheDocument();

    // Completed analyses = 1
    expect(screen.getByText("1")).toBeInTheDocument();

    // Completion rate = 50.0%
    expect(screen.getByText("50.0%")).toBeInTheDocument();

    // Total tasks = 4
    expect(screen.getByText("4")).toBeInTheDocument();

    // Avg tasks per analysis = 2.0
    expect(screen.getByText("2.0")).toBeInTheDocument();

    // Avg hours per analysis = (10 + 5) / 2 = 7.5
    expect(screen.getByText("7.5")).toBeInTheDocument();
  });

  it("shows error message when backend fails", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Could not load analytics — backend unreachable.")
      ).toBeInTheDocument();
    });
  });

  it("shows error message on network error", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<AnalyticsPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Could not load analytics — backend unreachable.")
      ).toBeInTheDocument();
    });
  });
});
