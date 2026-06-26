import { render, screen } from "@testing-library/react";
import DemoPage from "@/app/(public)/demo/page";

describe("Demo Page", () => {
  it("renders the main heading", () => {
    render(<DemoPage />);
    expect(screen.getByText("Task Forge Demo")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<DemoPage />);
    expect(
      screen.getByText(/walkthrough of the Task Forge platform/i)
    ).toBeInTheDocument();
  });

  it("renders the YouTube iframe", () => {
    render(<DemoPage />);
    const iframe = screen.getByTitle("Task Forge Demo Video");

    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/YOUR_VIDEO_ID"
    );
  });

  it("applies background image", () => {
    const { container } = render(<DemoPage />);
    const main = container.querySelector("main");

    expect(main?.style.backgroundImage).toContain("demoPage.jpg");
  });
});
