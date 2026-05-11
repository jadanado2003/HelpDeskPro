import { z } from "zod";

export const createUserSchema = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    email: z.string().trim().email().toLowerCase(),
    password: z.string().min(8).max(128),
    role: z.enum(["ADMIN", "TECHNICIAN", "REQUESTER"]).default("REQUESTER"),
    department: z.string().trim().min(1).max(100).optional(),
    jobTitle: z.string().trim().min(1).max(100).optional(),
  })
  .strict();