import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";
import { loginSchema } from "../validators/auth.validators";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not set. Add JWT_SECRET to server/.env.");
}

router.post(
  "/login",
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        passwordHash: true,
        role: true,
        department: true,
        jobTitle: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new HttpError(401, "Invalid email or password.");
    }

    if (!user.isActive) {
      throw new HttpError(403, "This user account is inactive.");
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatches) {
      throw new HttpError(401, "Invalid email or password.");
    }

    const token = jwt.sign(
      {
        sub: user.id,
        role: user.role,
        email: user.email,
      },
      jwtSecret,
      {
        expiresIn: "8h",
      }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          department: user.department,
          jobTitle: user.jobTitle,
          isActive: user.isActive,
        },
      },
    });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      success: true,
      data: {
        user: res.locals.currentUser,
      },
    });
  })
);

export default router;