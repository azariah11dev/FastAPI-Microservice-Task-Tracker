import { render, screen } from "@testing-library/react";
import SideBar from "@/app/(protected)/components/sideBar";

describe("SideBar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders base navigation links", () => {
    render(<SideBar />);

    expect(screen.getByText("Create Task")).toBeInTheDocument();
    expect(screen.getByText("Task Management")).toBeInTheDocument();
    expect(screen.getByText("Task History")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
  });

  it("does NOT show admin link when role is not admin", () => {
    localStorage.setItem("role", "user");

    render(<SideBar />);

    expect(screen.queryByText("User Roles")).not.toBeInTheDocument();
  });

  it("shows admin link when role is admin", () => {
    localStorage.setItem("role", "admin");

    render(<SideBar />);

    expect(screen.getByText("User Roles")).toBeInTheDocument();
  });
});
