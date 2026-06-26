import { render, screen, fireEvent } from "@testing-library/react";
import TopBar from "@/app/(protected)/components/topBar";

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("TopBar", () => {
  it("shows Guest when no user is logged in", () => {
    render(<TopBar />);
    expect(screen.getByText("Guest")).toBeInTheDocument();
  });

  it("shows username and role when logged in", () => {
    localStorage.setItem("username", "azariah");
    localStorage.setItem("role", "admin");

    render(<TopBar />);

    expect(screen.getByText("azariah (admin)")).toBeInTheDocument();
  });

  it("renders date and time", () => {
    const fixedDate = new Date("2024-01-01T12:34:00");
    jest.setSystemTime(fixedDate);

    render(<TopBar />);

    expect(screen.getByText("Mon, Jan 1")).toBeInTheDocument();
    expect(screen.getByText("12:34")).toBeInTheDocument();
  });

  it("clears localStorage on logout", () => {
    localStorage.setItem("username", "azariah");
    localStorage.setItem("role", "admin");
    localStorage.setItem("access_token", "abc123");

    delete (window as any).location;
    (window as any).location = { href: "" };

    render(<TopBar />);

    fireEvent.click(screen.getByText("Logout"));

    expect(localStorage.getItem("username")).toBeNull();
    expect(localStorage.getItem("role")).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});
