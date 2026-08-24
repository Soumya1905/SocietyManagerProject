import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { notices, users } from "../db/schema.js";
import { NotFoundError } from "../utils/errors.js";

export async function listNotices() {
  const rows = await db
    .select({
      id: notices.id,
      title: notices.title,
      content: notices.content,
      isImportant: notices.isImportant,
      createdAt: notices.createdAt,
      updatedAt: notices.updatedAt,
      authorName: users.fullName,
    })
    .from(notices)
    .innerJoin(users, eq(notices.createdBy, users.id))
    .orderBy(desc(notices.isImportant), desc(notices.createdAt));

  return rows;
}

export async function createNotice(
  authorId: string,
  input: { title: string; content: string; isImportant: boolean }
) {
  const [created] = await db
    .insert(notices)
    .values({
      title: input.title,
      content: input.content,
      isImportant: input.isImportant,
      createdBy: authorId,
    })
    .returning();
  return created;
}

export async function updateNotice(
  id: string,
  input: { title?: string; content?: string; isImportant?: boolean }
) {
  const [existing] = await db.select().from(notices).where(eq(notices.id, id)).limit(1);
  if (!existing) {
    throw new NotFoundError("Notice not found");
  }

  const [updated] = await db
    .update(notices)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(notices.id, id))
    .returning();

  return updated;
}

export async function deleteNotice(id: string) {
  const [existing] = await db.select().from(notices).where(eq(notices.id, id)).limit(1);
  if (!existing) {
    throw new NotFoundError("Notice not found");
  }

  await db.delete(notices).where(eq(notices.id, id));
}
