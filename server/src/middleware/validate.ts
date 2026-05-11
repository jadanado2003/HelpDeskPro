import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { HttpError } from "../utils/httpError";

export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new HttpError(400, "Invalid request body.", result.error.issues);
    }

    req.body = result.data;
    next();
  };
}