import { render, screen } from "@testing-library/react";
import FeaturesPage from "@/app/(public)/features/page";

describe("Features Page", () => {
  it("renders the main heading", () => {
    render(<FeaturesPage />);
    expect(screen.getByText("Features")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<FeaturesPage />);
    expect(
      screen.getByText(/Explore the core features that make this project/i)
    ).toBeInTheDocument();
  });

  it("renders all feature cards", () => {
    render(<FeaturesPage />);

    const titles = [
      "Fast & Modern",
      "API-Ready",
      "Responsive Design",
      "Clean Architecture",
      "Reusable Components",
      "Developer-Friendly",
    ];

    titles.forEach((title) => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it("renders all feature descriptions", () => {
    render(<FeaturesPage />);

    const descriptions = [
      /optimized for performance/i,
      /integrate cleanly with FastAPI/i,
      /fully responsive layouts/i,
      /modular, maintainable structure/i,
      /UI elements are built to be reused/i,
      /predictable patterns/i,
    ];

    descriptions.forEach((desc) => {
      expect(screen.getByText(desc)).toBeInTheDocument();
    });
  });

  it("applies background image", () => {
    const { container } = render(<FeaturesPage />);
    const rootDiv = container.querySelector("div");

    expect(rootDiv?.style.backgroundImage).toContain("featurePage.jpg");
  });
});
