import { api } from "./api";
import type {
  ApiSuccess,
  Complaint,
  ComplaintCategory,
  ComplaintDetails,
  ComplaintPriority,
  ComplaintStatus,
} from "../types";

export interface ComplaintFilters {
  search?: string;
  category?: ComplaintCategory;
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  overdue?: boolean;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "priority" | "status";
  sortOrder?: "asc" | "desc";
}

export async function listComplaints(filters: ComplaintFilters = {}): Promise<Complaint[]> {
  const params: Record<string, string> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params[key] = String(value);
  }
  const res = await api.get<ApiSuccess<Complaint[]>>("/complaints", { params });
  return res.data.data;
}

export async function getComplaint(id: string): Promise<ComplaintDetails> {
  const res = await api.get<ApiSuccess<ComplaintDetails>>(`/complaints/${id}`);
  return res.data.data;
}

export async function createComplaint(input: {
  category: ComplaintCategory;
  description: string;
  photo?: File | null;
}): Promise<Complaint> {
  const form = new FormData();
  form.append("category", input.category);
  form.append("description", input.description);
  if (input.photo) form.append("photo", input.photo);

  const res = await api.post<ApiSuccess<Complaint>>("/complaints", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  note?: string
): Promise<Complaint> {
  const res = await api.patch<ApiSuccess<Complaint>>(`/complaints/${id}/status`, { status, note });
  return res.data.data;
}

export async function updateComplaintPriority(
  id: string,
  priority: ComplaintPriority
): Promise<Complaint> {
  const res = await api.patch<ApiSuccess<Complaint>>(`/complaints/${id}/priority`, { priority });
  return res.data.data;
}
