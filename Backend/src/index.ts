import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectDB } from "./config/database";
import { logger } from "./middlewares/logger.middleware";

import authRoutes from "./auth/auth.routes";
import userRoutes from "./user/user.routes";
import categoryRoutes from "./category/category.route";
import organizerRoutes from "./organizer/organizer.routes";
import eventRoutes from "./event/event.routes";
import ticketRoutes from "./ticket/ticket.routes";
import paymentRoutes from "./payment/payment.routes";
import adminRoutes from "./admin/admin.routes";

dotenv.config();

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/organizers", organizerRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admins", adminRoutes);

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is running ✅",
    time: new Date().toISOString(),
  });
});

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const startServer = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI not found in .env");

    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🩺 Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Server start failed:", error);
    process.exit(1);
  }
};

// For local development
if (process.env.NODE_ENV !== 'production') {
  startServer();
} else {
  // For Vercel, just connect to DB
  connectDB().catch(err => console.error("❌ DB connection failed:", err));
}

export default app;
