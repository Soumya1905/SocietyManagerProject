import { Hono } from "hono";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import * as authService from "../services/authService.js";
import { authenticateUser } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { ok } from "../utils/response.js";

const auth = new Hono();

const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

auth.post("/register", authRateLimit, async (c) => {
  const body = registerSchema.parse(await c.req.json());
  const result = await authService.registerResident(body);
  return ok(c, result, 201);
});

auth.post("/login", authRateLimit, async (c) => {
  const body = loginSchema.parse(await c.req.json());
  const result = await authService.login(body);
  return ok(c, result, 200);
});

auth.post("/logout", async (c) => {
  return ok(c, { message: "Logged out" });
});

auth.get("/me", authenticateUser, async (c) => {
  const user = c.get("user");
  const fullUser = await authService.getUserById(user.id);
  return ok(c, fullUser);
});

export default auth;
