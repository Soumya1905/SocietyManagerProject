import type { ErrorHandler } from "hono";
import { ZodError } from "zod";
import { UploadValidationError } from "../services/uploadService.js";
import { AppError } from "../utils/errors.js";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? "Validation failed";
    return c.json({ success: false, message }, 400);
  }

  if (err instanceof UploadValidationError) {
    return c.json({ success: false, message: err.message }, 400);
  }

  if (err instanceof AppError) {
    return c.json({ success: false, message: err.message }, err.status as 400);
  }

  console.error(err);
  return c.json({ success: false, message: "Internal server error" }, 500);
};
