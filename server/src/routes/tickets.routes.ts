import { Router } from "express";
import {
  TicketCategory,
  TicketPriority,
  TicketStatus,
  type Prisma,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { validateBody } from "../middleware/validate";
import { asyncHandler } from "../utils/asyncHandler";
import { HttpError } from "../utils/httpError";

import {
  createTicketCommentSchema,
  createTicketSchema,
  updateTicketSchema,
} from "../validators/ticket.validators";

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

function hasOwnProperty(object: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(object, key);
}

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  department: true,
  jobTitle: true,
} satisfies Prisma.UserSelect;

const ticketListInclude = {
  requester: {
    select: publicUserSelect,
  },
  technician: {
    select: publicUserSelect,
  },
  asset: true,
} satisfies Prisma.TicketInclude;

const ticketDetailInclude = {
  requester: {
    select: publicUserSelect,
  },
  technician: {
    select: publicUserSelect,
  },
  asset: true,
  comments: {
    include: {
      author: {
        select: publicUserSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
  activities: {
    include: {
      actor: {
        select: publicUserSelect,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.TicketInclude;

async function generateTicketNumber(tx: Prisma.TransactionClient): Promise<string> {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");

  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(now);
  endOfDay.setUTCHours(23, 59, 59, 999);

  const countToday = await tx.ticket.count({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const sequence = String(countToday + 1).padStart(4, "0");
  return `HDP-${datePart}-${sequence}`;
}

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const priority = typeof req.query.priority === "string" ? req.query.priority : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

    if (status && !Object.values(TicketStatus).includes(status as TicketStatus)) {
      throw new HttpError(400, "Invalid ticket status filter.");
    }

    if (priority && !Object.values(TicketPriority).includes(priority as TicketPriority)) {
      throw new HttpError(400, "Invalid ticket priority filter.");
    }

    if (category && !Object.values(TicketCategory).includes(category as TicketCategory)) {
      throw new HttpError(400, "Invalid ticket category filter.");
    }

    const tickets = await prisma.ticket.findMany({
      where: {
        status: status ? (status as TicketStatus) : undefined,
        priority: priority ? (priority as TicketPriority) : undefined,
        category: category ? (category as TicketCategory) : undefined,
        OR: search
          ? [
              { ticketNumber: { contains: search, mode: "insensitive" } },
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
            ]
          : undefined,
      },
      include: ticketListInclude,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: tickets,
    });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const ticketId = getRouteParam(req.params.id, "ticket id");

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: ticketDetailInclude,
    });

    if (!ticket) {
      throw new HttpError(404, "Ticket not found.");
    }

    res.json({
      success: true,
      data: ticket,
    });
  })
);

router.post(
  "/",
  validateBody(createTicketSchema),
  asyncHandler(async (req, res) => {
    const data = req.body;

    const ticket = await prisma.$transaction(async (tx) => {
      const ticketNumber = await generateTicketNumber(tx);

      const createdTicket = await tx.ticket.create({
        data: {
          ticketNumber,
          title: data.title,
          description: data.description,
          category: data.category,
          priority: data.priority,
          requesterId: data.requesterId,
          technicianId: data.technicianId,
          assetId: data.assetId,
          dueAt: toOptionalDate(data.dueAt),
        },
      });

      await tx.ticketActivity.create({
        data: {
          type: "CREATED",
          message: `Ticket ${ticketNumber} was created.`,
          ticketId: createdTicket.id,
          actorId: data.requesterId,
        },
      });

      return tx.ticket.findUniqueOrThrow({
        where: { id: createdTicket.id },
        include: ticketDetailInclude,
      });
    });

    res.status(201).json({
      success: true,
      data: ticket,
    });
  })
);

router.patch(
  "/:id",
  validateBody(updateTicketSchema),
  asyncHandler(async (req, res) => {
    const ticketId = getRouteParam(req.params.id, "ticket id");
    const data = req.body;

    const ticket = await prisma.$transaction(async (tx) => {
      const existingTicket = await tx.ticket.findUnique({
        where: { id: ticketId },
      });

      if (!existingTicket) {
        throw new HttpError(404, "Ticket not found.");
      }

      const updateData: Prisma.TicketUncheckedUpdateInput = {};
      const activities: Prisma.TicketActivityUncheckedCreateInput[] = [];

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;

      if (data.priority !== undefined) {
        updateData.priority = data.priority;

        if (data.priority !== existingTicket.priority) {
          activities.push({
            type: "PRIORITY_CHANGED",
            message: `Priority changed from ${existingTicket.priority} to ${data.priority}.`,
            previousPriority: existingTicket.priority,
            newPriority: data.priority,
            ticketId: existingTicket.id,
            actorId: data.actorId,
          });
        }
      }

      if (data.status !== undefined) {
        updateData.status = data.status;

        if (data.status === "RESOLVED" && existingTicket.status !== "RESOLVED") {
          updateData.resolvedAt = new Date();
        }

        if (data.status === "CLOSED" && existingTicket.status !== "CLOSED") {
          updateData.closedAt = new Date();
        }

        if (data.status === "OPEN" || data.status === "IN_PROGRESS") {
          updateData.resolvedAt = null;
          updateData.closedAt = null;
        }

        if (data.status !== existingTicket.status) {
          const activityType =
            data.status === "RESOLVED"
              ? "RESOLVED"
              : data.status === "CLOSED"
                ? "CLOSED"
                : data.status === "OPEN" && existingTicket.status !== "OPEN"
                  ? "REOPENED"
                  : "STATUS_CHANGED";

          activities.push({
            type: activityType,
            message: `Status changed from ${existingTicket.status} to ${data.status}.`,
            previousStatus: existingTicket.status,
            newStatus: data.status,
            ticketId: existingTicket.id,
            actorId: data.actorId,
          });
        }
      }

      if (hasOwnProperty(data, "technicianId")) {
        updateData.technicianId = data.technicianId;

        if (data.technicianId !== existingTicket.technicianId) {
          activities.push({
            type: "ASSIGNED",
            message: data.technicianId
              ? "Ticket technician assignment was updated."
              : "Ticket technician was removed.",
            ticketId: existingTicket.id,
            actorId: data.actorId,
          });
        }
      }

      if (hasOwnProperty(data, "assetId")) {
        updateData.assetId = data.assetId;

        if (data.assetId !== existingTicket.assetId) {
          activities.push({
            type: "ASSET_LINKED",
            message: data.assetId
              ? "Ticket linked asset was updated."
              : "Ticket linked asset was removed.",
            ticketId: existingTicket.id,
            actorId: data.actorId,
          });
        }
      }

      if (hasOwnProperty(data, "dueAt")) {
        updateData.dueAt = toOptionalDate(data.dueAt);
      }

      await tx.ticket.update({
        where: { id: existingTicket.id },
        data: updateData,
      });

      for (const activity of activities) {
        await tx.ticketActivity.create({
          data: activity,
        });
      }

      return tx.ticket.findUniqueOrThrow({
        where: { id: existingTicket.id },
        include: ticketDetailInclude,
      });
    });

    res.json({
      success: true,
      data: ticket,
    });
  })
);

router.post(
  "/:id/comments",
  validateBody(createTicketCommentSchema),
  asyncHandler(async (req, res) => {
    const ticketId = getRouteParam(req.params.id, "ticket id");
    const data = req.body;

    const comment = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { id: ticketId },
        select: {
          id: true,
          ticketNumber: true,
        },
      });

      if (!ticket) {
        throw new HttpError(404, "Ticket not found.");
      }

      const createdComment = await tx.ticketComment.create({
        data: {
          body: data.body,
          isInternal: data.isInternal,
          ticketId: ticket.id,
          authorId: data.authorId,
        },
        include: {
          author: {
            select: publicUserSelect,
          },
        },
      });

      await tx.ticketActivity.create({
        data: {
          type: "COMMENT_ADDED",
          message: data.isInternal
            ? "Internal note added to ticket."
            : "Comment added to ticket.",
          ticketId: ticket.id,
          actorId: data.authorId,
        },
      });

      return createdComment;
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  })
);

export default router;