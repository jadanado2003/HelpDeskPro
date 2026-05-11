import { z } from "zod";

const validDateString = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date string.",
  });

const nullableDateString = z.union([validDateString, z.null()]).optional();

export const createTicketSchema = z
  .object({
    title: z.string().trim().min(3).max(150),
    description: z.string().trim().min(5).max(5000),
    category: z.enum([
      "HARDWARE",
      "SOFTWARE",
      "NETWORK",
      "ACCOUNT_ACCESS",
      "SECURITY",
      "OTHER",
    ]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    requesterId: z.string().trim().min(1),
    technicianId: z.string().trim().min(1).optional(),
    assetId: z.string().trim().min(1).optional(),
    dueAt: nullableDateString,
  })
  .strict();

export const createTicketCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(3000),
    isInternal: z.boolean().default(false),
    authorId: z.string().trim().min(1),
  })
  .strict();

export const updateTicketSchema = z
  .object({
    title: z.string().trim().min(3).max(150).optional(),
    description: z.string().trim().min(5).max(5000).optional(),
    category: z
      .enum(["HARDWARE", "SOFTWARE", "NETWORK", "ACCOUNT_ACCESS", "SECURITY", "OTHER"])
      .optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
    technicianId: z.union([z.string().trim().min(1), z.null()]).optional(),
    assetId: z.union([z.string().trim().min(1), z.null()]).optional(),
    dueAt: nullableDateString,
    actorId: z.string().trim().min(1).optional(),
  })
  .strict();