import { beforeAll } from "vitest";

process.env.NODE_ENV = "test";

beforeAll(async () => {
  const { db } = await import("../src/db/index.js");
  const { complaintHistory, complaints, notices, users } = await import("../src/db/schema.js");

  await db.delete(complaintHistory);
  await db.delete(complaints);
  await db.delete(notices);
  await db.delete(users);
});
