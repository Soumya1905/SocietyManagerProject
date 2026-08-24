import { describe, it, expect } from "vitest";
import { request, registerAndLogin } from "./helpers.js";

describe("Authentication", () => {
  it("registers a new resident and returns a token without the password hash", async () => {
    const res = await request("POST", "/api/auth/register", {
      body: {
        fullName: "Aditi Rao",
        email: "aditi@example.com",
        password: "Password@123",
        apartmentNumber: "E-501",
      },
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe("RESIDENT");
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(typeof res.body.data.token).toBe("string");
  });

  it("rejects registration with a duplicate email", async () => {
    await registerAndLogin({ email: "dup@example.com" });
    const res = await request("POST", "/api/auth/register", {
      body: {
        fullName: "Dup User",
        email: "dup@example.com",
        password: "Password@123",
        apartmentNumber: "A-1",
      },
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects registration with invalid input", async () => {
    const res = await request("POST", "/api/auth/register", {
      body: { fullName: "A", email: "not-an-email", password: "short", apartmentNumber: "" },
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("logs in with correct credentials", async () => {
    await registerAndLogin({ email: "login@example.com", password: "Password@123" });
    const res = await request("POST", "/api/auth/login", {
      body: { email: "login@example.com", password: "Password@123" },
    });
    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe("login@example.com");
  });

  it("rejects login with wrong password", async () => {
    await registerAndLogin({ email: "wrongpw@example.com", password: "Password@123" });
    const res = await request("POST", "/api/auth/login", {
      body: { email: "wrongpw@example.com", password: "WrongPassword" },
    });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns the current user for GET /me with a valid token", async () => {
    const { token, user } = await registerAndLogin({ email: "me@example.com" });
    const res = await request("GET", "/api/auth/me", { token });
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
  });
});

describe("Authentication middleware", () => {
  it("blocks requests without a token", async () => {
    const res = await request("GET", "/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("blocks requests with an invalid token", async () => {
    const res = await request("GET", "/api/auth/me", { token: "not-a-real-token" });
    expect(res.status).toBe(401);
  });
});
