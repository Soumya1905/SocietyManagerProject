import type { Context, Next } from "hono";
import { createMiddleware } from "hono/factory";
import { fail } from "../utils/response.js";

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Minimal in-memory fixed-window rate limiter. Good enough for a single
 * backend process; would need a shared store (e.g. Redis) behind a
 * load balancer.
 */
export function rateLimit(options: { windowMs: number; max: number }) {
  const buckets = new Map<string, Bucket>();

  return createMiddleware(async (c: Context, next: Next) => {
    const key = c.req.header("x-forwarded-for") ?? "anonymous";
    const now = Date.now();
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt < now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      await next();
      return;
    }

    if (bucket.count >= options.max) {
      return fail(c, "Too many requests. Please try again later.", 429);
    }

    bucket.count += 1;
    await next();
  });
}
