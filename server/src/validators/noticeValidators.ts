import { z } from "zod";

export const createNoticeSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(255),
  content: z.string().trim().min(5, "Content must be at least 5 characters").max(5000),
  isImportant: z.boolean().optional().default(false),
});

export const updateNoticeSchema = z.object({
  title: z.string().trim().min(3).max(255).optional(),
  content: z.string().trim().min(5).max(5000).optional(),
  isImportant: z.boolean().optional(),
});
