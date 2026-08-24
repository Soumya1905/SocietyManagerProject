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

export interface AuthTokenPayload {
  sub: string;
  role: Role;
  email: string;
}

export interface AuthedUser {
  id: string;
  role: Role;
  email: string;
  fullName: string;
  apartmentNumber: string;
}
