import { Router } from "express";
import { prisma } from "../lib/prisma";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      criticalTickets,
      totalAssets,
      availableAssets,
      assignedAssets,
      assetsInRepair,
      retiredAssets,
      ticketsByStatus,
      ticketsByPriority,
      ticketsByCategory,
      assetsByStatus,
      recentTickets,
    ] = await prisma.$transaction([
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: "OPEN" } }),
      prisma.ticket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.ticket.count({ where: { status: "RESOLVED" } }),
      prisma.ticket.count({ where: { status: "CLOSED" } }),
      prisma.ticket.count({ where: { priority: "CRITICAL" } }),

      prisma.asset.count(),
      prisma.asset.count({ where: { status: "AVAILABLE" } }),
      prisma.asset.count({ where: { status: "ASSIGNED" } }),
      prisma.asset.count({ where: { status: "IN_REPAIR" } }),
      prisma.asset.count({ where: { status: "RETIRED" } }),

      prisma.ticket.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),

      prisma.ticket.groupBy({
        by: ["priority"],
        _count: {
          _all: true,
        },
      }),

      prisma.ticket.groupBy({
        by: ["category"],
        _count: {
          _all: true,
        },
      }),

      prisma.asset.groupBy({
        by: ["status"],
        _count: {
          _all: true,
        },
      }),

      prisma.ticket.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          ticketNumber: true,
          title: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          requester: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          technician: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          asset: {
            select: {
              id: true,
              assetTag: true,
              name: true,
              type: true,
              status: true,
            },
          },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalTickets,
          openTickets,
          inProgressTickets,
          resolvedTickets,
          closedTickets,
          criticalTickets,
          totalAssets,
          availableAssets,
          assignedAssets,
          assetsInRepair,
          retiredAssets,
        },
        charts: {
          ticketsByStatus: ticketsByStatus.map((item) => ({
            status: item.status,
            count: item._count._all,
          })),
          ticketsByPriority: ticketsByPriority.map((item) => ({
            priority: item.priority,
            count: item._count._all,
          })),
          ticketsByCategory: ticketsByCategory.map((item) => ({
            category: item.category,
            count: item._count._all,
          })),
          assetsByStatus: assetsByStatus.map((item) => ({
            status: item.status,
            count: item._count._all,
          })),
        },
        recentTickets,
      },
    });
  })
);

export default router;