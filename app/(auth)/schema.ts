import { z } from "zod";


export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required"),

  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address"),

  address: z
    .string()
    .min(1, "Address is required"),

  contact: z
    .string()
    .min(7, "Contact number is too short")
    .regex(/^[0-9+]+$/, "Invalid contact number"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});


export type RegisterFormData = z.infer<typeof registerSchema>;
