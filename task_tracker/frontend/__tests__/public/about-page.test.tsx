import { render, screen } from "@testing-library/react";
import AboutPage from "@/app/(public)/about/page";

describe("About Page", () => {
  it("renders the About Us heading", () => {
    render(<AboutPage />);
    expect(screen.getByText("About Us")).toBeInTheDocument();
  });

  it("renders all three paragraphs", () => {
    render(<AboutPage />);

    expect(
      screen.getByText(/simplify workflows/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/clean design, thoughtful engineering/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Next\.js, Tailwind CSS, and FastAPI/i)
    ).toBeInTheDocument();
  });

  it("applies background image", () => {
    const { container } = render(<AboutPage />);
    const rootDiv = container.querySelector("div");

    expect(rootDiv?.style.backgroundImage).toContain("aboutPage.jpg");
  });
});
