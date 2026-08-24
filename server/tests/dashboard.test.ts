import { describe, it, expect } from "vitest";
import { request, registerAndLogin, makeAdmin } from "./helpers.js";

describe("Dashboard statistics", () => {
  it("computes resident dashboard totals from actual complaints", async () => {
    const { token } = await registerAndLogin({ email: "dashResident@example.com" });

    await request("POST", "/api/complaints", {
      token,
      body: { category: "PLUMBING", description: "Bathroom pipe leaking near the wall joint." },
    });
    await request("POST", "/api/complaints", {
      token,
      body: { category: "ELECTRICAL", description: "Corridor light flickers constantly at night." },
    });

    const res = await request("GET", "/api/dashboard/resident", { token });
    expect(res.status).toBe(200);
    expect(res.body.data.stats.total).toBe(2);
    expect(res.body.data.stats.open).toBe(2);
    expect(res.body.data.recentComplaints).toHaveLength(2);
  });

  it("computes admin dashboard stats including overdue count and category breakdown", async () => {
    const resident = await registerAndLogin({ email: "dashAdminSubject@example.com" });
    await registerAndLogin({ email: "dashAdmin@example.com" });
    const adminToken = await makeAdmin("dashAdmin@example.com");

    await request("POST", "/api/complaints", {
      token: resident.token,
      body: { category: "LIFT", description: "Lift makes a strange noise between floors two and three." },
    });

    const res = await request("GET", "/api/dashboard/admin", { token: adminToken });
    expect(res.status).toBe(200);
    expect(res.body.data.stats.total).toBeGreaterThanOrEqual(1);
    expect(res.body.data.byCategory.LIFT).toBeGreaterThanOrEqual(1);
    expect(res.body.data.byStatus.OPEN).toBeGreaterThanOrEqual(1);
  });

  it("blocks a resident from viewing the admin dashboard", async () => {
    const { token } = await registerAndLogin({ email: "dashBlocked@example.com" });
    const res = await request("GET", "/api/dashboard/admin", { token });
    expect(res.status).toBe(403);
  });
});
