export type Role = "RESIDENT" | "ADMIN";
export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH";
export type ComplaintCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "SECURITY"
  | "CLEANLINESS"
  | "LIFT"
  | "PARKING"
  | "WATER_SUPPLY"
  | "OTHER";

export interface User {
  id: string;
  fullName: string;
  email: string;
  apartmentNumber: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  id: string;
  residentId: string;
  residentName?: string;
  apartmentNumber?: string;
  category: ComplaintCategory;
  description: string;
  photoUrl: string | null;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  isOverdue: boolean;
  overdueDays: number;
}

export interface ComplaintHistoryEntry {
  id: string;
  previousStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  note: string | null;
  createdAt: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
}

export interface ComplaintDetails extends Complaint {
  history: ComplaintHistoryEntry[];
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

export interface ResidentDashboard {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };
  recentComplaints: Complaint[];
  latestNotices: Notice[];
}

export interface AdminDashboard {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    overdue: number;
  };
  byStatus: Record<ComplaintStatus, number>;
  byCategory: Partial<Record<ComplaintCategory, number>>;
  recentComplaints: Complaint[];
  highPriorityComplaints: Complaint[];
  overdueComplaints: Complaint[];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}
