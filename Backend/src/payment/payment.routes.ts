import { Router } from "express";
import {
  createPaymentIntent,
  getOrganizerEarnings,
  getPaymentHistory,
  handleWebhook,
  processRefund,
  verifyPayment,
} from "./payment.controller";

const router: Router = Router();

router.post("/create-intent", createPaymentIntent as any);
router.post("/verify", verifyPayment as any);
router.get("/history/:userId", getPaymentHistory as any);
router.get("/earnings/:organizerId", getOrganizerEarnings as any);
router.post("/refund/:ticketId", processRefund as any);
router.post("/webhook", handleWebhook as any);

export default router;