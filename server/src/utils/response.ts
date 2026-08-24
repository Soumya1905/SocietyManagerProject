import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function ok<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ success: true, data }, status);
}

export function fail(c: Context, message: string, status: ContentfulStatusCode = 400) {
  return c.json({ success: false, message }, status);
}
