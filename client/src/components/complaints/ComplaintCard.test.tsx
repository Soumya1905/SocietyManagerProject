import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ComplaintCard } from "./ComplaintCard";
import type { Complaint } from "../../types";

const baseComplaint: Complaint = {
  id: "c1",
  residentId: "r1",
  category: "PLUMBING",
  description: "Kitchen tap has been leaking for a week.",
  photoUrl: null,
  status: "OPEN",
  priority: "HIGH",
  createdAt: "2026-08-10T00:00:00.000Z",
  updatedAt: "2026-08-10T00:00:00.000Z",
  resolvedAt: null,
  isOverdue: false,
  overdueDays: 0,
};

function renderCard(complaint: Complaint) {
  return render(
    <MemoryRouter>
      <ComplaintCard complaint={complaint} detailsPath={`/resident/complaints/${complaint.id}`} />
    </MemoryRouter>
  );
}

describe("Overdue detection display", () => {
  it("does not show an overdue indicator for a complaint within the threshold", () => {
    renderCard(baseComplaint);
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it("shows an overdue indicator with the day count for a stale complaint", () => {
    renderCard({ ...baseComplaint, isOverdue: true, overdueDays: 5 });
    expect(screen.getByText(/overdue by 5d/i)).toBeInTheDocument();
  });
});
