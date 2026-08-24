import { and, asc, desc, eq, gte, ilike, lte, SQL } from "drizzle-orm";
import { db } from "../db/index.js";
import { complaintHistory, complaints, users } from "../db/schema.js";
import { AppError, ForbiddenError, NotFoundError } from "../utils/errors.js";
import { getOverdueInfo } from "../utils/overdue.js";
import type { AuthedUser, ComplaintPriority, ComplaintStatus } from "../types/index.js";

const VALID_TRANSITIONS: Record<ComplaintStatus, ComplaintStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: [],
};

interface ListFilters {
  search?: string;
  category?: string;
  status?: string;
  priority?: string;
  overdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

function withOverdue<T extends { createdAt: Date; status: ComplaintStatus }>(complaint: T) {
  const overdue = getOverdueInfo(complaint.createdAt, complaint.status);
  return { ...complaint, isOverdue: overdue.isOverdue, overdueDays: overdue.overdueDays };
}

export async function createComplaint(
  resident: AuthedUser,
  input: { category: string; description: string; photoUrl?: string }
) {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(complaints)
      .values({
        residentId: resident.id,
        category: input.category as never,
        description: input.description,
        photoUrl: input.photoUrl,
        status: "OPEN",
        priority: "MEDIUM",
      })
      .returning();

    await tx.insert(complaintHistory).values({
      complaintId: created.id,
      previousStatus: null,
      newStatus: "OPEN",
      actorId: resident.id,
      note: "Complaint created",
    });

    return withOverdue(created);
  });
}

export async function listComplaints(user: AuthedUser, filters: ListFilters) {
  const conditions: SQL[] = [];

  if (user.role === "RESIDENT") {
    conditions.push(eq(complaints.residentId, user.id));
  }
  if (filters.category) {
    conditions.push(eq(complaints.category, filters.category as never));
  }
  if (filters.status) {
    conditions.push(eq(complaints.status, filters.status as never));
  }
  if (filters.priority) {
    conditions.push(eq(complaints.priority, filters.priority as never));
  }
  if (filters.search) {
    conditions.push(ilike(complaints.description, `%${filters.search}%`));
  }
  if (filters.dateFrom) {
    conditions.push(gte(complaints.createdAt, new Date(filters.dateFrom)));
  }
  if (filters.dateTo) {
    conditions.push(lte(complaints.createdAt, new Date(filters.dateTo)));
  }

  const sortColumn =
    filters.sortBy === "priority"
      ? complaints.priority
      : filters.sortBy === "status"
        ? complaints.status
        : complaints.createdAt;
  const orderFn = filters.sortOrder === "asc" ? asc : desc;

  const rows = await db
    .select({
      id: complaints.id,
      residentId: complaints.residentId,
      residentName: users.fullName,
      apartmentNumber: users.apartmentNumber,
      category: complaints.category,
      description: complaints.description,
      photoUrl: complaints.photoUrl,
      status: complaints.status,
      priority: complaints.priority,
      createdAt: complaints.createdAt,
      updatedAt: complaints.updatedAt,
      resolvedAt: complaints.resolvedAt,
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.residentId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderFn(sortColumn));

  let result = rows.map(withOverdue);

  if (filters.overdue !== undefined) {
    result = result.filter((c) => c.isOverdue === filters.overdue);
  }

  // Overdue complaints surface first by default, matching admin triage needs.
  if (!filters.sortBy) {
    result = result.sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  return result;
}

async function getComplaintOrThrow(id: string) {
  const [row] = await db
    .select({
      id: complaints.id,
      residentId: complaints.residentId,
      residentName: users.fullName,
      apartmentNumber: users.apartmentNumber,
      category: complaints.category,
      description: complaints.description,
      photoUrl: complaints.photoUrl,
      status: complaints.status,
      priority: complaints.priority,
      createdAt: complaints.createdAt,
      updatedAt: complaints.updatedAt,
      resolvedAt: complaints.resolvedAt,
    })
    .from(complaints)
    .innerJoin(users, eq(complaints.residentId, users.id))
    .where(eq(complaints.id, id))
    .limit(1);

  if (!row) {
    throw new NotFoundError("Complaint not found");
  }
  return row;
}

export async function getComplaintDetails(user: AuthedUser, id: string) {
  const complaint = await getComplaintOrThrow(id);

  if (user.role === "RESIDENT" && complaint.residentId !== user.id) {
    throw new ForbiddenError("You can only view your own complaints");
  }

  const history = await db
    .select({
      id: complaintHistory.id,
      previousStatus: complaintHistory.previousStatus,
      newStatus: complaintHistory.newStatus,
      note: complaintHistory.note,
      createdAt: complaintHistory.createdAt,
      actorId: complaintHistory.actorId,
      actorName: users.fullName,
      actorRole: users.role,
    })
    .from(complaintHistory)
    .innerJoin(users, eq(complaintHistory.actorId, users.id))
    .where(eq(complaintHistory.complaintId, id))
    .orderBy(asc(complaintHistory.createdAt));

  return { ...withOverdue(complaint), history };
}

export async function updateComplaintStatus(
  admin: AuthedUser,
  id: string,
  input: { status: ComplaintStatus; note?: string }
) {
  return db.transaction(async (tx) => {
    const [complaint] = await tx.select().from(complaints).where(eq(complaints.id, id)).limit(1);
    if (!complaint) {
      throw new NotFoundError("Complaint not found");
    }

    const allowedNext = VALID_TRANSITIONS[complaint.status];
    if (!allowedNext.includes(input.status)) {
      throw new AppError(
        `Cannot change status from ${complaint.status} to ${input.status}`,
        400
      );
    }

    const resolvedAt = input.status === "RESOLVED" ? new Date() : complaint.resolvedAt;

    const [updated] = await tx
      .update(complaints)
      .set({ status: input.status, resolvedAt, updatedAt: new Date() })
      .where(eq(complaints.id, id))
      .returning();

    await tx.insert(complaintHistory).values({
      complaintId: id,
      previousStatus: complaint.status,
      newStatus: input.status,
      actorId: admin.id,
      note: input.note,
    });

    return withOverdue(updated);
  });
}

export async function updateComplaintPriority(id: string, priority: ComplaintPriority) {
  const [complaint] = await db.select().from(complaints).where(eq(complaints.id, id)).limit(1);
  if (!complaint) {
    throw new NotFoundError("Complaint not found");
  }

  const [updated] = await db
    .update(complaints)
    .set({ priority, updatedAt: new Date() })
    .where(eq(complaints.id, id))
    .returning();

  return withOverdue(updated);
}
