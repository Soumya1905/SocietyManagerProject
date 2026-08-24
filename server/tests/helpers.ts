import app from "../src/app.js";

export async function request(
  method: string,
  path: string,
  options: { body?: unknown; token?: string } = {}
) {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.token) headers["Authorization"] = `Bearer ${options.token}`;

  const res = await app.request(path, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = await res.json().catch(() => null);
  return { status: res.status, body: json as any };
}

export async function registerAndLogin(overrides: {
  fullName?: string;
  email: string;
  password?: string;
  apartmentNumber?: string;
}) {
  const res = await request("POST", "/api/auth/register", {
    body: {
      fullName: overrides.fullName ?? "Test User",
      email: overrides.email,
      password: overrides.password ?? "Password@123",
      apartmentNumber: overrides.apartmentNumber ?? "A-100",
    },
  });
  return { token: res.body.data.token as string, user: res.body.data.user };
}

export async function makeAdmin(email: string) {
  const { db } = await import("../src/db/index.js");
  const { users } = await import("../src/db/schema.js");
  const { eq } = await import("drizzle-orm");
  await db.update(users).set({ role: "ADMIN" }).where(eq(users.email, email));

  const res = await request("POST", "/api/auth/login", {
    body: { email, password: "Password@123" },
  });
  return res.body.data.token as string;
}
