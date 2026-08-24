import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComplaintTimeline } from "./ComplaintTimeline";
import type { ComplaintHistoryEntry } from "../../types";

const history: ComplaintHistoryEntry[] = [
  {
    id: "1",
    previousStatus: null,
    newStatus: "OPEN",
    note: "Complaint created",
    createdAt: "2026-08-21T10:30:00.000Z",
    actorId: "resident-1",
    actorName: "Rahul Verma",
    actorRole: "RESIDENT",
  },
  {
    id: "2",
    previousStatus: "OPEN",
    newStatus: "IN_PROGRESS",
    note: "Technician assigned.",
    createdAt: "2026-08-22T09:15:00.000Z",
    actorId: "admin-1",
    actorName: "Priya Sharma",
    actorRole: "ADMIN",
  },
  {
    id: "3",
    previousStatus: "IN_PROGRESS",
    newStatus: "RESOLVED",
    note: "Issue fixed.",
    createdAt: "2026-08-23T16:00:00.000Z",
    actorId: "admin-1",
    actorName: "Priya Sharma",
    actorRole: "ADMIN",
  },
];

describe("ComplaintTimeline", () => {
  it("renders every history entry in chronological order", () => {
    render(<ComplaintTimeline history={history} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Complaint Created");
    expect(items[1]).toHaveTextContent("Open → In Progress");
    expect(items[2]).toHaveTextContent("In Progress → Resolved");
  });

  it("shows the actor and note for each entry", () => {
    render(<ComplaintTimeline history={history} />);
    expect(screen.getByText(/Rahul Verma \(Resident\)/)).toBeInTheDocument();
    expect(screen.getAllByText(/Priya Sharma \(Admin\)/)).toHaveLength(2);
    expect(screen.getByText(/Technician assigned/)).toBeInTheDocument();
  });

  it("renders nothing when history is empty", () => {
    const { container } = render(<ComplaintTimeline history={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
