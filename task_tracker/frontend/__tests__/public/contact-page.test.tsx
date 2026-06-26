import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ContactPage from "@/app/(public)/contact/page";

// Mock fetch globally
global.fetch = jest.fn();

describe("Contact Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading and description", () => {
    render(<ContactPage />);

    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(
      screen.getByText(/Have a question or want to work together/i)
    ).toBeInTheDocument();
  });

  it("updates form fields on user input", () => {
    render(<ContactPage />);

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("How can we help?"), {
      target: { value: "Hello world" },
    });

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@example.com")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
  });

  it("submits form successfully", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(<ContactPage />);

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "John Doe" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("How can we help?"), {
      target: { value: "Hello world" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() =>
      expect(screen.getByText("Message sent successfully.")).toBeInTheDocument()
    );
  });

  it("shows error message when submission fails", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    render(<ContactPage />);

    fireEvent.change(screen.getByPlaceholderText("Your name"), {
      target: { value: "John" },
    });

    fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
      target: { value: "john@example.com" },
    });

    fireEvent.change(screen.getByPlaceholderText("How can we help?"), {
      target: { value: "Hello" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Send Message" }));

    await waitFor(() =>
      expect(
        screen.getByText("Something went wrong.")
      ).toBeInTheDocument()
    );
  });
});