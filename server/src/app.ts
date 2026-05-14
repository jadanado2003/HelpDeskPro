import express from "express";
import cors from "cors";
import healthRoutes from "./routes/health.routes";
import userRoutes from "./routes/users.routes";
import assetRoutes from "./routes/assets.routes";
import ticketRoutes from "./routes/tickets.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth.routes";
import { requireAuth } from "./middleware/auth.middleware";

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/users", requireAuth, userRoutes);
app.use("/api/assets", requireAuth, assetRoutes);
app.use("/api/tickets", requireAuth, ticketRoutes);
app.use("/api/dashboard", requireAuth, dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);