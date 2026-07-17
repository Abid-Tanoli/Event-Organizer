import { Router } from "express";
import {
  createPaymentIntent,
  getOrganizerEarnings,
  getPaymentHistory,
  handleWebhook,
  processRefund,
  verifyPayment,
} from "./payment.controller";
import { protect } from "../auth/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";

const router = Router();

// Authenticated user routes
router.post("/create-intent", protect, createPaymentIntent as any);
router.post("/verify", protect, verifyPayment as any);
router.get("/history/:userId", protect, getPaymentHistory as any);

// Organizer + Admin routes - view own earnings
router.get("/earnings/:organizerId", protect, allowRoles("organizer", "admin"), getOrganizerEarnings as any);

// Admin-only routes
router.post("/refund/:ticketId", protect, allowRoles("admin"), processRefund as any);

// Webhook - Stripe calls this externally (currently mock, kept public)
router.post("/webhook", handleWebhook as any);

export default router;
