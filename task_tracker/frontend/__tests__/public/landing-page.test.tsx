import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/(public)/page";

describe("Landing Page", () => {
  it("renders hero heading", () => {
    render(<LandingPage />);
    expect(
      screen.getByText("Build Faster. Work Smarter.")
    ).toBeInTheDocument();
  });

  it("renders hero description", () => {
    render(<LandingPage />);
    expect(
      screen.getByText(/streamline your workflow/i)
    ).toBeInTheDocument();
  });

  it("renders CTA buttons", () => {
    render(<LandingPage />);

    const demoBtn = screen.getByRole("link", { name: "View Demo" });
    const signupBtn = screen.getByRole("link", { name: "Get Started" });

    expect(demoBtn).toHaveAttribute("href", "/demo");
    expect(signupBtn).toHaveAttribute("href", "/signup");
  });

  it("renders feature cards", () => {
    render(<LandingPage />);

    expect(screen.getByText("Fast Setup")).toBeInTheDocument();
    expect(screen.getByText("Modern Stack")).toBeInTheDocument();
    expect(screen.getByText("Scalable Design")).toBeInTheDocument();
  });

  it("applies background image", () => {
    const { container } = render(<LandingPage />);
    const rootDiv = container.querySelector("div");

    expect(rootDiv?.style.backgroundImage).toContain("landingPage.jpg");
  });
});
