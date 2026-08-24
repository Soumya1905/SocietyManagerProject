import { describe, it, expect } from "vitest";
import { request, registerAndLogin, makeAdmin } from "./helpers.js";

describe("Notices", () => {
  it("only allows admins to create notices", async () => {
    const { token } = await registerAndLogin({ email: "noticeResident@example.com" });
    const res = await request("POST", "/api/notices", {
      token,
      body: { title: "Not allowed", content: "Residents cannot post notices." },
    });
    expect(res.status).toBe(403);
  });

  it("lets an admin create, update, and delete a notice", async () => {
    await registerAndLogin({ email: "noticeAdmin@example.com" });
    const adminToken = await makeAdmin("noticeAdmin@example.com");

    const created = await request("POST", "/api/notices", {
      token: adminToken,
      body: { title: "Lift Maintenance", content: "Lift will be under maintenance tomorrow.", isImportant: false },
    });
    expect(created.status).toBe(201);

    const updated = await request("PATCH", `/api/notices/${created.body.data.id}`, {
      token: adminToken,
      body: { isImportant: true },
    });
    expect(updated.status).toBe(200);
    expect(updated.body.data.isImportant).toBe(true);

    const deleted = await request("DELETE", `/api/notices/${created.body.data.id}`, {
      token: adminToken,
    });
    expect(deleted.status).toBe(200);
  });

  it("orders important notices before regular ones", async () => {
    await registerAndLogin({ email: "noticeOrderAdmin@example.com" });
    const adminToken = await makeAdmin("noticeOrderAdmin@example.com");

    await request("POST", "/api/notices", {
      token: adminToken,
      body: { title: "Regular notice", content: "Just a regular update for residents." },
    });
    await request("POST", "/api/notices", {
      token: adminToken,
      body: { title: "Important notice", content: "This is an important announcement.", isImportant: true },
    });

    const list = await request("GET", "/api/notices", { token: adminToken });
    expect(list.body.data[0].isImportant).toBe(true);
  });
});
