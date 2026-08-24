import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { complaints, notices, users } from "../db/schema.js";
import { getOverdueInfo } from "../utils/overdue.js";
import type { ComplaintCategory, ComplaintStatus } from "../types/index.js";

function withOverdue<T extends { createdAt: Date; status: ComplaintStatus }>(complaint: T) {
  const overdue = getOverdueInfo(complaint.createdAt, complaint.status);
  return { ...complaint, isOverdue: overdue.isOverdue, overdueDays: overdue.overdueDays };
}

export async function getResidentDashboard(residentId: string) {
  const rows = await db.select().from(complaints).where(eq(complaints.residentId, residentId));
  const withOverdueRows = rows.map(withOverdue);

  const stats = {
    total: rows.length,
    open: rows.filter((c) => c.status === "OPEN").length,
    inProgress: rows.filter((c) => c.status === "IN_PROGRESS").length,
    resolved: rows.filter((c) => c.status === "RESOLVED").length,
  };

  const recentComplaints = withOverdueRows
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const latestNotices = await db
    .select({
      id: notices.id,
      title: notices.title,
      content: notices.content,
      isImportant: notices.isImportant,
      createdAt: notices.createdAt,
    })
    .from(notices)
    .orderBy(desc(notices.isImportant), desc(notices.createdAt))
    .limit(5);

  return { stats, recentComplaints, latestNotices };
}

export async function getAdminDashboard() {
  const rows = await db
    .select({
      id: complaints.id,
      residentId: complaints.residentId,
      residentName: users.fullName,
      apartmentNumber: users.apartmentNumber,
      category: complaints.category,
      description: complaints.description,
      status: complaints.status,
      priority: complaints.priority,
      createdAt: complaints.createdAt,
      resolvedAt: complaints.resolvedAt,
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.residentId, users.id));

  const withOverdueRows = rows.map(withOverdue);
  const overdueRows = withOverdueRows.filter((c) => c.isOverdue);

  const stats = {
    total: rows.length,
    open: rows.filter((c) => c.status === "OPEN").length,
    inProgress: rows.filter((c) => c.status === "IN_PROGRESS").length,
    resolved: rows.filter((c) => c.status === "RESOLVED").length,
    overdue: overdueRows.length,
  };

  const byStatus: Record<ComplaintStatus, number> = {
    OPEN: stats.open,
    IN_PROGRESS: stats.inProgress,
    RESOLVED: stats.resolved,
  };

  const byCategory = rows.reduce(
    (acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    },
    {} as Record<ComplaintCategory, number>
  );

  const recentComplaints = withOverdueRows
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const highPriorityComplaints = withOverdueRows
    .filter((c) => c.priority === "HIGH" && c.status !== "RESOLVED")
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const overdueComplaints = overdueRows
    .sort((a, b) => b.overdueDays - a.overdueDays)
    .slice(0, 5);

  return {
    stats,
    byStatus,
    byCategory,
    recentComplaints,
    highPriorityComplaints,
    overdueComplaints,
  };
}
