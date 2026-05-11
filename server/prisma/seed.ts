import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  const passwordHash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "alex.morgan@helpdeskpro.local" },
    update: {
      fullName: "Alex Morgan",
      role: "ADMIN",
      department: "IT",
      jobTitle: "IT Administrator",
      isActive: true,
    },
    create: {
      fullName: "Alex Morgan",
      email: "alex.morgan@helpdeskpro.local",
      passwordHash,
      role: "ADMIN",
      department: "IT",
      jobTitle: "IT Administrator",
    },
  });

  const technician = await prisma.user.upsert({
    where: { email: "sam.chen@helpdeskpro.local" },
    update: {
      fullName: "Sam Chen",
      role: "TECHNICIAN",
      department: "IT Support",
      jobTitle: "Service Desk Technician",
      isActive: true,
    },
    create: {
      fullName: "Sam Chen",
      email: "sam.chen@helpdeskpro.local",
      passwordHash,
      role: "TECHNICIAN",
      department: "IT Support",
      jobTitle: "Service Desk Technician",
    },
  });

  const requester = await prisma.user.upsert({
    where: { email: "mia.patel@helpdeskpro.local" },
    update: {
      fullName: "Mia Patel",
      role: "REQUESTER",
      department: "Finance",
      jobTitle: "Accounts Officer",
      isActive: true,
    },
    create: {
      fullName: "Mia Patel",
      email: "mia.patel@helpdeskpro.local",
      passwordHash,
      role: "REQUESTER",
      department: "Finance",
      jobTitle: "Accounts Officer",
    },
  });

  const laptop = await prisma.asset.upsert({
    where: { assetTag: "HDP-LAP-001" },
    update: {
      name: "Dell Latitude 5420",
      type: "LAPTOP",
      serialNumber: "SN-HDP-0001",
      status: "ASSIGNED",
      condition: "GOOD",
      location: "Sydney Office",
      purchaseDate: new Date("2025-01-15"),
      warrantyExpiryDate: new Date("2028-01-15"),
      notes: "Demo laptop asset assigned to a finance user.",
      assignedUserId: requester.id,
    },
    create: {
      assetTag: "HDP-LAP-001",
      name: "Dell Latitude 5420",
      type: "LAPTOP",
      serialNumber: "SN-HDP-0001",
      status: "ASSIGNED",
      condition: "GOOD",
      location: "Sydney Office",
      purchaseDate: new Date("2025-01-15"),
      warrantyExpiryDate: new Date("2028-01-15"),
      notes: "Demo laptop asset assigned to a finance user.",
      assignedUserId: requester.id,
    },
  });

  const printer = await prisma.asset.upsert({
    where: { assetTag: "HDP-PRN-001" },
    update: {
      name: "HP LaserJet Pro M404dn",
      type: "PRINTER",
      serialNumber: "SN-HDP-0002",
      status: "IN_REPAIR",
      condition: "FAIR",
      location: "Sydney Office - Level 2",
      purchaseDate: new Date("2024-06-10"),
      warrantyExpiryDate: new Date("2027-06-10"),
      notes: "Demo printer asset currently marked for repair.",
      assignedUserId: null,
    },
    create: {
      assetTag: "HDP-PRN-001",
      name: "HP LaserJet Pro M404dn",
      type: "PRINTER",
      serialNumber: "SN-HDP-0002",
      status: "IN_REPAIR",
      condition: "FAIR",
      location: "Sydney Office - Level 2",
      purchaseDate: new Date("2024-06-10"),
      warrantyExpiryDate: new Date("2027-06-10"),
      notes: "Demo printer asset currently marked for repair.",
    },
  });

  const monitor = await prisma.asset.upsert({
    where: { assetTag: "HDP-MON-001" },
    update: {
      name: "Dell 24 Inch Monitor",
      type: "MONITOR",
      serialNumber: "SN-HDP-0003",
      status: "AVAILABLE",
      condition: "GOOD",
      location: "Sydney Office - Storage",
      purchaseDate: new Date("2025-03-01"),
      warrantyExpiryDate: new Date("2028-03-01"),
      notes: "Demo monitor available for assignment.",
      assignedUserId: null,
    },
    create: {
      assetTag: "HDP-MON-001",
      name: "Dell 24 Inch Monitor",
      type: "MONITOR",
      serialNumber: "SN-HDP-0003",
      status: "AVAILABLE",
      condition: "GOOD",
      location: "Sydney Office - Storage",
      purchaseDate: new Date("2025-03-01"),
      warrantyExpiryDate: new Date("2028-03-01"),
      notes: "Demo monitor available for assignment.",
    },
  });

  const demoTicketNumbers = ["HDP-DEMO-0001", "HDP-DEMO-0002", "HDP-DEMO-0003"];

  const existingDemoTickets = await prisma.ticket.findMany({
    where: {
      ticketNumber: {
        in: demoTicketNumbers,
      },
    },
    select: {
      id: true,
    },
  });

  const existingDemoTicketIds = existingDemoTickets.map((ticket) => ticket.id);

  if (existingDemoTicketIds.length > 0) {
    await prisma.ticketActivity.deleteMany({
      where: {
        ticketId: {
          in: existingDemoTicketIds,
        },
      },
    });

    await prisma.ticketComment.deleteMany({
      where: {
        ticketId: {
          in: existingDemoTicketIds,
        },
      },
    });
  }

  const wifiTicket = await prisma.ticket.upsert({
    where: { ticketNumber: "HDP-DEMO-0001" },
    update: {
      title: "Laptop cannot connect to Wi-Fi",
      description:
        "The requester reports that their assigned Dell Latitude laptop cannot connect to the office Wi-Fi network.",
      category: "NETWORK",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      requesterId: requester.id,
      technicianId: technician.id,
      assetId: laptop.id,
      dueAt: new Date("2026-05-15"),
      resolvedAt: null,
      closedAt: null,
    },
    create: {
      ticketNumber: "HDP-DEMO-0001",
      title: "Laptop cannot connect to Wi-Fi",
      description:
        "The requester reports that their assigned Dell Latitude laptop cannot connect to the office Wi-Fi network.",
      category: "NETWORK",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      requesterId: requester.id,
      technicianId: technician.id,
      assetId: laptop.id,
      dueAt: new Date("2026-05-15"),
    },
  });

  const printerTicket = await prisma.ticket.upsert({
    where: { ticketNumber: "HDP-DEMO-0002" },
    update: {
      title: "Printer showing paper jam error",
      description:
        "The shared printer on Level 2 is showing a recurring paper jam error even after the tray has been cleared.",
      category: "HARDWARE",
      priority: "MEDIUM",
      status: "OPEN",
      requesterId: admin.id,
      technicianId: null,
      assetId: printer.id,
      dueAt: new Date("2026-05-18"),
      resolvedAt: null,
      closedAt: null,
    },
    create: {
      ticketNumber: "HDP-DEMO-0002",
      title: "Printer showing paper jam error",
      description:
        "The shared printer on Level 2 is showing a recurring paper jam error even after the tray has been cleared.",
      category: "HARDWARE",
      priority: "MEDIUM",
      status: "OPEN",
      requesterId: admin.id,
      assetId: printer.id,
      dueAt: new Date("2026-05-18"),
    },
  });

  const accountTicket = await prisma.ticket.upsert({
    where: { ticketNumber: "HDP-DEMO-0003" },
    update: {
      title: "Password reset required for finance system",
      description:
        "The requester needs their finance system password reset after multiple failed login attempts.",
      category: "ACCOUNT_ACCESS",
      priority: "LOW",
      status: "RESOLVED",
      requesterId: requester.id,
      technicianId: technician.id,
      assetId: null,
      dueAt: new Date("2026-05-12"),
      resolvedAt: new Date(),
      closedAt: null,
    },
    create: {
      ticketNumber: "HDP-DEMO-0003",
      title: "Password reset required for finance system",
      description:
        "The requester needs their finance system password reset after multiple failed login attempts.",
      category: "ACCOUNT_ACCESS",
      priority: "LOW",
      status: "RESOLVED",
      requesterId: requester.id,
      technicianId: technician.id,
      dueAt: new Date("2026-05-12"),
      resolvedAt: new Date(),
    },
  });

  await prisma.ticketComment.createMany({
    data: [
      {
        ticketId: wifiTicket.id,
        authorId: technician.id,
        body: "Checked the laptop network settings and confirmed the issue happens only on the office Wi-Fi.",
        isInternal: true,
      },
      {
        ticketId: printerTicket.id,
        authorId: admin.id,
        body: "Printer issue reported by multiple staff members on Level 2.",
        isInternal: false,
      },
      {
        ticketId: accountTicket.id,
        authorId: technician.id,
        body: "Password reset completed and requester confirmed access has been restored.",
        isInternal: false,
      },
    ],
  });

  await prisma.ticketActivity.createMany({
    data: [
      {
        ticketId: wifiTicket.id,
        actorId: requester.id,
        type: "CREATED",
        message: "Ticket HDP-DEMO-0001 was created.",
      },
      {
        ticketId: wifiTicket.id,
        actorId: technician.id,
        type: "ASSIGNED",
        message: "Ticket was assigned to Sam Chen.",
      },
      {
        ticketId: wifiTicket.id,
        actorId: technician.id,
        type: "STATUS_CHANGED",
        message: "Status changed from OPEN to IN_PROGRESS.",
        previousStatus: "OPEN",
        newStatus: "IN_PROGRESS",
      },
      {
        ticketId: printerTicket.id,
        actorId: admin.id,
        type: "CREATED",
        message: "Ticket HDP-DEMO-0002 was created.",
      },
      {
        ticketId: accountTicket.id,
        actorId: requester.id,
        type: "CREATED",
        message: "Ticket HDP-DEMO-0003 was created.",
      },
      {
        ticketId: accountTicket.id,
        actorId: technician.id,
        type: "RESOLVED",
        message: "Ticket was resolved after password reset.",
        previousStatus: "IN_PROGRESS",
        newStatus: "RESOLVED",
      },
    ],
  });

  console.log("HelpDeskPro demo data seeded successfully.");
  console.log("Demo login emails:");
  console.log("- alex.morgan@helpdeskpro.local");
  console.log("- sam.chen@helpdeskpro.local");
  console.log("- mia.patel@helpdeskpro.local");
  console.log("Demo password for all seeded users: Password123");

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});