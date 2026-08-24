import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ComplaintForm } from "./ComplaintForm";
import { categoryLabels } from "../../utils/format";

describe("ComplaintForm validation", () => {
  it("lists every complaint category as a selectable option", () => {
    render(<ComplaintForm onSubmit={vi.fn()} />);
    for (const label of Object.values(categoryLabels)) {
      expect(screen.getByRole("option", { name: label })).toBeInTheDocument();
    }
  });

  it("requires a category to be selected", async () => {
    const onSubmit = vi.fn();
    render(<ComplaintForm onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.type(
      screen.getByLabelText("Description"),
      "The kitchen sink has been leaking for two days now."
    );
    await user.click(screen.getByRole("button", { name: /submit complaint/i }));

    expect(await screen.findByText(/please select a category/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("requires a description of at least 10 characters", async () => {
    const onSubmit = vi.fn();
    render(<ComplaintForm onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText("Category"), "PLUMBING");
    await user.type(screen.getByLabelText("Description"), "too short");
    await user.click(screen.getByRole("button", { name: /submit complaint/i }));

    expect(await screen.findByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits with valid category and description", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ComplaintForm onSubmit={onSubmit} />);
    const user = userEvent.setup();

    await user.selectOptions(screen.getByLabelText("Category"), "ELECTRICAL");
    await user.type(screen.getByLabelText("Description"), "Power socket sparks near the hallway.");
    await user.click(screen.getByRole("button", { name: /submit complaint/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      { category: "ELECTRICAL", description: "Power socket sparks near the hallway." },
      null
    );
  });
});
