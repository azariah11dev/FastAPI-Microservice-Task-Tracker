import { render, screen } from "@testing-library/react";
import Navbar from "@/app/(public)/component/nav-bar";
import "@testing-library/jest-dom";

describe("Navbar Component", () => {
  it("renders the logo image", () => {
    render(<Navbar />);
    const logo = screen.getByAltText("TaskForge logo");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.jpg");
  });

  it("renders the brand name", () => {
    render(<Navbar />);
    expect(screen.getByText("Task Forge")).toBeInTheDocument();
  });

  it("renders all navigation links with correct hrefs", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: "Features" })).toHaveAttribute(
      "href",
      "/features"
    );

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "href",
      "/about"
    );

    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact"
    );

    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
