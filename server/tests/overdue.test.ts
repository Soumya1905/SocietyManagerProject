import { describe, it, expect } from "vitest";
import { getOverdueInfo } from "../src/utils/overdue.js";
import { request, registerAndLogin, makeAdmin } from "./helpers.js";
import { db } from "../src/db/index.js";
import { complaints } from "../src/db/schema.js";

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

describe("Overdue detection utility", () => {
  it("is not overdue within the threshold", () => {
    const info = getOverdueInfo(daysAgo(1), "OPEN");
    expect(info.isOverdue).toBe(false);
  });

  it("is overdue past the threshold for non-resolved complaints", () => {
    const info = getOverdueInfo(daysAgo(5), "OPEN");
    expect(info.isOverdue).toBe(true);
    expect(info.overdueDays).toBe(2);
  });

  it("is never overdue once resolved", () => {
    const info = getOverdueInfo(daysAgo(10), "RESOLVED");
    expect(info.isOverdue).toBe(false);
    expect(info.overdueDays).toBe(0);
  });
});

describe("Overdue detection via API", () => {
  it("flags a stale complaint as overdue with the correct overdueDays", async () => {
    const { token, user } = await registerAndLogin({ email: "overdueResident@example.com" });
    await registerAndLogin({ email: "overdueAdmin@example.com" });
    const adminToken = await makeAdmin("overdueAdmin@example.com");

    const [stale] = await db
      .insert(complaints)
      .values({
        residentId: user.id,
        category: "SECURITY",
        description: "Broken gate lock reported almost a week ago and still unresolved.",
        status: "OPEN",
        priority: "HIGH",
        createdAt: daysAgo(5),
        updatedAt: daysAgo(5),
      })
      .returning();

    const details = await request("GET", `/api/complaints/${stale.id}`, { token });
    expect(details.body.data.isOverdue).toBe(true);
    expect(details.body.data.overdueDays).toBe(2);

    const overdueList = await request("GET", "/api/complaints?overdue=true", { token: adminToken });
    expect(overdueList.body.data.some((c: any) => c.id === stale.id)).toBe(true);
  });
});
