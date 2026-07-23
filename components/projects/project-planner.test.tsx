import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectPlanner } from "./project-planner";

function projectCard(name: string) {
  return screen.getByRole("heading", { name }).closest("article") as HTMLElement;
}

describe("ProjectPlanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("keeps deleted sample projects removed after reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<ProjectPlanner />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "New Roof" })).toBeInTheDocument();
    });

    await user.click(within(projectCard("New Roof")).getByRole("button", { name: "Delete" }));

    expect(screen.queryByRole("heading", { name: "New Roof" })).not.toBeInTheDocument();
    expect(window.localStorage.getItem("domivault-local-projects")).not.toContain("New Roof");

    unmount();
    render(<ProjectPlanner />);

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "New Roof" })).not.toBeInTheDocument();
    });
  });
});
