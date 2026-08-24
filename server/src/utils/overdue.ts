import { env } from "../config/env.js";
import type { ComplaintStatus } from "../types/index.js";

export interface OverdueInfo {
  isOverdue: boolean;
  overdueDays: number;
}

/**
 * A complaint is overdue once it has been open (not RESOLVED) for longer
 * than OVERDUE_THRESHOLD_DAYS. Centralized here so status routes and
 * dashboard aggregation stay consistent.
 */
export function getOverdueInfo(createdAt: Date, status: ComplaintStatus, now: Date = new Date()): OverdueInfo {
  if (status === "RESOLVED") {
    return { isOverdue: false, overdueDays: 0 };
  }

  const msSinceCreated = now.getTime() - createdAt.getTime();
  const daysSinceCreated = Math.floor(msSinceCreated / (1000 * 60 * 60 * 24));
  const overdueDays = daysSinceCreated - env.overdueThresholdDays;

  return {
    isOverdue: overdueDays > 0,
    overdueDays: Math.max(overdueDays, 0),
  };
}
