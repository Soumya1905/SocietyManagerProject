import { api } from "./api";
import type { ApiSuccess, User } from "../types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  apartmentNumber: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

export async function login(payload: LoginPayload): Promise<AuthResult> {
  const res = await api.post<ApiSuccess<AuthResult>>("/auth/login", payload);
  return res.data.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResult> {
  const res = await api.post<ApiSuccess<AuthResult>>("/auth/register", payload);
  return res.data.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get<ApiSuccess<User>>("/auth/me");
  return res.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
