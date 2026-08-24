import dotenv from "dotenv";

dotenv.config({ path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" });

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: required("JWT_EXPIRES_IN", "7d"),
  port: Number(required("PORT", "5000")),
  clientUrl: required("CLIENT_URL", "http://localhost:5173"),
  overdueThresholdDays: Number(required("OVERDUE_THRESHOLD_DAYS", "3")),
  uploadDir: required("UPLOAD_DIR", "uploads"),
  maxFileSize: Number(required("MAX_FILE_SIZE", "5242880")),
};
