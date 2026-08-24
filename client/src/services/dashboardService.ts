import { api } from "./api";
import type { AdminDashboard, ApiSuccess, ResidentDashboard } from "../types";

export async function getResidentDashboard(): Promise<ResidentDashboard> {
  const res = await api.get<ApiSuccess<ResidentDashboard>>("/dashboard/resident");
  return res.data.data;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const res = await api.get<ApiSuccess<AdminDashboard>>("/dashboard/admin");
  return res.data.data;
}
