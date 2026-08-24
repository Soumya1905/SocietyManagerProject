import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoticeCard } from "./NoticeCard";
import type { Notice } from "../../types";

const baseNotice: Notice = {
  id: "n1",
  title: "Water Supply Maintenance",
  content: "Water will be shut off on Sunday morning.",
  isImportant: false,
  createdAt: "2026-08-20T10:00:00.000Z",
  updatedAt: "2026-08-20T10:00:00.000Z",
  authorName: "Priya Sharma",
};

describe("NoticeCard important rendering", () => {
  it("shows an important badge for important notices", () => {
    render(<NoticeCard notice={{ ...baseNotice, isImportant: true }} />);
    expect(screen.getByText("Important")).toBeInTheDocument();
  });

  it("does not show an important badge for regular notices", () => {
    render(<NoticeCard notice={baseNotice} />);
    expect(screen.queryByText("Important")).not.toBeInTheDocument();
  });

  it("always renders the title, content, and author", () => {
    render(<NoticeCard notice={baseNotice} />);
    expect(screen.getByText(baseNotice.title)).toBeInTheDocument();
    expect(screen.getByText(baseNotice.content)).toBeInTheDocument();
    expect(screen.getByText(/Priya Sharma/)).toBeInTheDocument();
  });
});
