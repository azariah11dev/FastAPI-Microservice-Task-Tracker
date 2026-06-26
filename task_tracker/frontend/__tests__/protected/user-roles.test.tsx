import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UserRolesPage from "@/app/(protected)/user-roles/page";

global.fetch = jest.fn();
console.error = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem("access_token", "abc123");
});

describe("UserRolesPage", () => {
  it("shows loading state initially", () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    render(<UserRolesPage />);
    expect(screen.getByText("Loading users...")).toBeInTheDocument();
  });

  it("shows backend error message", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
    });

    render(<UserRolesPage />);

    await waitFor(() =>
      expect(
        screen.getByText("Could not load users — backend unreachable.")
      ).toBeInTheDocument()
    );
  });

  it("renders users from backend", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          username: "john",
          email: "john@example.com",
          role: "User",
        },
      ],
    });

    render(<UserRolesPage />);

    await waitFor(() =>
      expect(screen.getByText("john")).toBeInTheDocument()
    );

    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("User")).toBeInTheDocument();
  });

  it("updates user role and shows saving indicator", async () => {
    // First fetch: load users
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 1,
          username: "john",
          email: "john@example.com",
          role: "User",
        },
      ],
    });

    // Second fetch: PUT update
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
    });

    render(<UserRolesPage />);

    await waitFor(() =>
      expect(screen.getByText("john")).toBeInTheDocument()
    );

    const select = screen.getByDisplayValue("User");
    fireEvent.change(select, { target: { value: "Admin" } });

    expect(screen.getByText("Saving...")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText("Saving...")).not.toBeInTheDocument()
    );

    expect(screen.getByDisplayValue("Admin")).toBeInTheDocument();
  });
});
