# HelpDeskPro

HelpDeskPro is a full-stack IT helpdesk ticketing and asset management system built to simulate real-world ICT support workflows.

The application allows users to manage support tickets, IT assets, users, ticket comments, internal notes, status updates, priority changes, dashboard analytics, authentication, and role-based permissions.

This project was built as a portfolio project to demonstrate practical full-stack development skills in a realistic IT service desk environment.

---

## Project Purpose

I built HelpDeskPro to demonstrate that I can design and develop a realistic business application using modern full-stack technologies.

The project is based on common workflows used by IT support teams, including:

- Creating and managing support tickets
- Tracking ticket priority and status
- Linking tickets to IT assets
- Adding comments and internal support notes
- Viewing ticket activity history
- Managing users and roles
- Managing laptops, monitors, printers, phones, and other IT assets
- Viewing dashboard statistics for tickets and assets
- Securing backend routes with JWT authentication
- Applying role-based backend permission checks

HelpDeskPro is designed to be more than a basic CRUD app. It shows how software can support real ICT service desk operations.

---

## Current Features

### Authentication

- Login page for demo users
- JWT-based backend authentication
- Protected backend API routes
- Frontend session handling using local storage
- Logout functionality
- Authenticated user display in the sidebar

### Role-Based Access

The backend includes role-based permission checks.

Current roles:

- Admin
- Technician
- Requester

Examples of permission rules:

- Admin users can create users
- Admins and technicians can manage assets
- Admins and technicians can update ticket status and priority
- Requesters can create tickets and add comments
- Protected routes require a valid JWT token

### Dashboard

The dashboard displays live statistics from the backend and PostgreSQL database, including:

- Total tickets
- Tickets in progress
- Critical tickets
- Total assets
- Recent tickets
- Ticket status distribution

### User Management

- View users
- Search users
- Create new users
- Display user role, department, job title, and account status

### Ticket Management

- View all tickets
- Search tickets
- Create new tickets
- View detailed ticket records
- Link tickets to requesters, technicians, and assets
- Update ticket status
- Update ticket priority
- Add comments
- Add internal notes
- View ticket activity history
- View SLA-related dates such as due date, resolved date, and closed date

### Asset Management

- View IT assets
- Search assets
- Create new assets
- View detailed asset records
- Track asset tag, serial number, type, status, condition, and location
- Track purchase date and warranty expiry date
- Assign assets to users
- View related tickets linked to an asset

### Demo Data

The project includes a seed script that creates demo users, assets, tickets, comments, and ticket activity history.

Demo users include:

- Admin user
- Technician user
- Requester user

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- Axios
- Lucide React

### Backend

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Supabase PostgreSQL
- Zod
- JSON Web Tokens
- bcryptjs

### Development Tools

- Git
- GitHub
- npm
- Vite
- Prisma CLI

---

## Project Structure

```text
HelpDeskPro/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── src/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── lib/
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
│
└── README.md