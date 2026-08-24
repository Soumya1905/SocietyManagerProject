import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { eq } from "drizzle-orm";
import { verifyToken } from "../utils/jwt.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { fail } from "../utils/response.js";
import type { AuthedUser, Role } from "../types/index.js";

declare module "hono" {
  interface ContextVariableMap {
    user: AuthedUser;
  }
}

export const authenticateUser = createMiddleware(async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;

  if (!token) {
    return fail(c, "Authentication required", 401);
  }

  try {
    const payload = verifyToken(token);
    const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);

    if (!user) {
      return fail(c, "User no longer exists", 401);
    }

    c.set("user", {
      id: user.id,
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      apartmentNumber: user.apartmentNumber,
    });

    await next();
  } catch {
    return fail(c, "Invalid or expired token", 401);
  }
});

export function requireRole(...roles: Role[]) {
  return createMiddleware(async (c: Context, next: Next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) {
      return fail(c, "You do not have permission to perform this action", 403);
    }
    await next();
  });
}
