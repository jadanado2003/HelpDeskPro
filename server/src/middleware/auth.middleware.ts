import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload, Secret } from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { HttpError } from "../utils/httpError";

type AuthTokenPayload = JwtPayload & {
  sub: string;
  role: string;
  email: string;
};

type Role = "ADMIN" | "TECHNICIAN" | "REQUESTER";

function getJwtSecret(): Secret {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set. Add JWT_SECRET to server/.env.");
  }

  return jwtSecret;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new HttpError(401, "Authentication token is required.");
    }

    const token = authHeader.replace("Bearer ", "").trim();

    let decoded: string | JwtPayload;

    try {
      decoded = jwt.verify(token, getJwtSecret()) as string | JwtPayload;
    } catch {
      throw new HttpError(401, "Invalid or expired authentication token.");
    }

    if (typeof decoded === "string" || typeof decoded.sub !== "string") {
      throw new HttpError(401, "Invalid authentication token.");
    }

    const payload = decoded as AuthTokenPayload;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        department: true,
        jobTitle: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new HttpError(401, "Authenticated user no longer exists.");
    }

    if (!user.isActive) {
      throw new HttpError(403, "This user account is inactive.");
    }

    res.locals.currentUser = user;

    next();
  } catch (error) {
    next(error);
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = res.locals.currentUser as { role?: Role } | undefined;

      if (!currentUser) {
        throw new HttpError(401, "Authentication is required.");
      }

      if (!currentUser.role || !allowedRoles.includes(currentUser.role)) {
        throw new HttpError(
          403,
          "You do not have permission to perform this action."
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}