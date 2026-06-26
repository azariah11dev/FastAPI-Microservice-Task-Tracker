import { render, screen } from "@testing-library/react";
import Dashboard from "@/app/(protected)/dashboard/page";

beforeEach(() => {
  localStorage.clear();
});

describe("Dashboard Component", () => {
  it("shows generic welcome when no username", () => {
    render(<Dashboard />);
    expect(screen.getByText("Welcome.")).toBeInTheDocument();
  });

  it("shows personalized welcome when username exists", () => {
    localStorage.setItem("username", "Azariah");

    render(<Dashboard />);
    expect(screen.getByText("Welcome, Azariah.")).toBeInTheDocument();
  });

  it("renders quick action cards", () => {
    render(<Dashboard />);

    expect(screen.getByText("Create Tasks")).toBeInTheDocument();
    expect(screen.getByText("Task Management")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("renders info section", () => {
    render(<Dashboard />);

    expect(screen.getByText("What's Next?")).toBeInTheDocument();
    expect(
      screen.getByText("Generate smart schedules based on your availability")
    ).toBeInTheDocument();
  });
});
