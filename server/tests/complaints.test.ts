import { describe, it, expect } from "vitest";
import { request, registerAndLogin, makeAdmin } from "./helpers.js";

describe("Complaints", () => {
  it("creates a complaint with default status OPEN and priority MEDIUM", async () => {
    const { token } = await registerAndLogin({ email: "res1@example.com" });
    const res = await request("POST", "/api/complaints", {
      token,
      body: { category: "PLUMBING", description: "Leaking pipe under the kitchen sink." },
    });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe("OPEN");
    expect(res.body.data.priority).toBe("MEDIUM");
    expect(res.body.data.isOverdue).toBe(false);
  });

  it("rejects complaint creation with invalid input", async () => {
    const { token } = await registerAndLogin({ email: "res2@example.com" });
    const res = await request("POST", "/api/complaints", {
      token,
      body: { category: "INVALID_CATEGORY", description: "short" },
    });
    expect(res.status).toBe(400);
  });

  it("only returns the resident's own complaints to that resident", async () => {
    const resA = await registerAndLogin({ email: "resA@example.com" });
    const resB = await registerAndLogin({ email: "resB@example.com" });

    await request("POST", "/api/complaints", {
      token: resA.token,
      body: { category: "ELECTRICAL", description: "Socket sparking near the hallway." },
    });
    await request("POST", "/api/complaints", {
      token: resB.token,
      body: { category: "LIFT", description: "Lift stuck between third and fourth floor." },
    });

    const listA = await request("GET", "/api/complaints", { token: resA.token });
    expect(listA.body.data).toHaveLength(1);
    expect(listA.body.data[0].category).toBe("ELECTRICAL");
  });

  it("lets an admin see every complaint across residents", async () => {
    const resA = await registerAndLogin({ email: "resAdminView1@example.com" });
    const resB = await registerAndLogin({ email: "resAdminView2@example.com" });
    const adminToken = await makeAdmin(resA.user.email);

    await request("POST", "/api/complaints", {
      token: resB.token,
      body: { category: "SECURITY", description: "Front gate lock is broken and unsafe." },
    });

    const list = await request("GET", "/api/complaints", { token: adminToken });
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it("blocks a resident from updating status or priority", async () => {
    const { token } = await registerAndLogin({ email: "resNoAdmin@example.com" });
    const created = await request("POST", "/api/complaints", {
      token,
      body: { category: "PARKING", description: "Someone parked in my allotted spot again." },
    });

    const statusRes = await request("PATCH", `/api/complaints/${created.body.data.id}/status`, {
      token,
      body: { status: "IN_PROGRESS" },
    });
    expect(statusRes.status).toBe(403);

    const priorityRes = await request("PATCH", `/api/complaints/${created.body.data.id}/priority`, {
      token,
      body: { priority: "HIGH" },
    });
    expect(priorityRes.status).toBe(403);
  });

  it("allows valid status transitions and records history, but blocks invalid ones", async () => {
    await registerAndLogin({ email: "resTransition@example.com" });
    const adminToken = await makeAdmin("resTransition@example.com");
    const otherResident = await registerAndLogin({ email: "resTransitionSubject@example.com" });

    const created = await request("POST", "/api/complaints", {
      token: otherResident.token,
      body: { category: "CLEANLINESS", description: "Garbage has piled up near the entrance gate." },
    });
    const id = created.body.data.id;

    const invalidJump = await request("PATCH", `/api/complaints/${id}/status`, {
      token: adminToken,
      body: { status: "RESOLVED" },
    });
    expect(invalidJump.status).toBe(400);

    const toInProgress = await request("PATCH", `/api/complaints/${id}/status`, {
      token: adminToken,
      body: { status: "IN_PROGRESS", note: "Cleaner assigned" },
    });
    expect(toInProgress.status).toBe(200);
    expect(toInProgress.body.data.status).toBe("IN_PROGRESS");

    const backwards = await request("PATCH", `/api/complaints/${id}/status`, {
      token: adminToken,
      body: { status: "OPEN" },
    });
    expect(backwards.status).toBe(400);

    const toResolved = await request("PATCH", `/api/complaints/${id}/status`, {
      token: adminToken,
      body: { status: "RESOLVED", note: "Cleaned up" },
    });
    expect(toResolved.status).toBe(200);
    expect(toResolved.body.data.status).toBe("RESOLVED");
    expect(toResolved.body.data.resolvedAt).not.toBeNull();

    const details = await request("GET", `/api/complaints/${id}`, { token: adminToken });
    expect(details.body.data.history).toHaveLength(3);
    expect(details.body.data.history.map((h: any) => h.newStatus)).toEqual([
      "OPEN",
      "IN_PROGRESS",
      "RESOLVED",
    ]);
  });

  it("updates priority", async () => {
    await registerAndLogin({ email: "resPriority@example.com" });
    const adminToken = await makeAdmin("resPriority@example.com");
    const otherResident = await registerAndLogin({ email: "resPrioritySubject@example.com" });

    const created = await request("POST", "/api/complaints", {
      token: otherResident.token,
      body: { category: "WATER_SUPPLY", description: "No water supply on the fifth floor today." },
    });

    const res = await request("PATCH", `/api/complaints/${created.body.data.id}/priority`, {
      token: adminToken,
      body: { priority: "HIGH" },
    });
    expect(res.status).toBe(200);
    expect(res.body.data.priority).toBe("HIGH");
  });

  it("prevents a resident from viewing another resident's complaint", async () => {
    const owner = await registerAndLogin({ email: "owner@example.com" });
    const stranger = await registerAndLogin({ email: "stranger@example.com" });

    const created = await request("POST", "/api/complaints", {
      token: owner.token,
      body: { category: "OTHER", description: "General maintenance request for the corridor lights." },
    });

    const res = await request("GET", `/api/complaints/${created.body.data.id}`, {
      token: stranger.token,
    });
    expect(res.status).toBe(403);
  });
});
