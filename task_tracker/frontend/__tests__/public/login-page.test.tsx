import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/(public)/login/page";


// --- Mock fetch ---
global.fetch = jest.fn();

// --- Mock alert ---
window.alert = jest.fn();

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders heading and inputs", () => {
    render(<LoginPage />);

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter password")).toBeInTheDocument();
  });

  it("updates form fields", () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "azariah" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "secret" },
    });

    expect(screen.getByDisplayValue("azariah")).toBeInTheDocument();
    expect(screen.getByDisplayValue("secret")).toBeInTheDocument();
  });

  it("handles successful login", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "abc123",
        username: "azariah",
        role: "user",
      }),
    });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "azariah" },
    });

    fireEvent.change(screen.getByPlaceholderText("Enter password"), {
      target: { value: "secret" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign In" }).closest("form")!
    );

    await waitFor(() => {
      expect(localStorage.getItem("access_token")).toBe("abc123");
      expect(localStorage.getItem("username")).toBe("azariah");
      expect(localStorage.getItem("role")).toBe("user");
    });
  });

  it("handles invalid credentials", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "Invalid username or password" }),
    });

    render(<LoginPage />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign In" }).closest("form")!
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Invalid username or password"
      );
    });
  });

  it("handles network error", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<LoginPage />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign In" }).closest("form")!
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Something went wrong");
    });
  });
});
