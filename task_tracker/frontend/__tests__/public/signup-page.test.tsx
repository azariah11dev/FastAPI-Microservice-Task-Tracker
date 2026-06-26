import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import SignUpPage from "@/app/(public)/signup/page";


// --- Mock fetch ---
global.fetch = jest.fn();

// --- Mock alert ---
window.alert = jest.fn();

describe("Sign Up Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("renders heading and inputs", () => {
    render(<SignUpPage />);

    expect(screen.getByText("Create Account")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Create a password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Re-enter password")).toBeInTheDocument();
  });

  it("updates form fields", () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "azariah" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "azariah@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: "secret" },
    });

    fireEvent.change(screen.getByPlaceholderText("Re-enter password"), {
      target: { value: "secret" },
    });

    expect(screen.getByDisplayValue("azariah")).toBeInTheDocument();
    expect(screen.getByDisplayValue("azariah@example.com")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("secret")).toHaveLength(2);
  });

  it("alerts when passwords do not match", () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: "abc" },
    });

    fireEvent.change(screen.getByPlaceholderText("Re-enter password"), {
      target: { value: "xyz" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign Up" }).closest("form")!
    );

    expect(window.alert).toHaveBeenCalledWith("Passwords do not match");
  });

  it("handles successful registration", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(<SignUpPage />);

    fireEvent.change(screen.getByPlaceholderText("Enter username"), {
      target: { value: "azariah" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "azariah@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("Create a password"), {
      target: { value: "secret" },
    });

    fireEvent.change(screen.getByPlaceholderText("Re-enter password"), {
      target: { value: "secret" },
    });

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign Up" }).closest("form")!
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Registration successful! Please log in."
      );
    });
  });

  it("handles registration failure", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ detail: "User already exists" }),
    });

    render(<SignUpPage />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign Up" }).closest("form")!
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("User already exists");
    });
  });

  it("handles network error", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    render(<SignUpPage />);

    fireEvent.submit(
      screen.getByRole("button", { name: "Sign Up" }).closest("form")!
    );

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith("Something went wrong");
    });
  });
});
