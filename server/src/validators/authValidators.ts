import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(255),
  email: z.string().trim().email("Enter a valid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  apartmentNumber: z.string().trim().min(1, "Apartment number is required").max(50),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
