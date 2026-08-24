import { describe, it, expect } from "vitest";
import { request } from "./helpers.js";

describe("Complete complaint lifecycle workflow", () => {
  it("walks a complaint from creation through resolution across resident and admin sessions", async () => {
    // 1. Register resident
    const registerRes = await request("POST", "/api/auth/register", {
      body: {
        fullName: "Workflow Resident",
        email: "workflow.resident@example.com",
        password: "Password@123",
        apartmentNumber: "F-707",
      },
    });
    expect(registerRes.status).toBe(201);

    // 2. Log in as resident
    const residentLogin = await request("POST", "/api/auth/login", {
      body: { email: "workflow.resident@example.com", password: "Password@123" },
    });
    const residentToken = residentLogin.body.data.token;

    // 3. Create a complaint
    const created = await request("POST", "/api/complaints", {
      token: residentToken,
      body: { category: "PLUMBING", description: "Bathroom geyser is leaking water onto the floor." },
    });
    const complaintId = created.body.data.id;

    // 4. Verify initial OPEN status
    expect(created.body.data.status).toBe("OPEN");
    expect(created.body.data.priority).toBe("MEDIUM");

    // 5. Log in as admin (seed admin account must exist via prior registration + promotion)
    // Promote a fresh account to admin directly through the DB helper flow.
    const adminRegister = await request("POST", "/api/auth/register", {
      body: {
        fullName: "Workflow Admin",
        email: "workflow.admin@example.com",
        password: "Password@123",
        apartmentNumber: "OFFICE",
      },
    });
    const { db } = await import("../src/db/index.js");
    const { users } = await import("../src/db/schema.js");
    const { eq } = await import("drizzle-orm");
    await db.update(users).set({ role: "ADMIN" }).where(eq(users.id, adminRegister.body.data.user.id));

    const adminLogin = await request("POST", "/api/auth/login", {
      body: { email: "workflow.admin@example.com", password: "Password@123" },
    });
    const adminToken = adminLogin.body.data.token;

    // 6. View the complaint as admin
    const viewedByAdmin = await request("GET", `/api/complaints/${complaintId}`, { token: adminToken });
    expect(viewedByAdmin.status).toBe(200);
    expect(viewedByAdmin.body.data.residentName).toBe("Workflow Resident");

    // 7. Change priority
    const priorityRes = await request("PATCH", `/api/complaints/${complaintId}/priority`, {
      token: adminToken,
      body: { priority: "HIGH" },
    });
    expect(priorityRes.body.data.priority).toBe("HIGH");

    // 8. Change status to IN_PROGRESS
    const inProgressRes = await request("PATCH", `/api/complaints/${complaintId}/status`, {
      token: adminToken,
      body: { status: "IN_PROGRESS", note: "Plumber dispatched to the unit." },
    });
    expect(inProgressRes.body.data.status).toBe("IN_PROGRESS");

    // 9. Verify history entry
    const afterInProgress = await request("GET", `/api/complaints/${complaintId}`, { token: adminToken });
    expect(afterInProgress.body.data.history).toHaveLength(2);
    expect(afterInProgress.body.data.history[1].newStatus).toBe("IN_PROGRESS");
    expect(afterInProgress.body.data.history[1].note).toBe("Plumber dispatched to the unit.");

    // 10. Change status to RESOLVED
    const resolvedRes = await request("PATCH", `/api/complaints/${complaintId}/status`, {
      token: adminToken,
      body: { status: "RESOLVED", note: "Geyser valve replaced and leak fixed." },
    });
    expect(resolvedRes.body.data.status).toBe("RESOLVED");

    // 11. Verify resolved_at
    expect(resolvedRes.body.data.resolvedAt).not.toBeNull();

    // 12. Log in as resident again
    const residentReLogin = await request("POST", "/api/auth/login", {
      body: { email: "workflow.resident@example.com", password: "Password@123" },
    });
    const residentToken2 = residentReLogin.body.data.token;

    // 13. Verify updated status and complete history
    const finalView = await request("GET", `/api/complaints/${complaintId}`, { token: residentToken2 });
    expect(finalView.body.data.status).toBe("RESOLVED");
    expect(finalView.body.data.priority).toBe("HIGH");
    expect(finalView.body.data.history).toHaveLength(3);
    expect(finalView.body.data.history.map((h: any) => h.newStatus)).toEqual([
      "OPEN",
      "IN_PROGRESS",
      "RESOLVED",
    ]);
  });
});
