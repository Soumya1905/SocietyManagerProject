import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ResidentNotices from "./Notices";
import * as noticeService from "../../services/noticeService";
import type { Notice } from "../../types";

vi.mock("../../services/noticeService");

const notices: Notice[] = [
  {
    id: "n1",
    title: "AGM Scheduled",
    content: "The annual general meeting is next Saturday.",
    isImportant: true,
    createdAt: "2026-08-24T10:00:00.000Z",
    updatedAt: "2026-08-24T10:00:00.000Z",
    authorName: "Priya Sharma",
  },
  {
    id: "n2",
    title: "Water Supply Maintenance",
    content: "Water will be shut off on Sunday morning.",
    isImportant: true,
    createdAt: "2026-08-23T10:00:00.000Z",
    updatedAt: "2026-08-23T10:00:00.000Z",
    authorName: "Priya Sharma",
  },
  {
    id: "n3",
    title: "Diwali Committee",
    content: "Residents can register to help organize Diwali.",
    isImportant: false,
    createdAt: "2026-08-25T10:00:00.000Z",
    updatedAt: "2026-08-25T10:00:00.000Z",
    authorName: "Priya Sharma",
  },
];

describe("Notice ordering", () => {
  it("renders notices in the order returned by the API, with important notices already pinned first", async () => {
    vi.mocked(noticeService.listNotices).mockResolvedValue(notices);
    render(<ResidentNotices />);

    const titles = await screen.findAllByRole("heading", { level: 3 });
    expect(titles.map((t) => t.textContent)).toEqual([
      "AGM Scheduled",
      "Water Supply Maintenance",
      "Diwali Committee",
    ]);
  });

  it("shows an empty state when there are no notices", async () => {
    vi.mocked(noticeService.listNotices).mockResolvedValue([]);
    render(<ResidentNotices />);

    expect(await screen.findByText(/no notices yet/i)).toBeInTheDocument();
  });
});
