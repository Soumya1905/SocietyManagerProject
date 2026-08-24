import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { OverdueBadge } from "./OverdueBadge";

describe("StatusBadge", () => {
  it("renders the human-readable label for each status", () => {
    const { rerender } = render(<StatusBadge status="OPEN" />);
    expect(screen.getByText("Open")).toBeInTheDocument();

    rerender(<StatusBadge status="IN_PROGRESS" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();

    rerender(<StatusBadge status="RESOLVED" />);
    expect(screen.getByText("Resolved")).toBeInTheDocument();
  });
});

describe("PriorityBadge", () => {
  it("renders the human-readable label for each priority", () => {
    const { rerender } = render(<PriorityBadge priority="LOW" />);
    expect(screen.getByText("Low")).toBeInTheDocument();

    rerender(<PriorityBadge priority="MEDIUM" />);
    expect(screen.getByText("Medium")).toBeInTheDocument();

    rerender(<PriorityBadge priority="HIGH" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

describe("OverdueBadge", () => {
  it("renders nothing when the complaint is not overdue", () => {
    const { container } = render(<OverdueBadge isOverdue={false} overdueDays={0} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows the number of overdue days when overdue", () => {
    render(<OverdueBadge isOverdue overdueDays={3} />);
    expect(screen.getByText(/overdue by 3d/i)).toBeInTheDocument();
  });
});
