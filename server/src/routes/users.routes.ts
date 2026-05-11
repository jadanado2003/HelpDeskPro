import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserRole, type Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { createUserSchema } from "../validators/user.validators";

const router = Router();

function getRouteParam(value: string | string[] | undefined, name: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new HttpError(400, `Invalid ${name} parameter.`);
  }

  return value;
}

const userPublicSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  department: true,
  jobTitle: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const role = typeof req.query.role === "string" ? req.query.role : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    if (role && !Object.values(UserRole).includes(role as UserRole)) {
      throw new HttpError(400, "Invalid user role filter.");
    }

    const users = await prisma.user.findMany({
      where: {
        role: role ? (role as UserRole) : undefined,
        OR: search
          ? [
              { fullName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { department: { contains: search, mode: "insensitive" } },
              { jobTitle: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      select: userPublicSelect,
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
    });

    res.json({
      success: true,
      data: users,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {

    const userId = getRouteParam(req.params.id, "user id");

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userPublicSelect,
    });

    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    res.json({
      success: true,
      data: user,
    });
  })
);

router.post(
  "/",
  validateBody(createUserSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;
    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash,
        role: data.role,
        department: data.department,
        jobTitle: data.jobTitle,
      },
      select: userPublicSelect,
    });

    res.status(201).json({
      success: true,
      data: user,
    });
  })
);

export default router;