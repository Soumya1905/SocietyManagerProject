import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../config/env.js";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export class UploadValidationError extends Error {}

/**
 * Stores an uploaded complaint photo on local disk and returns a public URL.
 * Kept isolated from complaint business logic so the storage backend
 * (local disk today) can later be swapped for S3/Cloudinary without
 * touching complaintService.
 */
export async function saveComplaintPhoto(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadValidationError("Only JPEG, PNG, WEBP, or GIF images are allowed.");
  }
  if (file.size > env.maxFileSize) {
    throw new UploadValidationError(
      `File is too large. Maximum size is ${Math.floor(env.maxFileSize / (1024 * 1024))}MB.`
    );
  }

  const uploadDir = path.resolve(env.uploadDir);
  await mkdir(uploadDir, { recursive: true });

  const filename = `${randomUUID()}${EXT_BY_MIME[file.type] ?? ""}`;
  const filepath = path.join(uploadDir, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}
