import { Router } from "express";
import { AssetStatus, AssetType, type Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { createAssetSchema } from "../validators/asset.validators";

const router = Router();

function getRouteParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `Invalid ${name} parameter.`);
  }

  return value;
}

function toOptionalDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return new Date(value);
}

const assetInclude = {
  assignedUser: {
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      department: true,
      jobTitle: true,
    },
  },
} satisfies Prisma.AssetInclude;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const type = typeof req.query.type === "string" ? req.query.type : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    if (status && !Object.values(AssetStatus).includes(status as AssetStatus)) {
      throw new HttpError(400, "Invalid asset status filter.");
    }

    if (type && !Object.values(AssetType).includes(type as AssetType)) {
      throw new HttpError(400, "Invalid asset type filter.");
    }

    const assets = await prisma.asset.findMany({
      where: {
        status: status ? (status as AssetStatus) : undefined,
        type: type ? (type as AssetType) : undefined,
        OR: search
          ? [
              { assetTag: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { serialNumber: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: assetInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: assets,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const assetId = getRouteParam(req.params.id, "asset id");

    const asset = await prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        ...assetInclude,
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            title: true,
            status: true,
            priority: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!asset) {
      throw new HttpError(404, "Asset not found.");
    }

    res.json({
      success: true,
      data: asset,
    });
  })
);

router.post(
  "/",
  validateBody(createAssetSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;

    const asset = await prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        name: data.name,
        type: data.type,
        serialNumber: data.serialNumber,
        status: data.status,
        condition: data.condition,
        location: data.location,
        purchaseDate: toOptionalDate(data.purchaseDate),
        warrantyExpiryDate: toOptionalDate(data.warrantyExpiryDate),
        notes: data.notes,
        assignedUserId: data.assignedUserId,
      },
      include: assetInclude,
    });

    res.status(201).json({
      success: true,
      data: asset,
    });
  })
);

export default router;