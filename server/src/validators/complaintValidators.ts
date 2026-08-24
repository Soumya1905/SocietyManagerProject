import { z } from "zod";

export const complaintCategories = [
  "PLUMBING",
  "ELECTRICAL",
  "SECURITY",
  "CLEANLINESS",
  "LIFT",
  "PARKING",
  "WATER_SUPPLY",
  "OTHER",
] as const;

export const complaintStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;
export const complaintPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

export const createComplaintSchema = z.object({
  category: z.enum(complaintCategories, { message: "Select a valid category" }),
  description: z.string().trim().min(10, "Description must be at least 10 characters").max(2000),
});

export const updateStatusSchema = z.object({
  status: z.enum(complaintStatuses, { message: "Select a valid status" }),
  note: z.string().trim().max(1000).optional(),
});

export const updatePrioritySchema = z.object({
  priority: z.enum(complaintPriorities, { message: "Select a valid priority" }),
});

export const complaintQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.enum(complaintCategories).optional(),
  status: z.enum(complaintStatuses).optional(),
  priority: z.enum(complaintPriorities).optional(),
  overdue: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  dateFrom: z.string().trim().optional(),
  dateTo: z.string().trim().optional(),
  sortBy: z.enum(["createdAt", "priority", "status"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
