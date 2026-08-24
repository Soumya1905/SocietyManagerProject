import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "../types";

export const categoryLabels: Record<ComplaintCategory, string> = {
  PLUMBING: "Plumbing",
  ELECTRICAL: "Electrical",
  SECURITY: "Security",
  CLEANLINESS: "Cleanliness",
  LIFT: "Lift",
  PARKING: "Parking",
  WATER_SUPPLY: "Water Supply",
  OTHER: "Other",
};

export const statusLabels: Record<ComplaintStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
};

export const priorityLabels: Record<ComplaintPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
