import { z } from "zod";

const validDateString = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), {
    message: "Invalid date string.",
  });

const nullableDateString = z.union([validDateString, z.null()]).optional();

export const createAssetSchema = z
  .object({
    assetTag: z.string().trim().min(2).max(50),
    name: z.string().trim().min(2).max(150),
    type: z.enum([
      "LAPTOP",
      "DESKTOP",
      "MONITOR",
      "PHONE",
      "TABLET",
      "PRINTER",
      "ROUTER",
      "SWITCH",
      "ACCESS_POINT",
      "SERVER",
      "OTHER",
    ]),
    serialNumber: z.string().trim().min(1).max(100).optional(),
    status: z
      .enum(["AVAILABLE", "ASSIGNED", "IN_REPAIR", "RETIRED", "LOST"])
      .default("AVAILABLE"),
    condition: z.enum(["NEW", "GOOD", "FAIR", "POOR", "DAMAGED"]).default("GOOD"),
    location: z.string().trim().min(1).max(150).optional(),
    purchaseDate: nullableDateString,
    warrantyExpiryDate: nullableDateString,
    notes: z.string().trim().min(1).max(1000).optional(),
    assignedUserId: z.string().trim().min(1).optional(),
  })
  .strict();