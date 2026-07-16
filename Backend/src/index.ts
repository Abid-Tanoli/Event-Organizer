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

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:4173',
  'https://event-booking-frontend-iql8rphaa-abid-ali-tanolis-projects.vercel.app',
];

if (process.env.CORS_ORIGIN) {
  allowedOrigins.push(...process.env.CORS_ORIGIN.split(','));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to EventHub API 🚀",
    endpoints: {
      health: "/health",
      api: "/api"
    }
  });
});

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

// For local development - start the HTTP server
if (process.env.NODE_ENV !== 'production') {
  startServer();
}
// For Vercel (production), the serverless function handles DB connection via api/index.ts middleware

export default app;
