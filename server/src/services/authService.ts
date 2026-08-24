import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/jwt.js";
import { AppError } from "../utils/errors.js";
import type { RegisterInput, LoginInput } from "../validators/authValidators.js";

function toSafeUser(user: typeof users.$inferSelect) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export async function registerResident(input: RegisterInput) {
  const [existing] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing) {
    throw new AppError("An account with this email already exists", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const [created] = await db
    .insert(users)
    .values({
      fullName: input.fullName,
      email: input.email,
      passwordHash,
      apartmentNumber: input.apartmentNumber,
      role: "RESIDENT",
    })
    .returning();

  const token = signToken({ sub: created.id, role: created.role, email: created.email });
  return { user: toSafeUser(created), token };
}

export async function login(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({ sub: user.id, role: user.role, email: user.email });
  return { user: toSafeUser(user), token };
}

export async function getUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return toSafeUser(user);
}
