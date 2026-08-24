import { api } from "./api";
import type { ApiSuccess, Notice } from "../types";

export async function listNotices(): Promise<Notice[]> {
  const res = await api.get<ApiSuccess<Notice[]>>("/notices");
  return res.data.data;
}

export async function createNotice(input: {
  title: string;
  content: string;
  isImportant: boolean;
}): Promise<Notice> {
  const res = await api.post<ApiSuccess<Notice>>("/notices", input);
  return res.data.data;
}

export async function updateNotice(
  id: string,
  input: Partial<{ title: string; content: string; isImportant: boolean }>
): Promise<Notice> {
  const res = await api.patch<ApiSuccess<Notice>>(`/notices/${id}`, input);
  return res.data.data;
}

export async function deleteNotice(id: string): Promise<void> {
  await api.delete(`/notices/${id}`);
}
